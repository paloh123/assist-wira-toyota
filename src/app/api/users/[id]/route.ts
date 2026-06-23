import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/access";
import { hashPassword } from "@/lib/password";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = await requireWriteAccess();
  if (blocked) return blocked;

  const { id } = await params;
  const body = await req.json();
  const userId = Number(id);

  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: "ID user tidak valid." }, { status: 400 });
  }

  const data: {
    is_active?: boolean;
    password_hash?: string;
    name?: string;
  } = {};

  if (typeof body.is_active === "boolean") data.is_active = body.is_active;
  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim();
  }
  if (typeof body.password === "string" && body.password.trim()) {
    data.password_hash = await hashPassword(body.password.trim());
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada perubahan untuk disimpan." },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  });

  return NextResponse.json({ success: true, user });
}
