export function getSiteUrl(): string {
  const fromPublic = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromPublic && typeof fromPublic === 'string' && fromPublic.length > 0) {
    return fromPublic.replace(/\/+$/, '');
  }
  const fromAuth = process.env.AUTH_URL;
  if (fromAuth && typeof fromAuth === 'string' && fromAuth.length > 0) {
    return fromAuth.replace(/\/+$/, '');
  }
  return 'http://localhost:3000';
}
