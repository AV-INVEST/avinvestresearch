import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

export function getAuthEnvGuardMessage(): string | null {
  const secret = process.env.AUTH_SECRET;
  const googleId = process.env.AUTH_GOOGLE_ID;
  const googleSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!secret || secret.length < 16 || secret.includes('replace-with-strong')) {
    return 'Autenticazione non configurata: imposta AUTH_SECRET (min. 32 caratteri casuali) nelle variabili ambiente.';
  }
  if (!googleId || !googleSecret) {
    return 'Autenticazione Google non disponibile: imposta AUTH_GOOGLE_ID e AUTH_GOOGLE_SECRET nelle variabili ambiente.';
  }
  return null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = String(token.id);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/area-membri`;
    },
  },
});
