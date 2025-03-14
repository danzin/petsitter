// services/BookingService.ts
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

  async getSitterBookings(userId: string): Promise<Booking[]> {
    const sitter = await this.sitterRepository.findByUserId(userId);

    if (!sitter) {
      return [];
    }

    return this.bookingRepository.findBySitterId(sitter.id);
  }

  async createBooking(
    userId: string,
    data: CreateBookingDTO
  ): Promise<Booking> {
    const owner = await this.ownerRepository.findByUserId(userId);
    if (!owner) throw new Error("Owner profile not found");

    const sitter = await this.sitterRepository.findByUserId(data.sitterId);
    if (!sitter) throw new Error("Pet sitter not found");

    // Verify pet ownership
    const pets = await this.prisma.pet.findMany({
      where: { id: { in: data.petIds }, ownerId: owner.id },
    });
    if (pets.length !== data.petIds.length) {
      throw new Error("Some pets not found or unauthorized");
    }

    // Calculate price
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const durationHours =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const price = new Prisma.Decimal(
      parseFloat(sitter.rate.toString()) * durationHours
    );

    return this.bookingRepository.create({
      startDate,
      endDate,
      notes: data.notes,
      status: BookingStatus.PENDING,
      price,
      ownerId: owner.id, // Use direct ID
      sitterId: sitter.id, // Use direct ID
      petIds: data.petIds,
    });
  }

  async updateBooking(
    id: string,
    userId: string,
    data: UpdateBookingDTO
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new Error("Booking not found");

    // Verify permissions
    const owner = await this.ownerRepository.findByUserId(userId);
    const sitter = await this.sitterRepository.findByUserId(userId);
    const isOwner = owner && booking.ownerId === owner.id;
    const isSitter = sitter && booking.sitterId === sitter.id;
    if (!isOwner && !isSitter) throw new Error("Unauthorized");

    let updateData: Prisma.BookingUpdateInput = {};

    if (isOwner) {
      updateData = this.handleOwnerUpdates(data, booking);
    } else if (isSitter) {
      updateData = this.handleSitterUpdates(data);
    }

    return this.bookingRepository.update(id, updateData);
  }
  private handleOwnerUpdates(
    data: UpdateBookingDTO,
    booking: Booking
  ): Prisma.BookingUpdateInput {
    if (booking.status !== BookingStatus.PENDING) {
      return { notes: data.notes };
    }

    return {
      notes: data.notes,
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
