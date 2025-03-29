import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { SitterService } from "@/services/SitterService";

export async function GET(
  request: NextRequest,
  { params }: { params: { sitterId: string } }
) {
  try {
    const { sitterId } = await params;
    console.log(`sitterId: ${sitterId}`);
    if (!sitterId) {
      return NextResponse.json(
        { message: "Sitter ID is required" },
        { status: 400 }
      );
    }

    const sitterService = container.resolve(SitterService);
    const sitter = await sitterService.getSitterById(sitterId);

    if (!sitter) {
      return NextResponse.json(
        { message: "Sitter not found" },
        { status: 404 }
      );
    }

    const responseData = {
      id: sitter.id,
      userId: sitter.userId,
      rate: sitter.rate.toString(),
      name: sitter.user?.name,
    };

    return NextResponse.json({ sitter: responseData });
  } catch (error) {
    console.error("Error fetching sitter details:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
