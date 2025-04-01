import { Booking, BookingStatus, Prisma } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { PrismaClientService } from "../lib/prisma/prismaClient";
import { Decimal } from "@prisma/client/runtime/library";
import { BookingWithDetails } from "../../types/booking";

@injectable()
export class BookingRepository {
  constructor(
    @inject(PrismaClientService) private prisma: PrismaClientService
  ) {}

  async create(data: {
    ownerId: string;
    sitterId: string;
    startDate: Date;
    endDate: Date;
    petIds: string[];
    status: BookingStatus;
    price: Decimal;
    notes?: string;
  }): Promise<Booking> {
    return this.prisma.client.booking.create({
      data: {
        owner: { connect: { id: data.ownerId } },
        sitter: { connect: { id: data.sitterId } },
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        price: data.price,
        notes: data.notes,
        pets: {
          connect: data.petIds.map((id) => ({ id })),
        },
      },
    });
  }

  async update(id: string, data: Prisma.BookingUpdateInput): Promise<Booking> {
    return this.prisma.client.booking.update({
      where: { id },
      data,
    });
  }

  async findById(id: string): Promise<BookingWithDetails | null> {
    return this.prisma.client.booking.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        sitter: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        pets: true,
      },
    });
  }

  async findByOwnerId(ownerId: string): Promise<Booking[]> {
    return this.prisma.client.booking.findMany({
      where: { ownerId },
      include: {
        // Include necessary related data
        sitter: { include: { user: { select: { name: true, image: true } } } },
        pets: { select: { id: true, name: true, type: true } },
        owner: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startDate: "desc" },
    });
  }

  async findBySitterId(sitterId: string): Promise<any[]> {
    return this.prisma.client.booking.findMany({
      where: { sitterId },
      include: {
        // Include necessary related data
        owner: { include: { user: { select: { name: true, image: true } } } },
        pets: { select: { id: true, name: true, type: true } },
        sitter: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startDate: "desc" },
    });
  }

  async findBySitterUserId(userId: string): Promise<any[]> {
    return this.prisma.client.booking.findMany({
      where: {
        sitter: {
          userId: userId,
        },
      },
      include: {
        owner: { include: { user: { select: { name: true, image: true } } } },
        pets: { select: { id: true, name: true, type: true } },
      },
      //Sort by date
      orderBy: { startDate: "desc" },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.booking.delete({
      where: { id },
    });
  }
}
