import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { BookingService } from "@/services/BookingService";
import { BookingStatus } from "@prisma/client";
import { getAuthSession } from "@/lib/auth/authContext";

const bookingService = container.resolve(BookingService);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await bookingService.getBookingById(params.id);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    console.error("Booking retrieval error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getAuthSession();
    const { bookingId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized: Not logged in" },
        { status: 401 }
      );
    }
    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required in URL path" },
        { status: 400 }
      );
    }

    let status: BookingStatus | undefined;
    try {
      const body = await req.json();
      status = body.status;
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!status || !Object.values(BookingStatus).includes(status)) {
      return NextResponse.json(
        { message: "Invalid or missing status provided" },
        { status: 400 }
      );
    }

    console.log(
      `Attempting to update booking ${bookingId} to status ${status} by user ${session.user.id} (type: ${session.user.userType})`
    );

    let updatedBooking;
    const userId = session.user.id;
    const userType = session.user.userType;

    if (userType === "PETSITTER") {
      if (status === BookingStatus.CONFIRMED) {
        updatedBooking = await bookingService.confirmBookingBySitter(
          bookingId,
          userId
        );
      } else if (status === BookingStatus.COMPLETED) {
        updatedBooking = await bookingService.completeBookingBySitter(
          bookingId,
          userId
        );
      } else if (status === BookingStatus.CANCELLED) {
        updatedBooking = await bookingService.cancelBookingBySitter(
          bookingId,
          userId
        );
      } else {
        return NextResponse.json(
          { message: `Invalid status update (${status}) for sitter role` },
          { status: 400 }
        );
      }
    } else if (userType === "PETOWNER") {
      if (status === BookingStatus.CANCELLED) {
        updatedBooking = await bookingService.cancelBookingByOwner(
          bookingId,
          userId
        );
      } else {
        return NextResponse.json(
          { message: `Invalid status update (${status}) for owner role` },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Forbidden: User role cannot update booking status" },
        { status: 403 }
      );
    }

    // Sanitize Decimal price before sending back
    //  const sanitizedUpdatedBooking = {
    //     ...updatedBooking,
    //     price: updatedBooking.price.toString(),
    //     sitter: updatedBooking.sitter ? {
    //         ...updatedBooking.sitter,
    //         rate: updatedBooking.sitter.rate?.toString(),
    //     } : undefined,
    // };

    return NextResponse.json(
      {
        message: `Booking ${bookingId} status updated to ${status}`,
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Booking update error for ID ${params?.bookingId}:`, error);

    // Handle specific errors from the service layer
    if (error.message.includes("not found")) {
      return NextResponse.json(
        { message: "Booking not found or permission denied" },
        { status: 404 }
      );
    }
    if (error.message.includes("Permission denied")) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    if (error.message.includes("cannot be")) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      {
        message: error.message || "Something went wrong during booking update",
      },
      { status: 500 }
    );
  }
}
