import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { checkRateLimit, resetRateLimit } from "./rate-limit";
import { logger } from "./logger";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const email = credentials.email.toLowerCase();

        const limited = checkRateLimit(`login:${email}`, 10, 15 * 60 * 1000);
        if (!limited.ok) {
          logger.warn({ email }, "login rate limited");
          return null;
        }

        const user = await db.user.findUnique({
          where: { email },
        });
        if (!user?.passwordHash) return null;
        if (user.banned) {
          logger.warn({ email }, "login blocked for banned user");
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        if (!user.emailVerified) {
          logger.warn({ email }, "login blocked for unverified email");
          return null;
        }

        resetRateLimit(`login:${email}`);

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        return token;
      }
      if (token?.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { banned: true },
        });
        if (!dbUser || dbUser.banned) return {};
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
