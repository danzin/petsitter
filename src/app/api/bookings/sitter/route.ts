import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { BookingService } from "@/services/BookingService";
import { getAuthSession } from "@/lib/auth/authContext";
import { BookingStatus } from "@prisma/client"; // Import BookingStatus if needed for filtering later

const bookingService = container.resolve(BookingService);

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized: Not logged in" },
        { status: 401 }
      );
    }

    if (session.user.userType !== "PETSITTER") {
      console.warn(
        `User ${session.user.id} attempted to access sitter bookings but is type ${session.user.userType}`
      );
      return NextResponse.json(
        { message: "Forbidden: Only Pet Sitters can access this endpoint" },
        { status: 403 }
      );
    }

    console.log(`Fetching bookings for sitter with userID: ${session.user.id}`);

    const bookings = await bookingService.findBySitterUserId(session.user.id);

    // const sanitizedBookings = bookings.map((booking) => ({
    //   ...booking,
    //   price: booking.price.toString(),
    //   // Sanitize related sitter rate if included in the query result
    //   sitter: booking.sitter
    //     ? {
    //         ...booking.sitter,
    //         rate: booking.sitter.rate?.toString(),
    //       }
    //     : undefined,
    // }));

    console.log(
      `Found ${bookings.length} bookings for sitter (user ID): ${session.user.id}`
    );

    return NextResponse.json({ bookings: bookings });
  } catch (error) {
    console.error("Error fetching sitter bookings:", error);
    return NextResponse.json(
      { message: "Something went wrong while fetching sitter bookings" },
      { status: 500 }
    );
  }
}
