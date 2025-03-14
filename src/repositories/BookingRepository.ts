import { Booking, BookingStatus } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { PrismaClientService } from "../lib/prisma/prismaClient";
import { CreateBookingDTO, UpdateBookingDTO } from "../dtos/BookingDTO";

@injectable()
export class BookingRepository {
  constructor(
    @inject(PrismaClientService) private prismaService: PrismaClientService
  ) {}

  async create(data: CreateBookingDTO): Promise<Booking> {
    return this.prismaService.client.booking.create({
      data: {
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
        status: data.status,
        price: data.price,
        ownerId: data.ownerId,
        sitterId: data.sitterId,
        pets: { connect: data.petIds.map((id) => ({ id })) },
      },
      include: {
        pets: true,
        owner: { include: { user: true } },
        sitter: { include: { user: true } },
      },
    });
  }

  async update(id: string, data: UpdateBookingDTO): Promise<Booking> {
    return this.prismaService.client.booking.update({
      where: { id },
      data: {
        ...data,
        ...(data.petIds && {
          pets: { set: data.petIds.map((id) => ({ id })) },
        }),
      },
      include: {
        pets: true,
        owner: { include: { user: true } },
        sitter: { include: { user: true } },
      },
    });
  }

  async findById(id: string): Promise<Booking | null> {
    return this.prismaService.client.booking.findUnique({
      where: { id },
      include: {
        pets: true,
        owner: {
          include: {
            user: true,
          },
        },
        sitter: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findByOwnerId(ownerId: string): Promise<Booking[]> {
    return this.prismaService.client.booking.findMany({
      where: { ownerId },
      include: {
        pets: true,
        sitter: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findBySitterId(sitterId: string): Promise<Booking[]> {
    return this.prismaService.client.booking.findMany({
      where: { sitterId },
      include: {
        pets: true,
        owner: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.client.booking.delete({
      where: { id },
    });
  }
}
