import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createAuthOptions } from "@/lib/auth/nextAuthConfig";

export async function GET() {
  const session = await getServerSession(createAuthOptions());
  const response = NextResponse.redirect(new URL("/", "http://localhost:3000"));

  if (session) {
    response.cookies.delete("next-auth.session-token");
  }

  return response;
}
