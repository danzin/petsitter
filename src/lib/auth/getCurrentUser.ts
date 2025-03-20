import { getAuthSession } from "./authContext";

export async function getCurrentUser() {
  const session = await getAuthSession();
  return session?.user || null;
}
