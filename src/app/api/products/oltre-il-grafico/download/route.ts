import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { isDatabaseConfigured } from '@/lib/db/prisma';
import { hasOneTimeProductAccess } from '@/lib/entitlements-grants';
import { getOltreIlGraficoStream } from '@/lib/storage';
import { checkAndConsumeDownload } from '@/lib/security/download-rate-limit';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

const FILENAME = 'Oltre-Il-Grafico.pdf';
const CONTENT_TYPE = 'application/pdf';
const PRODUCT_SLUG = 'oltre-il-grafico-pdf';

export async function GET(req: NextRequest) {
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

  const isAdmin = isAdminSession(session as any);

  if (!isAdmin) {
    const rateResult = await checkAndConsumeDownload(userEmail, [
      {
        scope: 'oltre-il-grafico',
        resourceKey: 'pdf',
        windowSizeMinutes: 60,
        maxCount: 3,
      },
    ]);
    if (!rateResult.allowed) {
      const retryAfter = rateResult.retryAfterSeconds ?? 3600;
      return new NextResponse(
        'Hai raggiunto il limite temporaneo di download. Riprova più tardi.',
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'Cache-Control': 'private, no-store',
          },
        },
      );
    }
  }

  if (!isAdmin) {
    const hasAccess = await hasOneTimeProductAccess(userEmail, PRODUCT_SLUG);
    if (!hasAccess) {
      return new NextResponse(
        'Nessun acquisto di Oltre il Grafico riuscito associato a questo account.',
        { status: 403 },
      );
    }
  }

  const stream = await getOltreIlGraficoStream('pdf');
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

  const encoded = encodeURIComponent(FILENAME);

  return new NextResponse(stream.stream as any, {
    headers: {
      'Content-Type': stream.contentType || CONTENT_TYPE,
      'Content-Disposition': `attachment; filename="${encoded.replace(/"/g, '\\"')}"; filename*=UTF-8''${encoded}`,
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      ...(typeof stream.contentLength === 'number'
        ? { 'Content-Length': String(stream.contentLength) }
        : {}),
    },
  });
}
