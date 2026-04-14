import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM submissions WHERE id = ${id}`;
  return NextResponse.json({ message: "Deleted" });
}
