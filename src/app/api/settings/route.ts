import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/access";

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const blocked = await requireWriteAccess();
  if (blocked) return blocked;

  try {
    const body = await req.json();
    const { month, ratio, target_tam, hk, plan_per_day } = body;

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        month:       month || "",
        ratio:       parseFloat(ratio) || 1.1,
        target_tam:  parseInt(target_tam) || 0,
        hk:          parseInt(hk) || 0,
        plan_per_day: parseInt(plan_per_day) || 0,
      },
      create: {
        id:          1,
        month:       month || "",
        ratio:       parseFloat(ratio) || 1.1,
        target_tam:  parseInt(target_tam) || 0,
        hk:          parseInt(hk) || 0,
        plan_per_day: parseInt(plan_per_day) || 0,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: "Gagal menyimpan settings" }, { status: 500 });
  }
}
