import { injectable, inject } from "tsyringe";
import { PrismaClient, PetSitter, Prisma } from "@prisma/client";

@injectable()
export class SitterRepository {
  constructor(@inject("PrismaClient") private prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<PetSitter | null> {
    return this.prisma.petSitter.findUnique({
      where: { userId },
    });
  }

  async create(data: Prisma.PetSitterCreateInput): Promise<PetSitter> {
    return this.prisma.petSitter.create({
      data,
    });
  }

  async update(
    userId: string,
    data: Prisma.PetSitterUpdateInput
  ): Promise<PetSitter> {
    return this.prisma.petSitter.upsert({
      where: { userId },
      update: data,
      create: {
        user: { connect: { id: userId } },
        experience: data.experience as string,
        bookings: data.bookings,
      },
    });
  }

  async getAvailableSitters(filters: {
    location?: string;
    services?: string[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<PetSitter[]> {
    // Implementation for finding available sitters based on filters
    return this.prisma.petSitter.findMany({
      where: {
        // filter conditions based on parameters
        ...(filters.location && { user: { location: filters.location } }),
        ...(filters.services && {
          servicesOffered: { hasSome: filters.services },
        }),
        // availability checks
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
            bio: true,
            image: true,
          },
        },
      },
    });
  }
}
