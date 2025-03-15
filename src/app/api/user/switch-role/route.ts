import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/authContext";
import { container } from "@/lib/container";
import { UserRepository } from "@/repositories/UserRepository";
import { UserType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userType } = await req.json();

    // Validate userType
    if (!Object.values(UserType).includes(userType)) {
      return NextResponse.json(
        { message: "Invalid user type provided" },
        { status: 400 }
      );
    }

    const userRepository = container.resolve(
      "UserRepository"
    ) as UserRepository;

    // Update user's role
    await userRepository.update(session.user.id, { userType });

    return NextResponse.json(
      { message: "User role updated successfully", userType },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error switching user role:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
