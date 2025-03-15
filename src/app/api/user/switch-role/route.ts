import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/authContext";
import { container } from "@/lib/container";
import { UserRepository } from "@/repositories/UserRepository";
import { UserType } from "@prisma/client";
import { OwnerService } from "@/services/OwnerService";
import { SitterService } from "@/services/SitterService";
import { UserService } from "@/services/UserService";

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

    const userService = container.resolve("UserService") as UserService;
    const petOwnerService = container.resolve("OwnerService") as OwnerService;
    const petSitterService = container.resolve(
      "SitterService"
    ) as SitterService;

    // Update user's role
    await userService.updateUserProfile(session.user.id, { userType });

    if (userType === UserType.PETOWNER) {
      const petOwnerExists = await petOwnerService.checkProfileExists(
        session.user.id
      );
      if (!petOwnerExists) {
        await petOwnerService.createOwnerProfile(session.user.id, {});
      }
    } else if (userType === UserType.PETSITTER) {
      const petSitterExists = await petSitterService.checkProfileExists(
        session.user.id
      );
      if (!petSitterExists) {
        await petSitterService.createSitterProfile(session.user.id, {});
      }
    }

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
