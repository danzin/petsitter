import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/authContext";
import { container } from "@/lib/container";
import { UserRepository } from "@/repositories/UserRepository";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userRepository = container.resolve(
      "UserRepository"
    ) as UserRepository;
    const user = await userRepository.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
