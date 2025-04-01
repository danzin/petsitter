import { injectable, inject } from "tsyringe";
import { BookingRepository } from "@/repositories/BookingRepository";
import { OwnerRepository } from "@/repositories/OwnerRepository";
import { SitterRepository } from "@/repositories/SitterRepository";

import { PrismaClientService } from "@/lib/prisma/prismaClient";
import { Booking, BookingStatus, Prisma, User } from "@prisma/client";
import { CreateBookingDTO, UpdateBookingDTO } from "@/dtos/BookingDTO";
import { BookingWithDetails } from "../../types/booking";

@injectable()
export class BookingService {
  constructor(
    @inject(BookingRepository) private bookingRepository: BookingRepository,
    @inject(OwnerRepository) private ownerRepository: OwnerRepository,
    @inject(SitterRepository) private sitterRepository: SitterRepository,
    @inject(PrismaClientService) private prismaService: PrismaClientService
  ) {}

  /**
   * Finds specific booking by ID, including related owner, sitter, and pet data.
   * Performs no authorization check itself - relies on caller (API route) for that.
   */
  async getBookingById(id: string): Promise<BookingWithDetails | null> {
    return this.bookingRepository.findById(id);
  }

  /**
   * Retrieves all bookings associated with a specific Pet Owner, identified by their User ID.
   */
  async getBookingsByOwnerUserId(userId: string): Promise<Booking[]> {
    const owner = await this.ownerRepository.findByUserId(userId);
    if (!owner) {
      console.warn(
        `Attempted to get bookings for non-existent owner profile (User ID: ${userId})`
      );
      return [];
    }
    return this.bookingRepository.findByOwnerId(owner.id);
  }

  /**
   * Retrieves all bookings associated with a specific Pet Sitter, identified by their User ID.
   */
  async getBookingsBySitterUserId(userId: string): Promise<Booking[]> {
    return this.bookingRepository.findBySitterUserId(userId);
  }

  /**
   * Creates a new booking request.
   * Validates owner, sitter, dates, and pet ownership.
   */
  async createBooking(data: CreateBookingDTO): Promise<Booking> {
    if (data.endDate <= data.startDate) {
      throw new Error("End date must be after start date.");
    }
    const owner = await this.ownerRepository.findById(data.ownerId);
    if (!owner) throw new Error("Owner profile not found");

    const sitter = await this.sitterRepository.findById(data.sitterId);
    if (!sitter) throw new Error("Pet sitter profile not found");

    const pets = await this.prismaService.client.pet.findMany({
      where: {
        id: { in: data.petIds },
        ownerId: data.ownerId,
      },
      select: { id: true },
    });

    if (pets.length !== data.petIds.length) {
      const foundPetIds = pets.map((p) => p.id);
      const missingOrUnauthorized = data.petIds.filter(
        (id) => !foundPetIds.includes(id)
      );
      throw new Error(
        `Some pets not found or do not belong to the owner: ${missingOrUnauthorized.join(
          ", "
        )}`
      );
    }

    return this.bookingRepository.create(data);
  }

  /**
   * Centralized permission check for booking modifications.
   * Verifies if the user (by ID) matches the allowed role (owner/sitter) for the booking.
   * Throws an error if booking not found or permission denied.
   */
  private async checkBookingPermission(
    bookingId: string,
    userId: string,
    allowedRole: "owner" | "sitter"
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking not found (ID: ${bookingId})`);
    }

    // Extract user IDs from the included relations
    const ownerUserId = booking.owner?.user?.id;
    const sitterUserId = booking.sitter?.user?.id;

    if (!ownerUserId || !sitterUserId) {
      console.error(
        `Missing owner/sitter user ID in fetched booking ${bookingId}`
      );
      throw new Error(
        "Could not verify booking ownership due to missing data."
      );
    }

    if (allowedRole === "owner" && ownerUserId !== userId) {
      throw new Error(
        "Permission denied: You are not the owner of this booking."
      );
    } else if (allowedRole === "sitter" && sitterUserId !== userId) {
      throw new Error(
        "Permission denied: You are not the sitter for this booking."
      );
    }

    return booking;
  }

  /**
   * Confirms a PENDING booking. Action performed by the Sitter.
   */
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

  /**
   * Marks a CONFIRMED booking as COMPLETED. Action performed by the Sitter.
   */
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

  /**
   * Cancels a PENDING or CONFIRMED booking. Action performed by the Owner.
   */
  async cancelBookingByOwner(
    bookingId: string,
    ownerUserId: string
  ): Promise<Booking> {
    const booking = await this.checkBookingPermission(
      bookingId,
      ownerUserId,
      "owner"
    );
    if (
      !(
        [BookingStatus.PENDING, BookingStatus.CONFIRMED] as BookingStatus[]
      ).includes(booking.status)
    ) {
      throw new Error(
        `Booking cannot be cancelled. Current status: ${booking.status}`
      );
    }

    return this.bookingRepository.update(bookingId, {
      status: BookingStatus.CANCELLED,
    });
  }

  /**
   * Cancels a PENDING or CONFIRMED booking. Action performed by the Sitter.
   */
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
      !(
        [BookingStatus.PENDING, BookingStatus.CONFIRMED] as BookingStatus[]
      ).includes(booking.status)
    ) {
      throw new Error(
        `Booking cannot be cancelled. Current status: ${booking.status}`
      );
    }
    return this.bookingRepository.update(bookingId, {
      status: BookingStatus.CANCELLED,
    });
  }

  /**
   * Updates non-status details of a booking (e.g., notes).
   * Requires specific permission checks based on which fields are being updated.
   * Throws error if attempting to update status via this method.
   * Currently only allows updating 'notes'.
   *
   * Should be really careful when extending this, or maybe I should just rewrite it.
   */
  async updateBookingDetails(
    bookingId: string,
    userId: string,
    userType: User["userType"],
    data: UpdateBookingDTO
  ): Promise<Booking> {
    const allowedRole = userType === "PETOWNER" ? "owner" : "sitter";
    await this.checkBookingPermission(bookingId, userId, allowedRole);

    // Status updates not allowed with this method
    if (data.status) {
      throw new Error(
        "Use specific methods (confirm, cancel, complete) to update booking status."
      );
    }

    const updatePayload: Prisma.BookingUpdateInput = {};

    if (data.notes !== undefined) {
      updatePayload.notes = data.notes;
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new Error("No valid fields provided for update.");
    }

    return this.bookingRepository.update(bookingId, updatePayload);
  }
}
