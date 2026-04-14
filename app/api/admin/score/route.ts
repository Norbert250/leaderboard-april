import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  const data = await req.json();

  if ("id" in data) {
    db.prepare("UPDATE submissions SET public_score=?, private_score=? WHERE id=?")
      .run(data.public_score ?? null, data.private_score ?? null, data.id);
    return NextResponse.json({ message: "Score updated" });
  }

  const name = (data.student_name ?? "").trim();
  if (!name) return NextResponse.json({ error: "student_name or id required" }, { status: 400 });

  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  db.prepare(
    "INSERT INTO submissions (student_name, public_score, private_score, submitted_at) VALUES (?,?,?,?)"
  ).run(name, data.public_score ?? null, data.private_score ?? null, timestamp);

  return NextResponse.json({ message: "Entry added", submitted_at: timestamp });
}
