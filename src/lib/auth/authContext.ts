import { getServerSession } from "next-auth/next";
import { createAuthOptions } from "./nextAuthConfig";
import { container } from "../container";
import { PrismaClientService } from "../prisma/prismaClient";
import { redirect } from "next/navigation";

export async function getAuthSession() {
  return await getServerSession(createAuthOptions());
}

export async function getCurrentUser() {
  const session = await getAuthSession();
  return session?.user || null;
}

export async function validateSession() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/api/logout");
  }

  const prisma = container.resolve(PrismaClientService).client;
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) {
    redirect("/api/logout");
  }

  return session.user;
}
