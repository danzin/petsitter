import { User } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { PrismaClientService } from "../lib/prisma/prismaClient";

@injectable()
export class UserRepository {
  constructor(
    @inject(PrismaClientService) private prismaService: PrismaClientService
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.client.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prismaService.client.user.findUnique({
      where: { id },
    });
  }

  async create(data: Partial<User>): Promise<User> {
    return this.prismaService.client.user.create({
      data: data as any,
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prismaService.client.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.client.user.delete({
      where: { id },
    });
  }
}
