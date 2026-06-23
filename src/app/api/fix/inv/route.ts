import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireWriteAccess } from "@/lib/access";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const upload_date = searchParams.get("upload_date");
  const page  = parseInt(searchParams.get("page")  || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const skip  = (page - 1) * limit;

  const where: Prisma.PendingINVWhereInput = {
    status: { in: ["PLANNED"] },
    ...(upload_date ? { upload_date: new Date(upload_date) } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.pendingINV.findMany({ where, orderBy: { date: "asc" }, skip, take: limit }),
    prisma.pendingINV.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  const blocked = await requireWriteAccess();
  if (blocked) return blocked;

  const body = await req.json();

  if (body.id) {
    const { id, ...fields } = body;
    const data: Prisma.PendingINVUpdateInput = {};
    if (fields.upload_date !== undefined) data.upload_date = new Date(fields.upload_date);
    if (fields.part_no     !== undefined) data.part_no     = fields.part_no;
    if (fields.part_desc   !== undefined) data.part_desc   = fields.part_desc;
    if (fields.qty         !== undefined) data.qty         = parseInt(fields.qty);
    if (fields.amount      !== undefined) data.amount      = parseFloat(fields.amount);
    if (fields.status      !== undefined) data.status      = fields.status;

    await prisma.pendingINV.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  }

  if (body.ids && Array.isArray(body.ids)) {
    const updateData: Prisma.PendingINVUpdateInput = {};
    if (body.upload_date !== undefined) updateData.upload_date = new Date(body.upload_date);
    if (body.status      !== undefined) updateData.status      = body.status;

    await prisma.pendingINV.updateMany({
      where: { id: { in: body.ids } },
      data: updateData,
    });
    return NextResponse.json({ success: true, updated: body.ids.length });
  }

  return NextResponse.json({ error: "id atau ids wajib diisi" }, { status: 400 });
}
