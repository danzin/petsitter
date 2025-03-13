import { injectable, inject } from "tsyringe";
import { BookingRepository } from "../repositories/BookingRepository";
import { CreateBookingDTO, UpdateBookingDTO } from "../dtos/BookingDTO";
import { Booking, BookingStatus } from "@prisma/client";

@injectable()
export class BookingService {
  constructor(
    @inject("BookingRepository") private bookingRepository: BookingRepository
  ) {}

  async createBooking(data: CreateBookingDTO): Promise<Booking> {
    // Validate dates
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new Error("End date must be after start date");
    }

    return this.bookingRepository.create(data);
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return this.bookingRepository.findById(id);
  }

  async getOwnerBookings(ownerId: string): Promise<Booking[]> {
    return this.bookingRepository.findByOwnerId(ownerId);
  }

  async getSitterBookings(sitterId: string): Promise<Booking[]> {
    return this.bookingRepository.findBySitterId(sitterId);
  }

  async updateBooking(data: UpdateBookingDTO): Promise<Booking> {
    const booking = await this.bookingRepository.findById(data.bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Validate dates if provided
    if (
      data.startDate &&
      data.endDate &&
      new Date(data.startDate) >= new Date(data.endDate)
    ) {
      throw new Error("End date must be after start date");
    }

    return this.bookingRepository.update(data);
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new Error("Cannot cancel a completed booking");
    }

    return this.bookingRepository.update({
      bookingId,
      status: BookingStatus.CANCELLED,
    });
  }

  async completeBooking(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new Error("Cannot complete a cancelled booking");
    }

    return this.bookingRepository.update({
      bookingId,
      status: BookingStatus.COMPLETED,
    });
  }
}
