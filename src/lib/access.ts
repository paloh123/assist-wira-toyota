import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canWrite } from "@/lib/roles";

export async function requireWriteAccess() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canWrite((session.user as { role?: string }).role)) {
    return NextResponse.json(
      { error: "Role ini hanya bisa melihat data." },
      { status: 403 }
    );
  }

  return null;
}
