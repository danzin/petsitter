import { NextRequest, NextResponse } from "next/server";
import { container } from "../../../lib/container";
import { AuthService } from "@/services/AuthService";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, userType } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const authService = container.resolve(AuthService);

    try {
      const user = await authService.registerUser({
        email,
        password,
        name,
        userType,
      });

      // Exclude password from response
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json(
        { message: "Registration successful", user: userWithoutPassword },
        { status: 201 }
      );
    } catch (error: any) {
      if (error.message === "User with this email already exists") {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
