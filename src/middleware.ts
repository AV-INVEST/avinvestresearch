import type { NextRequest } from 'next/server';
export { auth as default } from '@/auth';

export const config = {
  runtime: 'nodejs',
  matcher: ['/area-membri', '/area-membri/:path*'],
};
