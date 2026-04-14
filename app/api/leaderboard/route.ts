import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const rows = db.prepare(`
    SELECT student_name, public_score, private_score, submitted_at
    FROM submissions s1
    WHERE id = (
      SELECT id FROM submissions s2
      WHERE s2.student_name = s1.student_name
      ORDER BY public_score DESC, id DESC
      LIMIT 1
    )
    ORDER BY public_score DESC
  `).all();
  return NextResponse.json(rows);
}
