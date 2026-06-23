import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [plans, settings] = await Promise.all([
    prisma.dailyPlan.findMany({
      orderBy: { plan_date: "asc" },
      take: 90,
    }),
    prisma.settings.findUnique({ where: { id: 1 } }),
  ]);

  const targetRequired = settings
    ? Math.ceil(settings.target_tam * settings.ratio)
    : 0;
  const dailyTarget = settings?.plan_per_day || 0;

  const rows = plans.map((p) => {
    const ratio = p.plan_count > 0 ? (p.actual_wo / p.plan_count) * 100 : 0;
    const status =
      ratio >= 100 ? "TERCAPAI" : ratio >= 80 ? "HAMPIR" : "KURANG";
    return {
      date:          p.plan_date.toISOString().slice(0, 10),
      plan:          p.plan_count,
      actual_wo:     p.actual_wo,
      actual_inv:    p.actual_inv,
      ratio:         Math.round(ratio),
      status,
      selisih:       p.plan_count - p.actual_wo,
    };
  });

  const totalActual = rows.reduce((s, r) => s + r.actual_wo, 0);
  const totalPlan   = rows.reduce((s, r) => s + r.plan, 0);
  const overallRatio = totalPlan > 0 ? Math.round((totalActual / totalPlan) * 100) : 0;

  return NextResponse.json({
    rows,
    summary: {
      targetRequired,
      targetTAM:     settings?.target_tam || 0,
      ratio:         settings?.ratio || 1.1,
      dailyTarget,
      totalActual,
      totalPlan,
      overallRatio,
    },
  });
}
