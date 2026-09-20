import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { getMarketLensStream, MARKET_LENS_STORAGE_KEYS, type MarketLensKind } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

const FILENAMES: Record<MarketLensKind, string> = {
  indicator: 'AV-Market-Lens.pine',
  guide: 'AV-Market-Lens-Guida.pdf',
};

const CONTENT_TYPES: Record<MarketLensKind, string> = {
  indicator: 'text/plain; charset=utf-8',
  guide: 'application/pdf',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string }> },
) {
  const { kind } = await params;

  if (!kind || typeof kind !== 'string' || !(kind in MARKET_LENS_STORAGE_KEYS)) {
    return new NextResponse('Risorsa non valida', { status: 404 });
  }

  const validKind = kind as MarketLensKind;

  if (!isDatabaseConfigured()) {
    return new NextResponse('Servizio non disponibile', { status: 503 });
  }

  const session = await auth().catch(() => null);
  if (!session?.user) {
    return new NextResponse('Autenticazione richiesta', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Google' },
    });
  }

  const userEmail = normalizeEmail(session.user.email);
  if (!userEmail) {
    return new NextResponse('Account non valido', { status: 400 });
  }

  const purchase = await prisma.purchase.findFirst({
    where: {
      userEmail,
      productSlug: 'market-lens',
      status: 'succeeded',
    },
    select: { id: true, status: true },
  });

  if (!purchase) {
    return new NextResponse(
      'Nessun acquisto AV Market Lens riuscito associato a questo account.',
      { status: 403 },
    );
  }

  const stream = await getMarketLensStream(validKind);
  if (!stream.ok) {
    if (stream.error === 'UNCONFIGURED') {
      return new NextResponse(stream.message || 'Storage non configurato', { status: 503 });
    }
    if (stream.error === 'NOT_FOUND') {
      return new NextResponse(stream.message || 'File non disponibile', { status: 404 });
    }
    return new NextResponse(stream.message || 'Impossibile recuperare il file', {
      status: 500,
    });
  }

  if (typeof stream.contentLength === 'number' && stream.contentLength <= 0) {
    return new NextResponse(
      'File corrotto o vuoto sullo storage. Contattare l\'amministrazione per ricaricare il file.',
      { status: 500 },
    );
  }

  const filename = FILENAMES[validKind];
  const encoded = encodeURIComponent(filename);

  return new NextResponse(stream.stream as any, {
    headers: {
      'Content-Type': stream.contentType || CONTENT_TYPES[validKind],
      'Content-Disposition': `attachment; filename="${encoded.replace(/"/g, '\\"')}"; filename*=UTF-8''${encoded}`,
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      ...(typeof stream.contentLength === 'number'
        ? { 'Content-Length': String(stream.contentLength) }
        : {}),
    },
  });
}
