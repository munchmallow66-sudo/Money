import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { prisma } from './prisma';

// Auth.js v5 automatically infers AUTH_URL on Vercel deployments.
// Ensure AUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET are set in the Vercel dashboard.

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  // Pure JWT strategy — no PrismaAdapter required
  // Users are synced to the database manually in the signIn callback
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ['pkce'],
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/',
    error: '/',
    newUser: '/dashboard',
  },
  cookies: {
    pkceCodeVerifier: {
      name: 'authjs.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900,
      },
    },
  },
  callbacks: {
    // JWT callback: persist the database user ID into the token
    jwt: async ({ token, user, account, profile }) => {
      if (account && profile) {
        // On sign-in, upsert user to DB and store the DB user ID in the token
        try {
          const email = profile.email!;
          const dbUser = await prisma.user.upsert({
            where: { email },
            update: {
              name: profile.name ?? undefined,
              image: (profile as any).picture ?? (profile as any).image ?? undefined,
            },
            create: {
              email,
              name: profile.name ?? null,
              image: (profile as any).picture ?? (profile as any).image ?? null,
            },
          });
          token.sub = dbUser.id; // Use the database cuid as user ID
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image;
          console.log(`[Auth] Synced user to DB: ${dbUser.email} (${dbUser.id})`);
        } catch (error) {
          console.error('[Auth] Failed to sync user to DB:', error);
          // Fallback: use the provider's user ID (may cause FK issues)
          if (user) {
            token.sub = user.id;
          }
        }
      }
      return token;
    },
    // Session callback: expose the DB user ID to the client
    session: async ({ session, token }) => {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token?.email && session.user) {
        session.user.email = token.email as string;
      }
      if (token?.name && session.user) {
        session.user.name = token.name as string;
      }
      if (token?.picture && session.user) {
        session.user.image = token.picture as string;
      }
      return session;
    },
    // Allow all Google sign-ins
    signIn: async ({ account }) => {
      if (account?.provider === 'google') {
        return true;
      }
      return true;
    },
  },
  events: {
    signIn: async ({ user, isNewUser }) => {
      console.log(`[Auth] User signed in: ${user.email}, isNewUser: ${isNewUser}`);
    },
    signOut: async () => {
      console.log('[Auth] User signed out');
    },
  },
  logger: {
    error: (code, ...message) => {
      const errorStr = message.join(' ');
      if (errorStr.includes('ERR_BLOCKED_BY_CLIENT') || errorStr.includes('play.google.com')) {
        return;
      }
      console.error(code, ...message);
    },
    warn: (code, ...message) => {
      console.warn(code, ...message);
    },
    debug: (code, ...message) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(code, ...message);
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
});
