import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { getResearchClubEntitlement } from '@/lib/entitlements';
import { getPdfStream } from '@/lib/storage';
import { checkAndConsumeDownload } from '@/lib/security/download-rate-limit';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return new NextResponse('Invalid document identifier', { status: 400 });
  }

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
        scope: 'research-club',
        resourceKey: `research:${id}`,
        windowSizeMinutes: 60,
        maxCount: 2,
      },
      {
        scope: 'research-club',
        resourceKey: 'global-day',
        windowSizeMinutes: 1440,
        maxCount: 8,
      },
    ]);
    if (!rateResult.allowed) {
      const retryAfter = rateResult.retryAfterSeconds ?? 3600;
      return new NextResponse(
        'Hai raggiunto il limite temporaneo di consultazione. Riprova più tardi.',
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

  const doc = await prisma.researchDoc.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      storageObjectKey: true,
      pdfFileName: true,
      pdfFileSizeBytes: true,
    },
  });

  if (!doc) {
    return new NextResponse('Documento inesistente', { status: 404 });
  }

  if (!doc.storageObjectKey) {
    return new NextResponse('Documento privo di allegato', { status: 404 });
  }

  const isPublished = doc.status === 'PUBLISHED';

  if (!isAdmin) {
    if (!isPublished) {
      return new NextResponse('Accesso negato', { status: 403 });
    }
    const rcEntitlement = userEmail
      ? await getResearchClubEntitlement(undefined, userEmail)
      : null;
    if (!rcEntitlement || !rcEntitlement.accessGranted) {
      return new NextResponse('Abbonamento Research Club richiesto', { status: 403 });
    }
  }

  const stream = await getPdfStream(doc.storageObjectKey);
  if (!stream.ok) {
    return new NextResponse(stream.error || 'Impossibile recuperare il documento', {
      status: 500,
    });
  }

  const filename = doc.pdfFileName || 'ricerca-av-invest.pdf';
  const encoded = typeof window !== 'undefined' ? encodeURIComponent(filename) : filename;

  return new NextResponse(stream.stream as any, {
    headers: {
      'Content-Type': stream.contentType || 'application/pdf',
      'Content-Disposition': `inline; filename="${encoded.replace(/"/g, '\\"')}"; filename*=UTF-8''${encoded}`,
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
      'Content-Security-Policy': "frame-ancestors 'self'; default-src 'none'; object-src 'self'; plugin-types application/pdf",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      ...(doc.pdfFileSizeBytes
        ? { 'Content-Length': String(doc.pdfFileSizeBytes) }
        : {}),
    },
  });
}
