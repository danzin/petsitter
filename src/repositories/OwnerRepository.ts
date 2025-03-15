import { injectable, inject } from "tsyringe";
import { PrismaClient, PetOwner, Prisma } from "@prisma/client";

@injectable()
export class OwnerRepository {
  constructor(@inject("PrismaClient") private prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<PetOwner | null> {
    return this.prisma.petOwner.findUnique({
      where: { userId },
    });
  }

  async create(data: Prisma.PetOwnerCreateInput): Promise<PetOwner> {
    return this.prisma.petOwner.create({
      data,
    });
  }

  async update(
    userId: string,
    data: Prisma.PetOwnerUpdateInput
  ): Promise<PetOwner> {
    return this.prisma.petOwner.upsert({
      where: { userId },
      update: data,
      create: {
        // Explicitly create new PetOwner with required fields
        user: { connect: { id: userId } },
        // Omit update-specific fields and only include create-compatible fields
        preferences: data.preferences as Prisma.InputJsonValue,
        pets: data.pets,
        // Add other create-only fields here
      },
    });
  }

  async getPets(userId: string) {
    return this.prisma.pet.findMany({
      where: { ownerId: userId },
    });
  }
}
