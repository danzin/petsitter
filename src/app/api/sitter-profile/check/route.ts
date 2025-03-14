import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/authContext";
import { container } from "@/lib/container";
import { SitterRepository } from "@/repositories/SitterRepository";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sitterRepository = container.resolve(
      "SitterRepository"
    ) as SitterRepository;
    const sitterProfile = await sitterRepository.findByUserId(session.user.id);

    return NextResponse.json({
      profileExists: !!sitterProfile,
      profile: sitterProfile || null,
    });
  } catch (error) {
    console.error("Error checking sitter profile:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
