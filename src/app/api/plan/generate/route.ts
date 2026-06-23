import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/access";

export async function POST(req: NextRequest) {
  const blocked = await requireWriteAccess();
  if (blocked) return blocked;

  try {
    const body = await req.json();
    const { upload_date, count } = body;

    if (!upload_date || !count) {
      return NextResponse.json(
        { error: "upload_date dan count wajib diisi" },
        { status: 400 }
      );
    }

    const uploadDate = new Date(upload_date);
    const planCount = parseInt(String(count));

    // Get top N pending WOs ordered by created_at (FIFO)
    const pendingWOs = await prisma.pendingWO.findMany({
      where: { status: "PENDING" },
      orderBy: { created_at: "asc" },
      take: planCount,
    });

    if (pendingWOs.length === 0) {
      return NextResponse.json({ error: "Tidak ada data PENDING tersedia" }, { status: 400 });
    }

    const woIds = pendingWOs.map((w) => w.id);

    // Update WO status to PLANNED
    await prisma.pendingWO.updateMany({
      where: { id: { in: woIds } },
      data: { status: "PLANNED", upload_date: uploadDate },
    });

    // Match INV by WO_No and also plan them
    const woNos = pendingWOs.map((w) => w.wo_no);
    const plannedINVs = await prisma.pendingINV.updateMany({
      where: {
        wo_no: { in: woNos },
        status: "PENDING",
      },
      data: { status: "PLANNED", upload_date: uploadDate },
    });

    // Upsert daily plan record
    await prisma.dailyPlan.upsert({
      where: { plan_date: uploadDate },
      update: { plan_count: planCount },
      create: {
        plan_date:  uploadDate,
        plan_count: planCount,
        actual_wo:  0,
        actual_inv: 0,
      },
    });

    return NextResponse.json({
      success: true,
      planned_wo: woIds.length,
      planned_inv: plannedINVs.count,
      upload_date: upload_date,
    });
  } catch (error) {
    console.error("Plan generate error:", error);
    return NextResponse.json({ error: "Gagal generate plan" }, { status: 500 });
  }
}

export async function GET() {
  const plans = await prisma.dailyPlan.findMany({
    orderBy: { plan_date: "desc" },
    take: 60,
  });
  return NextResponse.json({ plans });
}
