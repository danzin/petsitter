"use server";

import { UserType } from "@prisma/client";

export async function createUser(prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const location = formData.get("location")?.toString();
  const userType = formData.get("userType")?.toString() as UserType;

  if (!name || !email || !password || !location || !userType) {
    return { message: "All fields are required." };
  }

  const res = await fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, location, userType }),
  });

  const json = await res.json();

  if (!res.ok) {
    return { message: json.message || "Registration failed." };
  }

  return { success: true, email, password, userType };
}
