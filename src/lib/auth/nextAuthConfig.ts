import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { container } from "../container";
import { PrismaClientService } from "../prisma/prismaClient";
import { AuthService } from "../../services/AuthService";

export function createAuthOptions(): NextAuthOptions {
  const prismaService = container.resolve(PrismaClientService);
  const authService = container.resolve(AuthService);

  return {
    adapter: PrismaAdapter(prismaService.client),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      }),
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await authService.validateCredentials(
            credentials.email,
            credentials.password
          );

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            userType: user.userType,
          };
        },
      }),
    ],
    pages: {
      signIn: "/login",
      newUser: "/register",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.name = user.name;
          token.userType = (user as any).userType;
        }
        return token;
      },
      async session({ session, token }) {
        if (token && session && session.user) {
          session.user.id = token.id as string;
          session.user.name = token.name;
          session.user.userType = token.userType;
        }
        return session;
      },
    },
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
}
