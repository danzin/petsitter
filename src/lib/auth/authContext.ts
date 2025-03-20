import { getServerSession } from "next-auth/next";
import { createAuthOptions } from "./nextAuthConfig";
import { container } from "../container";
import { PrismaClientService } from "../prisma/prismaClient";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function getAuthSession() {
  const session = await getServerSession(createAuthOptions());

  if (session?.user?.id) {
    const prisma = container.resolve(PrismaClientService).client;
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!dbUser) {
      (await cookies()).delete("next-auth.session-token");
      return null;
    }
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getAuthSession();
  return session?.user || null;
}

export async function validateSession() {
  const user = await getCurrentUser();

  if (!user) {
    (await cookies()).delete("next-auth.session-token");
    return NextResponse.redirect(new URL("/login", "http://localhost:3000"));
  }

  return null;
}
