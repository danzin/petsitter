import { injectable, inject } from "tsyringe";
import { BookingRepository } from "@/repositories/BookingRepository";
import { OwnerRepository } from "@/repositories/OwnerRepository";
import { SitterRepository } from "@/repositories/SitterRepository";
import { Booking, BookingStatus, Prisma } from "@prisma/client";
import { CreateBookingDTO, UpdateBookingDTO } from "@/dtos/BookingDTO";

@injectable()
export class BookingService {
  constructor(
    @inject("BookingRepository") private bookingRepository: BookingRepository,
    @inject("OwnerRepository") private ownerRepository: OwnerRepository,
    @inject("SitterRepository") private sitterRepository: SitterRepository,
    @inject("PrismaClient") private prisma: Prisma.TransactionClient
  ) {}

  async getBookingById(id: string): Promise<Booking | null> {
    return this.bookingRepository.findById(id);
  }

  async getOwnerBookings(userId: string): Promise<Booking[]> {
    const owner = await this.ownerRepository.findByUserId(userId);

    if (!owner) {
      return [];
    }

    return this.bookingRepository.findByOwnerId(owner.id);
  }

  async findByOwnerId(userId: string): Promise<Booking[]> {
    const owner = await this.ownerRepository.findByUserId(userId);
    if (!owner) {
      throw new Error("Owner not found");
    }
    return this.bookingRepository.findByOwnerId(owner.id);
  }

  async findBySitterId(sitterId: string): Promise<Booking[]> {
    return this.bookingRepository.findBySitterId(sitterId);
  }

  async getSitterBookings(userId: string): Promise<Booking[]> {
    const sitter = await this.sitterRepository.findByUserId(userId);

    if (!sitter) {
      return [];
    }

    return this.bookingRepository.findBySitterId(sitter.id);
  }

  async createBooking(data: CreateBookingDTO): Promise<Booking> {
    if (data.endDate <= data.startDate) {
      throw new Error("End date must be after start date.");
    }
    const owner = await this.ownerRepository.findById(data.ownerId);
    if (!owner) throw new Error("Owner profile not found");

    const sitter = await this.sitterRepository.findById(data.sitterId);
    if (!sitter) throw new Error("Pet sitter not found");

    // Verify pet ownership
    const pets = await this.prisma.pet.findMany({
      where: { id: { in: data.petIds }, ownerId: owner.id },
    });
    if (pets.length !== data.petIds.length) {
      throw new Error("Some pets not found or unauthorized");
    }

    return this.bookingRepository.create(data);
  }

  private async checkBookingPermission(
    bookingId: string,
    userId: string,
    allowedRole: "owner" | "sitter"
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (allowedRole === "owner") {
      const owner = await this.ownerRepository.findByUserId(userId);
      if (!owner || booking.ownerId !== owner.id) {
        throw new Error(
          "Permission denied: You are not the owner of this booking."
        );
      }
    } else if (allowedRole === "sitter") {
      const sitter = await this.sitterRepository.findByUserId(userId);
      if (!sitter || booking.sitterId !== sitter.id) {
        throw new Error(
          "Permission denied: You are not the sitter for this booking."
        );
      }
    }
    return booking;
  }

  async confirmBookingBySitter(
    bookingId: string,
    sitterUserId: string
  ): Promise<Booking> {
    const booking = await this.checkBookingPermission(
      bookingId,
      sitterUserId,
      "sitter"
    );

    if (booking.status !== BookingStatus.PENDING) {
      throw new Error(
        `Booking cannot be confirmed. Current status: ${booking.status}`
      );
    }

    return this.bookingRepository.update(bookingId, {
      status: BookingStatus.CONFIRMED,
    });
  }

  async completeBookingBySitter(
    bookingId: string,
    sitterUserId: string
  ): Promise<Booking> {
    const booking = await this.checkBookingPermission(
      bookingId,
      sitterUserId,
      "sitter"
    );

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new Error(
        `Booking cannot be marked complete. Current status: ${booking.status}`
      );
    }

    return this.bookingRepository.update(bookingId, {
      status: BookingStatus.COMPLETED,
    });
  }

  async cancelBookingByOwner(
    bookingId: string,
    ownerUserId: string
  ): Promise<Booking> {
    const booking = await this.checkBookingPermission(
      bookingId,
      ownerUserId,
      "owner"
    );

    // Allow cancellation only for PENDING or CONFIRMED (define your rules)
    if (
      !(["PENDING", "CONFIRMED"] as BookingStatus[]).includes(booking.status)
    ) {
      throw new Error(
        `Booking cannot be cancelled. Current status: ${booking.status}`
      );
    }

    return this.bookingRepository.update(bookingId, {
      status: BookingStatus.CANCELLED,
    });
  }

  async cancelBookingBySitter(
    bookingId: string,
    sitterUserId: string
  ): Promise<Booking> {
    const booking = await this.checkBookingPermission(
      bookingId,
      sitterUserId,
      "sitter"
    );

    if (
      !(["PENDING", "CONFIRMED"] as BookingStatus[]).includes(booking.status)
    ) {
      throw new Error(
        `Booking cannot be cancelled. Current status: ${booking.status}`
      );
    }

    return this.bookingRepository.update(bookingId, {
      status: BookingStatus.CANCELLED,
    });
  }

  // async updateBooking(
  //   id: string,
  //   userId: string,
  //   data: UpdateBookingDTO
  // ): Promise<Booking> {
  //   const booking = await this.bookingRepository.findById(id);
  //   if (!booking) throw new Error("Booking not found");

  //   // Verify permissions
  //   const owner = await this.ownerRepository.findByUserId(userId);
  //   const sitter = await this.sitterRepository.findByUserId(userId);
  //   const isOwner = owner && booking.ownerId === owner.id;
  //   const isSitter = sitter && booking.sitterId === sitter.id;
  //   if (!isOwner && !isSitter) throw new Error("Unauthorized");

  //   let updateData: Prisma.BookingUpdateInput = {};

  //   if (isOwner) {
  //     updateData = this.handleOwnerUpdates(data, booking);
  //   } else if (isSitter) {
  //     updateData = this.handleSitterUpdates(data);
  //   }

  //   // Transform updateData to Prisma-compatible format
  //   const prismaUpdateData: Prisma.BookingUpdateInput = {
  //     ...updateData,
  //     ...(data.status && { status: { set: data.status } }),
  //   };

  //   return this.bookingRepository.update(id, prismaUpdateData);
  // }
  async update(
    bookingId: string,
    userId: string,
    userType: "PETOWNER" | "PETSITTER",
    data: UpdateBookingDTO
  ): Promise<Booking> {
    const allowedRole = userType === "PETOWNER" ? "owner" : "sitter";
    const booking = await this.checkBookingPermission(
      bookingId,
      userId,
      allowedRole
    );

    if (data.status) {
      throw new Error(
        "Use specific methods (confirm, cancel, complete) to update booking status."
      );
    }

    return this.bookingRepository.update(bookingId, data);
  }

  private handleOwnerUpdates(
    data: UpdateBookingDTO,
    booking: Booking
  ): Prisma.BookingUpdateInput {
    if (booking.status !== BookingStatus.PENDING) {
      return {
        notes: data.notes || booking.notes, // Keep existing notes if not provided
      };
    }

    return {
      notes: data.notes || booking.notes,
      ...(data.petIds && {
        pets: { set: data.petIds.map((id) => ({ id })) },
      }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
    };
  }

  private handleSitterUpdates(
    data: UpdateBookingDTO
  ): Prisma.BookingUpdateInput {
    if (data.status && !Object.values(BookingStatus).includes(data.status)) {
      throw new Error("Invalid status");
    }

    return {
      ...(data.status && { status: data.status }),
    };
  }

  async cancelBooking(id: string, userId: string): Promise<Booking> {
    // Get the booking
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify permissions (either the owner or the sitter can cancel)
    const owner = await this.ownerRepository.findByUserId(userId);
    const sitter = await this.sitterRepository.findByUserId(userId);

    const isOwner = owner && booking.ownerId === owner.id;
    const isSitter = sitter && booking.sitterId === sitter.id;

    if (!isOwner && !isSitter) {
      throw new Error("You don't have permission to cancel this booking");
    }

    // Can only cancel if the booking is pending or confirmed
    if (
      !(
        [BookingStatus.PENDING, BookingStatus.CONFIRMED] as BookingStatus[]
      ).includes(booking.status)
    ) {
      throw new Error(`Cannot cancel booking with status ${booking.status}`);
    }

    return this.bookingRepository.update(id, {
      status: BookingStatus.COMPLETED,
    });
  }

  async completeBooking(id: string, userId: string): Promise<Booking> {
    // Get the booking
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Only the sitter can mark a booking as completed
    const sitter = await this.sitterRepository.findByUserId(userId);

    if (!sitter || booking.sitterId !== sitter.id) {
      throw new Error(
        "Only the assigned pet sitter can mark this booking as completed"
      );
    }

    // Can only complete if the booking is confirmed
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new Error(
        `Cannot complete a booking with status ${booking.status}`
      );
    }

    return this.bookingRepository.update(id, {
      status: BookingStatus.COMPLETED,
    });
  }
}
