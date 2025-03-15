import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { AuthService } from "@/services/AuthService";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const authService = container.resolve(AuthService);

    try {
      const user = await authService.login({ email, password });
      return NextResponse.json(
        { message: "Login successful", user },
        { status: 200 }
      );
    } catch (error: any) {
      if (error.message === "User not found") {
        return NextResponse.json(
          { message: "No user found with this email." },
          { status: 404 }
        );
      } else if (error.message === "Invalid password") {
        return NextResponse.json(
          { message: "Incorrect password." },
          { status: 401 }
        );
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
