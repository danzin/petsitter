// File: app/api/pets/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/authContext";
import { container } from "@/lib/container";
import { OwnerService } from "@/services/OwnerService";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const ownerService = container.resolve(OwnerService);

    // Might need to create a separate method in the service layer to get a specific pet with ownership verification
    const pets = await ownerService.getPets(session.user.id);
    const pet = pets.find((p) => p.id === id);

    if (!pet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    return NextResponse.json({ pet });
  } catch (error) {
    console.error("Error fetching pet:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const petId = params.id;
    const body = await request.json();
    const { name, type, breed, age, description, imageUrl } = body;

    if (!name || !type) {
      return NextResponse.json(
        { message: "Name and type are required" },
        { status: 400 }
      );
    }

    const ownerService = container.resolve(OwnerService);
    const updatedPet = await ownerService.updatePet(petId, session.user.id, {
      name,
      type,
      breed,
      age,
      description,
      imageUrl,
    });

    return NextResponse.json({ pet: updatedPet });
  } catch (error: any) {
    console.error("Error updating pet:", error);
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const petId = params.id;
    const ownerService = container.resolve(OwnerService);

    await ownerService.deletePet(petId, session.user.id);

    return NextResponse.json({ message: "Pet deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting pet:", error);
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}
