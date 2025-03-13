import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { BookingService } from "@/services/BookingService";

export async function POST(req: NextRequest) {
  try {
    const { startDate, endDate, notes, petId, ownerId, sitterId } =
      await req.json();

    if (!startDate || !endDate || !petId || !ownerId || !sitterId) {
      return NextResponse.json(
        { message: "Missing required booking information" },
        { status: 400 }
      );
    }

    const bookingService = container.resolve(BookingService);

    try {
      const booking = await bookingService.createBooking({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes,
        petId,
        ownerId,
        sitterId,
      });

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
    const bookingService = container.resolve(BookingService);

    try {
      const booking = await bookingService.updateBooking({
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
    const bookingService = container.resolve(BookingService);

    try {
      await bookingService.cancelBooking(params.id);
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
