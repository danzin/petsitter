import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { BookingService } from "@/services/BookingService";
import { getAuthSession } from "@/lib/auth/authContext";
import { BookingStatus, Prisma } from "@prisma/client";
const bookingService = container.resolve(BookingService);
const session = await getAuthSession();
export async function GET() {
  try {
    if (!session || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const bookings = await bookingService.findByOwnerId(session.user.id);

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
    const { startDate, endDate, notes, petIds, ownerId, sitterId } =
      await req.json();

    if (!startDate || !endDate || !petIds || !ownerId || !sitterId) {
      return NextResponse.json(
        { message: "Missing required booking information" },
        { status: 400 }
      );
    }

    try {
      const booking = await bookingService.createBooking(
        session?.user.id as string,
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          notes,
          petIds,
          ownerId,
          sitterId,
          status: BookingStatus.PENDING,
          price: new Prisma.Decimal(0),
        }
      );

      return NextResponse.json(
        { message: "Booking created successfully", booking },
        { status: 201 }
      );
    } catch (error: any) {
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { startDate, endDate, notes, status } = await req.json();

    try {
      const booking = await bookingService.updateBooking(session?.user.id, {
        bookingId: params.id,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        notes,
        status,
      });

      return NextResponse.json(
        { message: "Booking updated successfully", booking },
        { status: 200 }
      );
    } catch (error: any) {
      if (error.message === "Booking not found") {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      await bookingService.cancelBooking(params.id, session.user.id);
      return NextResponse.json(
        { message: "Booking cancelled successfully" },
        { status: 200 }
      );
    } catch (error: any) {
      if (error.message === "Booking not found") {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  } catch (error) {
    console.error("Booking cancellation error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
