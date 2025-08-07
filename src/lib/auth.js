// src/lib/auth.js
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma"; // ✅ Make sure this is correct
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma), // ✅ required for Prisma session support
  session: {
    strategy: "jwt", // or "database" if you're storing sessions in DB
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !credentials.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login", // Customize if needed
  },
};
