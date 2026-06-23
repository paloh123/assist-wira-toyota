import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireWriteAccess } from "@/lib/access";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;
  const skip = (page - 1) * limit;

  const where: Prisma.PendingINVWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { wo_no: { contains: search } },
            { invoice_no: { contains: search } },
            { part_no: { contains: search } },
            { part_desc: { contains: search } },
            { outlet_code: { contains: search } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.pendingINV.findMany({
      where,
      orderBy: { created_at: "asc" },
      skip,
      take: limit,
    }),
    prisma.pendingINV.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  const blocked = await requireWriteAccess();
  if (blocked) return blocked;

  const body = await req.json();
  const { ids, status, upload_date, part_no } = body;

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  const updateData: Prisma.PendingINVUpdateInput = {};
  if (status) updateData.status = status;
  if (upload_date) updateData.upload_date = new Date(upload_date);
  if (part_no !== undefined) updateData.part_no = part_no;

  await prisma.pendingINV.updateMany({
    where: { id: { in: ids } },
    data: updateData,
  });

  return NextResponse.json({ success: true, updated: ids.length });
}

export async function DELETE(req: NextRequest) {
  const blocked = await requireWriteAccess();
  if (blocked) return blocked;

  const body = await req.json();
  const { ids } = body;

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  await prisma.pendingINV.deleteMany({ where: { id: { in: ids } } });
  return NextResponse.json({ success: true, deleted: ids.length });
}
