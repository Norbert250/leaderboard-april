import { NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const rows = await sql()`SELECT * FROM submissions ORDER BY submitted_at DESC`;
  return NextResponse.json(rows);
}
