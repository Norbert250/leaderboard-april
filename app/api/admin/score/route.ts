import { NextRequest, NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const data = await req.json();
  await initDb();

  if ("id" in data) {
    await sql`UPDATE submissions SET public_score=${data.public_score ?? null}, private_score=${data.private_score ?? null} WHERE id=${data.id}`;
    return NextResponse.json({ message: "Score updated" });
  }

  const name = (data.student_name ?? "").trim();
  if (!name) return NextResponse.json({ error: "student_name or id required" }, { status: 400 });

  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  await sql`INSERT INTO submissions (student_name, public_score, private_score, submitted_at) VALUES (${name}, ${data.public_score ?? null}, ${data.private_score ?? null}, ${timestamp})`;

  return NextResponse.json({ message: "Entry added", submitted_at: timestamp });
}
