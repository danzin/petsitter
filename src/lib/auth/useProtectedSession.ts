"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export function useProtectedSession() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      signOut({
        redirect: true,
        callbackUrl: "/login",
      });
    }
  }, [session, status]);

  return { session, status };
}
