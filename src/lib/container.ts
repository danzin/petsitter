import "reflect-metadata";
import { container } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../repositories/UserRepository";
import { SitterRepository } from "../repositories/SitterRepository";
import { AuthService } from "../services/AuthService";
import { BookingRepository } from "../repositories/BookingRepository";
import { BookingService } from "../services/BookingService";

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

container.register("AuthService", {
  useClass: AuthService,
});
container.register("BookingService", {
  useClass: BookingService,
});

export { container };
