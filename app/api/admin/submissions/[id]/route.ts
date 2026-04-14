import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.prepare("DELETE FROM submissions WHERE id = ?").run(id);
  return NextResponse.json({ message: "Deleted" });
}
