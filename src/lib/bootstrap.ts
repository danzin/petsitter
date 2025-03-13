import { container } from "./container";
import { PrismaClientService } from "./prisma/prismaClient";

export async function bootstrap() {
  const prismaService = container.resolve(PrismaClientService);
  await prismaService.connect();
  console.log("Application bootstrapped successfully");
}
