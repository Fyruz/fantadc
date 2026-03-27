import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Full implementation in Step 2 (authentication & authorization).
// This stub configures the NextAuth v5 base with Credentials provider.
// The Prisma adapter and full authorize logic will be wired up in Step 2
// once the User model exists in the schema (Step 1).

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        // TODO Step 2: query db, verify password with bcryptjs, return user or null
        return null;
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      // TODO Step 2: propagate role from token to session
      return session;
    },
    jwt({ token, user }) {
      // TODO Step 2: store role in token on first sign-in
      if (user) (token as { role?: string }).role = undefined;
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
});
