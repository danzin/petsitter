import "reflect-metadata";
import { container } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../repositories/UserRepository";
import { SitterRepository } from "../repositories/SitterRepository";
import { AuthService } from "../services/AuthService";
import { BookingRepository } from "../repositories/BookingRepository";
import { BookingService } from "../services/BookingService";
import { OwnerRepository } from "@/repositories/OwnerRepository";
import { UserService } from "@/services/UserService";
import { OwnerService } from "@/services/OwnerService";
import { SitterService } from "@/services/SitterService";

container.registerInstance<PrismaClient>("PrismaClient", new PrismaClient());
container.register("UserRepository", {
  useClass: UserRepository,
});

container.register("BookingRepository", {
  useClass: BookingRepository,
});

container.register("SitterRepository", {
  useClass: SitterRepository,
});

container.register("OwnerRepository", {
  useClass: OwnerRepository,
});

container.register("AuthService", {
  useClass: AuthService,
});

container.register("BookingService", {
  useClass: BookingService,
});

container.register("UserService", {
  useClass: UserService,
});

container.register("OwnerService", {
  useClass: OwnerService,
});

container.register("SitterService", {
  useClass: SitterService,
});

export { container };
