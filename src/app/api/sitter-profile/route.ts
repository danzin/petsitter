import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/authContext";
import { container } from "../../../lib/container";
import { Prisma } from "@prisma/client";
import { UserRepository } from "@/repositories/UserRepository";
import { SitterRepository } from "@/repositories/SitterRepository";

const userRepository = container.resolve("UserRepository") as UserRepository;
const sitterRepository = container.resolve(
  "SitterRepository"
) as SitterRepository;
export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    console.log("Session:", session);
    if (!session || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bio, experience, rate, servicesOffered } = await req.json();

    const petSitter = await userRepository.findById(session.user.id);
    console.log(petSitter);

    if (!petSitter) {
      return NextResponse.json(
        { message: "Pet sitter profile not found" },
        { status: 404 }
      );
    }

    await userRepository.update(session.user.id, { bio });

    const sitterUpdateData: Prisma.PetSitterUpdateInput = {
      experience,
      rate: rate ? new Prisma.Decimal(rate) : undefined,
      servicesOffered: servicesOffered || undefined,
    };

    const updatedProfile = await sitterRepository.update(
      petSitter.id,
      sitterUpdateData
    );

    return NextResponse.json(
      { message: "Profile updated successfully", profile: updatedProfile },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating sitter profile:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
