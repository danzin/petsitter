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

    console.log(`userId in bookings POST handler: ${session.user.id}`);
    const petOwner = await ownerService.getOwnerProfileByUserId(
      session.user.id
    );
    console.log(`petOwner: ${petOwner?.id}`);
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
    console.log(
      `sitterId in bookings POST handler: ${sitterId} \r\n sitter: ${sitter?.id}`
    );
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
      console.log(`Error in post route handler: ${error}`);
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

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getAuthSession();

//     const { startDate, endDate, notes, status } = await req.json();
//     if (!session || !session.user || !session.user.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     try {
//       const booking = await bookingService.update(
//         params.id,
//         session?.user.id,
//         {
//           startDate: startDate ? new Date(startDate) : undefined,
//           endDate: endDate ? new Date(endDate) : undefined,
//           notes,
//           status,
//         }
//       );

//       return NextResponse.json(
//         { message: "Booking updated successfully", booking },
//         { status: 200 }
//       );
//     } catch (error: any) {
//       if (error.message === "Booking not found") {
//         return NextResponse.json({ message: error.message }, { status: 404 });
//       }
//       return NextResponse.json({ message: error.message }, { status: 400 });
//     }
//   } catch (error) {
//     console.error("Booking update error:", error);
//     return NextResponse.json(
//       { message: "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    const { status }: { status: BookingStatus } = await req.json();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (status === "CANCELLED") {
      await bookingService.cancelBooking(params.id, session.user.id);
      return NextResponse.json(
        { message: "Booking cancelled successfully" },
        { status: 200 }
      );
    } else {
      await bookingService.completeBooking(params.id, session.user.id);
      return NextResponse.json(
        { message: "Booking confirmed successfully" },
        { status: 200 }
      );
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
    if (!session || !session.user || !session.user.id) {
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
