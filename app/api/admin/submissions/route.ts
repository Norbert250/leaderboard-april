import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const rows = db.prepare("SELECT * FROM submissions ORDER BY submitted_at DESC").all();
  return NextResponse.json(rows);
}
