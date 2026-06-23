import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseINVFile, safeFloat, safeInt, parseDate } from "@/lib/parser/txtParser";
import { isValidINVNo } from "@/lib/engine/filterEngine";
import { fixPartNo } from "@/lib/engine/correctionEngine";
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
    const rows = parseINVFile(content);

    let imported = 0;
    let skipped = 0;
    let duplicates = 0;
    const errors: string[] = [];

    for (const row of rows) {
      // Filter: only allow GF- prefixed Invoice_No
      if (!isValidINVNo(row.invoice_no)) {
        skipped++;
        errors.push(`Skip INV [${row.invoice_no}]: Prefix tidak valid`);
        continue;
      }

      // Parse date
      const invDate = parseDate(row.date);
      if (!invDate) {
        skipped++;
        errors.push(`Skip INV [${row.invoice_no}]: Invalid date "${row.date}"`);
        continue;
      }

      // Fix part number
      const fixedPartNo = fixPartNo(row.part_no);

      // Derive outlet_code from WO_No prefix area if needed
      const outletCode = row.outlet_code || "UNKNOWN";

      try {
        await prisma.pendingINV.upsert({
          where: {
            invoice_no_wo_no_part_no: {
              invoice_no: row.invoice_no,
              wo_no:      row.wo_no,
              part_no:    fixedPartNo,
            },
          },
          update: {},
          create: {
            outlet_code: outletCode,
            wo_no:       row.wo_no,
            invoice_no:  row.invoice_no,
            date:        invDate,
            part_no:     fixedPartNo,
            part_desc:   row.part_desc,
            unit_price:  safeFloat(row.unit_price),
            qty:         safeInt(row.qty),
            amount:      safeFloat(row.amount),
            discount:    safeFloat(row.discount),
            ppn:         safeFloat(row.ppn),
            total:       safeFloat(row.total),
            po_no:       row.po_no,
            raw_col_a:   row.raw_col_a,
            raw_col_b:   row.raw_col_b,
            status:      "PENDING",
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
          errors.push(
            `Error [${row.invoice_no}]: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }
    }

    // Save to history
    await prisma.uploadHistory.create({
      data: {
        file_name:   file.name,
        file_type:   "INV",
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
    console.error("Import INV error:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
