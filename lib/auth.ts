import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { authConfig } from "@/auth.config";
import { eq } from "drizzle-orm";

/**
 * Full NextAuth instance with Drizzle adapter.
 * Use this on Node runtime (server components, API routes, route handlers).
 * For Edge runtime (middleware), use authConfig directly.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    ...authConfig.callbacks,

    // Augment the JWT with our DB user id + admin flag + phone
    async jwt({ token, user }) {
      if (user) {
        // On sign-in, copy DB fields onto the token
        token.id = user.id;
      }
      // On every request, refresh phone + isAdmin in case they changed.
      // Wrap in try/catch so a transient DB hiccup doesn't tank the whole session.
      if (token.id) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, token.id as string),
            columns: { phone: true, isAdmin: true },
          });
          if (dbUser) {
            token.phone = dbUser.phone;
            token.isAdmin = dbUser.isAdmin;
          }
        } catch (err) {
          // DB unreachable — keep using whatever phone/isAdmin we already have on the token.
          // This avoids breaking the entire auth flow when Postgres has a hiccup.
          console.warn(
            "[auth.jwt] DB lookup failed, using cached token values:",
            err instanceof Error ? err.message : err
          );
        }
      }
      return token;
    },

    // Expose our custom fields to the session object on the client
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.phone = (token.phone as string | null) ?? null;
        session.user.isAdmin = (token.isAdmin as boolean) ?? false;
      }
      return session;
    },
  },
});
