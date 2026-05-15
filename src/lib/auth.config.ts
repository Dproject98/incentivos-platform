import type { NextAuthConfig } from "next-auth"

// Edge-compatible auth config (no Node.js-only imports like bcryptjs or prisma)
// Used by middleware to read JWT sessions in the Edge Runtime
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/es/login",
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: any) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  providers: [], // providers are added in auth.ts (Node.js only)
}
