import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

// --- Type augmentation ---

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
  interface User {
    role: UserRole;
  }
}

// Note: next-auth/jwt module augmentation is not supported in this version.
// role and id are stored in the token and accessed via type casting in callbacks.

// --- Custom error for suspended users ---

export class SuspendedUserError extends CredentialsSignin {
  code = "suspended";
}

// --- Auth config ---

const SESSION_MAX_AGE = parseInt(
  process.env.AUTH_SESSION_MAX_AGE ?? "2592000",
  10
); // 30 days default

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : null;
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : null;

        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        if (user.isSuspended) throw new SuspendedUserError();

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: String(user.id),
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        (token as { id: string; role: UserRole }).id = user.id!;
        (token as { id: string; role: UserRole }).role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      const t = token as { id?: string; role?: UserRole };
      if (t.id) session.user.id = t.id;
      if (t.role) session.user.role = t.role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
