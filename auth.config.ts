import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-runtime safe NextAuth config.
 * No Drizzle adapter here — middleware runs on Edge runtime and
 * can't import the postgres driver. Adapter is added in lib/auth.ts.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/triage", "/result", "/admin", "/onboarding"];
      const isProtected = protectedPaths.some((p) =>
        nextUrl.pathname.startsWith(p)
      );

      if (isProtected && !isLoggedIn) {
        return false; // Redirects to /login via `pages.signIn`
      }
      return true;
    },
  },
};
