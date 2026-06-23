import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page  = parseInt(searchParams.get("page")  || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip  = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.uploadHistory.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.uploadHistory.count(),
  ]);

  return NextResponse.json({ data, total, page, limit });
}
