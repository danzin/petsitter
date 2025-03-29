import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { BookingService } from "@/services/BookingService";
import { getAuthSession } from "@/lib/auth/authContext";
import { BookingStatus, Prisma } from "@prisma/client";
import { SitterService } from "@/services/SitterService";
import { OwnerService } from "@/services/OwnerService";
import { Decimal } from "@prisma/client/runtime/library";

const bookingService = container.resolve(BookingService);
const sitterService = container.resolve(SitterService);
const ownerService = container.resolve(OwnerService);

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const bookings = await bookingService.getBookingsByOwnerUserId(
      session.user.id
    );

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    const { startDate, endDate, notes, petIds, sitterId } = await req.json();

    if (!startDate || !endDate || !petIds || !sitterId) {
      return NextResponse.json(
        { message: "Missing required booking information" },
        { status: 400 }
      );
    }

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      );
    }

    const petOwner = await ownerService.getOwnerProfileByUserId(
      session.user.id
    );
    if (!petOwner) {
      console.error(
        `PetOwner profile not found for user ID: ${session.user.id}`
      );
      return NextResponse.json(
        { message: "Pet owner profile not found. Cannot create booking." },
        { status: 404 }
      );
    }
    const ownerId = petOwner.id;

    const sitter = await sitterService.getSitterById(sitterId);

    if (!sitter || !sitter.rate) {
      return NextResponse.json(
        { message: "Sitter not found or rate not set." },
        { status: 404 }
      );
    }

    const sitterRate = sitter.rate;

    const durationMillis = end.getTime() - start.getTime();
    const durationHours = new Decimal(durationMillis).div(1000 * 60 * 60);
    const calculatedPrice = sitterRate.times(durationHours);

    try {
      const booking = await bookingService.createBooking({
        ownerId: ownerId as string,
        startDate: start,
        endDate: end,
        notes: notes,
        petIds: petIds,
        sitterId: sitterId,
        status: BookingStatus.PENDING,
        price: calculatedPrice,
      });

      return NextResponse.json(
        { message: "Booking created successfully", booking },
        { status: 201 }
      );
    } catch (error: any) {
      console.error(`Error in post route handler: ${error}`);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
