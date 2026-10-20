import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: {
      id?: string;
    } & DefaultSession['user'];
  }
  interface JWT {
    id?: string;
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

// Registra/aggiorna l'account al login Google, anche senza acquisti.
// Errori di database non bloccano il login.
async function recordGoogleAccount(
  user: { email?: string | null; name?: string | null; image?: string | null } | undefined,
  account?: { providerAccountId?: string } | null,
): Promise<void> {
  const email = normalizeEmail(user?.email);
  if (!email || !isDatabaseConfigured()) return;
  try {
    const profile = {
      name: user?.name ?? undefined,
      image: user?.image ?? undefined,
      googleId: account?.providerAccountId ?? undefined,
    };
    await prisma.user.upsert({
      where: { email },
      create: { email, ...profile },
      update: profile,
    });
  } catch (error) {
    console.error('[auth] Salvataggio account Google non riuscito:', error);
  }
}

const authConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      await recordGoogleAccount(user, account);
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      const normalized = normalizeEmail(user?.email ?? token.email);
      if (normalized) token.email = normalized;
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = String(token.id);
      }
      if (session.user) {
        const normalized = normalizeEmail(session.user.email ?? token.email);
        if (normalized) {
          session.user.email = normalized;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/area-membri`;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
