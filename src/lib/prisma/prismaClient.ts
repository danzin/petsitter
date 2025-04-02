import { PrismaClient } from "@prisma/client";
import { singleton } from "tsyringe";

@singleton()
export class PrismaClientService {
  private static instance: PrismaClient;

  constructor() {
    if (!PrismaClientService.instance) {
      PrismaClientService.instance = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      });
    }
  }

  get client(): PrismaClient {
    return PrismaClientService.instance;
  }

  async connect(): Promise<void> {
    try {
      await PrismaClientService.instance.$connect();
    } catch (error) {
      console.error("Failed to connect to database:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await PrismaClientService.instance.$disconnect();
    } catch (error) {
      console.error("Failed to disconnect from database:", error);
      throw error;
    }
  }
}
