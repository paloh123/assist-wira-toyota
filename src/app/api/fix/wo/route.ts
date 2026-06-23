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

  const where: Prisma.PendingWOWhereInput = {
    status: { in: ["PLANNED"] },
    ...(upload_date ? { upload_date: new Date(upload_date) } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.pendingWO.findMany({ where, orderBy: { wo_date: "asc" }, skip, take: limit }),
    prisma.pendingWO.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  const blocked = await requireWriteAccess();
  if (blocked) return blocked;

  const body = await req.json();

  // Single row update
  if (body.id) {
    const { id, ...fields } = body;
    const data: Prisma.PendingWOUpdateInput = {};
    if (fields.operation_type !== undefined) data.operation_type = fields.operation_type;
    if (fields.upload_date    !== undefined) data.upload_date    = new Date(fields.upload_date);
    if (fields.operation_desc !== undefined) data.operation_desc = fields.operation_desc;
    if (fields.remark         !== undefined) data.remark         = fields.remark;
    if (fields.status         !== undefined) data.status         = fields.status;

    await prisma.pendingWO.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  }

  // Bulk update
  if (body.ids && Array.isArray(body.ids)) {
    const updateData: Prisma.PendingWOUpdateInput = {};
    if (body.upload_date    !== undefined) updateData.upload_date    = new Date(body.upload_date);
    if (body.operation_type !== undefined) updateData.operation_type = body.operation_type;
    if (body.status         !== undefined) updateData.status         = body.status;

    await prisma.pendingWO.updateMany({
      where: { id: { in: body.ids } },
      data: updateData,
    });
    return NextResponse.json({ success: true, updated: body.ids.length });
  }

  return NextResponse.json({ error: "id atau ids wajib diisi" }, { status: 400 });
}
