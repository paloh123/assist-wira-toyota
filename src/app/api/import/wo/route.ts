import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseWOFile } from "@/lib/parser/txtParser";
import { isValidWONo, getSkipReason } from "@/lib/engine/filterEngine";
import { fixOperationType, type OperationType } from "@/lib/engine/correctionEngine";
import { safeFloat, parseDate } from "@/lib/parser/txtParser";
import { requireWriteAccess } from "@/lib/access";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const blocked = await requireWriteAccess();
  if (blocked) return blocked;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const content = await file.text();
    const rows = parseWOFile(content);

    let imported = 0;
    let skipped = 0;
    let duplicates = 0;
    const errors: string[] = [];

    for (const row of rows) {
      // Filter: only allow GW- prefixed WO_No
      if (!isValidWONo(row.wo_no)) {
        skipped++;
        errors.push(`Skip [${row.wo_no}]: ${getSkipReason(row.wo_no)}`);
        continue;
      }

      // Parse date
      const woDate = parseDate(row.wo_date);
      if (!woDate) {
        skipped++;
        errors.push(`Skip [${row.wo_no}]: Invalid date "${row.wo_date}"`);
        continue;
      }

      // Preserve the operation type from source when present, then fall back to auto-correction.
      const operationType = (row.labor_code || fixOperationType(row.operation_desc)) as OperationType;

      try {
        await prisma.pendingWO.upsert({
          where: {
            wo_no_outlet_code_wo_date: {
              wo_no: row.wo_no,
              outlet_code: row.outlet_code,
              wo_date: woDate,
            },
          },
          update: {
            chassis_no:     row.chassis_no,
            operation_desc: row.operation_desc,
            operation_type: operationType,
            labor_code:     row.labor_code,
            labor_amount:   safeFloat(row.labor_amount),
            part_amount:    safeFloat(row.part_amount),
            oil_amount:     safeFloat(row.oil_amount),
            tyre_amount:    safeFloat(row.tyre_amount),
            discount:       safeFloat(row.discount),
            other_amount:   safeFloat(row.other_amount),
            raw_col13:      row.col13,
            raw_col14:      row.col14,
            remark:         row.remark,
            status:         "PENDING",
            upload_date:    null,
          },
          create: {
            outlet_code:    row.outlet_code,
            wo_no:          row.wo_no,
            wo_date:        woDate,
            chassis_no:     row.chassis_no,
            operation_desc: row.operation_desc,
            operation_type: operationType,
            labor_code:     row.labor_code,
            labor_amount:   safeFloat(row.labor_amount),
            part_amount:    safeFloat(row.part_amount),
            oil_amount:     safeFloat(row.oil_amount),
            tyre_amount:    safeFloat(row.tyre_amount),
            discount:       safeFloat(row.discount),
            other_amount:   safeFloat(row.other_amount),
            raw_col13:      row.col13,
            raw_col14:      row.col14,
            remark:         row.remark,
            status:         "PENDING",
          },
        });
        imported++;
      } catch (e: unknown) {
        if (
          e instanceof Error &&
          e.message.includes("Unique constraint")
        ) {
          duplicates++;
        } else {
          errors.push(`Error [${row.wo_no}]: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }

    // Save to history
    await prisma.uploadHistory.create({
      data: {
        file_name:   file.name,
        file_type:   "WO",
        total_data:  imported,
        skipped,
        duplicates,
        upload_date: new Date(),
        user:        "admin",
      },
    });

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      duplicates,
      total: rows.length,
      errors: errors.slice(0, 50),
    });
  } catch (error) {
    console.error("Import WO error:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
