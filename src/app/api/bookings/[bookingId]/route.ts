import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { BookingService } from "@/services/BookingService";
import { getAuthSession } from "@/lib/auth/authContext";
import { BookingWithDetails } from "../../../../../types/booking";
import { BookingStatus } from "@prisma/client";

const bookingService = container.resolve(BookingService);

export async function GET(
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
      console.error(
        "[API GET /bookings/id] Booking ID missing from params:",
        params
      );
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 }
      );
    }

    console.log(
      `[API GET /bookings/id] Fetching booking ${bookingId} for user ${session.user.id}`
    );

    const booking = await bookingService.getBookingById(bookingId);
    // ---------------------------------------------------

    if (!booking) {
      console.log(`[API GET /bookings/id] Booking ${bookingId} not found.`);
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    const typedBooking = booking as BookingWithDetails;
    const isOwner = typedBooking?.owner?.user?.id === session.user.id;
    const isSitter = typedBooking?.sitter?.user?.id === session.user.id;

    if (!isOwner && !isSitter) {
      console.warn(
        `[API GET /bookings/id] Forbidden access attempt: User ${session.user.id} on booking ${bookingId}`
      );
      return NextResponse.json(
        {
          message: "Forbidden: You do not have permission to view this booking",
        },
        { status: 403 }
      );
    }

    const sanitizedBooking = {
      ...typedBooking,
      price: typedBooking.price.toString(),
      sitter: typedBooking.sitter
        ? {
            ...typedBooking.sitter,
            rate: typedBooking.sitter.rate?.toString(),
          }
        : undefined,
    };

    return NextResponse.json(sanitizedBooking, { status: 200 });
  } catch (error: any) {
    console.error(
      `Booking retrieval error for ID ${params?.bookingId}:`,
      error
    );
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    if (message.includes("not found"))
      return NextResponse.json({ message }, { status: 404 });
    return NextResponse.json(
      { message: "An internal server error occurred" },
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
