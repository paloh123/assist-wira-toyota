import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/access";
import { hashPassword } from "@/lib/password";
import { ROLES, roleOptions } from "@/lib/roles";

const validRoles = new Set(roleOptions.map((role) => role.value));

export async function GET() {
  const blocked = await requireWriteAccess();
  if (blocked) return blocked;

  const users = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const blocked = await requireWriteAccess();
  if (blocked) return blocked;

  const body = await req.json();
  const username = String(body.username ?? "").trim();
  const name = String(body.name ?? "").trim();
  const password = String(body.password ?? "").trim();
  const role = String(body.role ?? ROLES.SERVICE_MANAGER).trim();

  if (!username || !name || !password) {
    return NextResponse.json(
      { error: "Username, nama, dan password wajib diisi." },
      { status: 400 }
    );
  }

  if (!validRoles.has(role as typeof ROLES[keyof typeof ROLES])) {
    return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        username,
        name,
        password_hash: await hashPassword(password),
        role,
      },
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Username sudah digunakan." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Gagal membuat akun." }, { status: 500 });
  }
}
