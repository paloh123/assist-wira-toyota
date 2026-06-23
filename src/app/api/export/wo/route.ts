import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDateTAM } from "@/lib/utils";
import { requireWriteAccess } from "@/lib/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const blocked = await requireWriteAccess();
  if (blocked) return blocked;

  const { searchParams } = new URL(req.url);
  const upload_date = searchParams.get("upload_date");

  const where = upload_date
    ? { status: "PLANNED", upload_date: new Date(upload_date) }
    : { status: "PLANNED" };

  const rows = await prisma.pendingWO.findMany({
    where,
    orderBy: { wo_date: "asc" },
  });

  if (rows.length === 0) {
    return NextResponse.json({ error: "Tidak ada data PLANNED" }, { status: 404 });
  }

  // Build TXT content: same format as source
  const lines = rows.map((r) => {
    const cols = [
      r.outlet_code,
      r.wo_no,
      formatDateTAM(r.upload_date || r.wo_date),
      r.chassis_no || "",
      r.operation_desc || "",
      r.operation_type || "",
      String(r.labor_amount ?? 0),
      String(r.part_amount ?? 0),
      String(r.oil_amount ?? 0),
      String(r.tyre_amount ?? 0),
      String(r.discount ?? 0),
      String(r.other_amount ?? 0),
      r.raw_col13 || "1",
      r.raw_col14 || "0",
      r.remark || "",
    ];
    return cols.join(";");
  });

  const txt = lines.join("\r\n");

  // Mark as EXPORTED and update daily plan
  const ids = rows.map((r) => r.id);
  await prisma.pendingWO.updateMany({
    where: { id: { in: ids } },
    data: { status: "EXPORTED" },
  });

  // Update daily plan actual
  if (upload_date) {
    await prisma.dailyPlan.upsert({
      where: { plan_date: new Date(upload_date) },
      update: { actual_wo: rows.length },
      create: {
        plan_date:  new Date(upload_date),
        plan_count: rows.length,
        actual_wo:  rows.length,
        actual_inv: 0,
      },
    });
  }

  // Save export history
  const dateStr = upload_date ? upload_date.replace(/-/g, "") : "all";
  const fileName = `WO_EXPORT_${dateStr}.txt`;
  await prisma.uploadHistory.create({
    data: {
      file_name:   fileName,
      file_type:   "WO_EXPORT",
      total_data:  rows.length,
      skipped:     0,
      duplicates:  0,
      upload_date: new Date(),
      user:        "admin",
    },
  });

  return new Response(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
