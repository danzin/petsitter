import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/authContext";
import { container } from "@/lib/container";
import { OwnerRepository } from "@/repositories/OwnerRepository";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const ownerRepository = container.resolve(
      "OwnerRepository"
    ) as OwnerRepository;
    const petOwner = await ownerRepository.findByUserId(session.user.id);

    if (!petOwner) {
      return NextResponse.json({ pets: [] });
    }

    const pets = await ownerRepository.getPets(petOwner.id);

    return NextResponse.json({ pets });
  } catch (error) {
    console.error("Error fetching pets:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
