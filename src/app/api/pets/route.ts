import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/authContext";
import { container } from "@/lib/container";
import { OwnerRepository } from "@/repositories/OwnerRepository";
import { OwnerService } from "@/services/OwnerService";
const ownerService = container.resolve(OwnerService);

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
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

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, breed, age, description, imageUrl } = body;

    if (!name || !type) {
      return NextResponse.json(
        { message: "Name and type are required" },
        { status: 400 }
      );
    }

    const petOwner = await ownerService.getOwnerProfileByUserId(
      session.user.id
    );

    if (!petOwner) {
      return NextResponse.json(
        { message: "Pet owner not found" },
        { status: 404 }
      );
    }

    const newPet = await ownerService.addPet(session.user.id, {
      name,
      type,
      breed,
      age,
      description,
      imageUrl,
    });

    return NextResponse.json({ pet: newPet }, { status: 201 });
  } catch (error) {
    console.error("Error adding new pet:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
