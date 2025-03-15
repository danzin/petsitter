import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/authContext";
import { container } from "@/lib/container";
import { BookingRepository } from "@/repositories/BookingRepository";

const bookingRepository = container.resolve(
  "BookingRepository"
) as BookingRepository;

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch bookings associated with the sitter
    const sitterBookings = await bookingRepository.findBySitterId(
      session.user.id
    );

    // If no bookings found
    if (!sitterBookings || sitterBookings.length === 0) {
      return NextResponse.json({ bookings: [] }, { status: 200 });
    }

    // Return sitter's bookings
    return NextResponse.json({ bookings: sitterBookings }, { status: 200 });
  } catch (error) {
    console.error("Error fetching bookings for sitter:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
