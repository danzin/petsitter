import { getServerSession } from "next-auth/next";
import { createAuthOptions } from "./nextAuthConfig";

export async function getAuthSession() {
  return getServerSession(createAuthOptions());
}
