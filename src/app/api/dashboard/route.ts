import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalPendingWO,
      totalPendingINV,
      totalPlannedWO,
      totalPlannedINV,
      totalExportedWO,
      settings,
      todayPlan,
    ] = await Promise.all([
      prisma.pendingWO.count({ where: { status: "PENDING" } }),
      prisma.pendingINV.count({ where: { status: "PENDING" } }),
      prisma.pendingWO.count({ where: { status: "PLANNED" } }),
      prisma.pendingINV.count({ where: { status: "PLANNED" } }),
      prisma.pendingWO.count({ where: { status: "EXPORTED" } }),
      prisma.settings.findUnique({ where: { id: 1 } }),
      prisma.dailyPlan.findMany({
        orderBy: { plan_date: "desc" },
        take: 30,
      }),
    ]);

    // Calculate target required
    const targetRequired = settings
      ? Math.ceil(settings.target_tam * settings.ratio)
      : 0;

    // Today's actual
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayRecord = todayPlan.find(
      (p) => p.plan_date.toISOString().slice(0, 10) === todayStr
    );

    const todayActual = todayRecord?.actual_wo || 0;
    const todayTarget = todayRecord?.plan_count || settings?.plan_per_day || 0;

    // Chart data (last 30 days)
    const chartData = todayPlan.reverse().map((p) => ({
      date: p.plan_date.toISOString().slice(0, 10),
      plan: p.plan_count,
      actual: p.actual_wo,
    }));

    return NextResponse.json({
      totalPendingWO,
      totalPendingINV,
      totalPlannedWO,
      totalPlannedINV,
      totalExportedWO,
      targetRequired,
      targetTAM: settings?.target_tam || 0,
      ratio: settings?.ratio || 1.1,
      todayActual,
      todayTarget,
      chartData,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
