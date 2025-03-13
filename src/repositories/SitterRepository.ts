import { PetSitter, Prisma } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { PrismaClientService } from "../lib/prisma/prismaClient";

@injectable()
export class SitterRepository {
  constructor(
    @inject(PrismaClientService) private prismaService: PrismaClientService
  ) {}

  async findById(id: string): Promise<PetSitter | null> {
    return this.prismaService.client.petSitter.findUnique({
      where: { id },
    });
  }

  async create(data: Partial<PetSitter>): Promise<PetSitter> {
    return this.prismaService.client.petSitter.create({
      data: data as any,
    });
  }

  async update(
    id: string,
    data: Prisma.PetSitterUpdateInput | Prisma.PetSitterUncheckedUpdateInput
  ): Promise<PetSitter> {
    return this.prismaService.client.petSitter.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.client.petSitter.delete({
      where: { id },
    });
  }
}
