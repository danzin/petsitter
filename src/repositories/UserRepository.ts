import { injectable, inject } from "tsyringe";
import { PrismaClient, User, Prisma, UserType } from "@prisma/client";

@injectable()
export class UserRepository {
  constructor(@inject("PrismaClient") private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getFullProfile(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        petSitter: true,
        petOwner: true,
      },
    });

    return user;
  }
}
