import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDateTAM } from "@/lib/utils";
import { requireWriteAccess } from "@/lib/access";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const blocked = await requireWriteAccess();
  if (blocked) return blocked;

  const { searchParams } = new URL(req.url);
  const upload_date = searchParams.get("upload_date");

  const where = upload_date
    ? { status: "PLANNED", upload_date: new Date(upload_date) }
    : { status: "PLANNED" };

  const rows = await prisma.pendingINV.findMany({
    where,
    orderBy: { date: "asc" },
  });

  if (rows.length === 0) {
    return NextResponse.json({ error: "Tidak ada data INV PLANNED" }, { status: 404 });
  }

  const lines = rows.map((r) => {
    const cols = [
      r.outlet_code,
      r.wo_no,
      r.invoice_no,
      formatDateTAM(r.upload_date || r.date),
      r.part_no,
      r.part_desc || "",
      String(r.unit_price ?? 0),
      String(r.qty ?? 0),
      String(r.amount ?? 0),
      String(r.discount ?? 0),
      String(r.ppn ?? 0),
      String(r.total ?? 0),
      "0",
      r.po_no || "",
      "0",
      r.raw_col_a || "B",
      r.raw_col_b || "0",
    ];
    return cols.join(";");
  });

  const txt = lines.join("\r\n");

  // Mark EXPORTED
  const ids = rows.map((r) => r.id);
  await prisma.pendingINV.updateMany({
    where: { id: { in: ids } },
    data: { status: "EXPORTED" },
  });

  // Update daily plan actual_inv
  if (upload_date) {
    await prisma.dailyPlan.upsert({
      where: { plan_date: new Date(upload_date) },
      update: { actual_inv: rows.length },
      create: {
        plan_date:  new Date(upload_date),
        plan_count: 0,
        actual_wo:  0,
        actual_inv: rows.length,
      },
    });
  }

  const dateStr = upload_date ? upload_date.replace(/-/g, "") : "all";
  const fileName = `INV_EXPORT_${dateStr}.txt`;

  await prisma.uploadHistory.create({
    data: {
      file_name:   fileName,
      file_type:   "INV_EXPORT",
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
    },
  });
}
