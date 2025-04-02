import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { AuthService } from "@/services/AuthService";
import { SitterService } from "@/services/SitterService";
import { getAuthSession } from "@/lib/auth/authContext";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const authService = container.resolve(AuthService);
    const sitterService = container.resolve(SitterService);

    const user = await authService.getUserByEmail(session.user.email as string);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sitterProfile = await sitterService.getSitterProfileByUserId(user.id);

    if (!sitterProfile) {
      return NextResponse.json(
        { error: "Sitter profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      availability: sitterProfile.availability,
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { availability } = await req.json();

    if (!availability) {
      return NextResponse.json(
        { error: "Availability data is required" },
        { status: 400 }
      );
    }

    const authService = container.resolve(AuthService);
    const sitterService = container.resolve(SitterService);

    const user = await authService.getUserByEmail(session.user.email as string);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profileExists = await sitterService.checkProfileExists(user.id);

    if (!profileExists) {
      await sitterService.createSitterProfile(user.id, {
        availability,
      });
    } else {
      await sitterService.updateAvailability(user.id, availability);
    }

    return NextResponse.json({
      success: true,
      message: "Availability updated successfully",
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
