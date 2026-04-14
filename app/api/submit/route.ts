import { NextRequest, NextResponse } from "next/server";
import db, { UPLOADS_DIR } from "@/lib/db";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = (formData.get("student_name") as string)?.trim();
  const file = formData.get("file") as File | null;

  if (!name) return NextResponse.json({ error: "student_name is required" }, { status: 400 });
  if (!file) return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
  if (!file.name.endsWith(".csv")) return NextResponse.json({ error: "Only CSV files accepted" }, { status: 400 });

  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  const safeName = name.replace(/\s+/g, "_");
  const filename = `${safeName}_${timestamp.replace(" ", "T").replace(/:/g, "-")}.csv`;

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);

  db.prepare(
    "INSERT INTO submissions (student_name, filename, submitted_at) VALUES (?, ?, ?)"
  ).run(name, filename, timestamp);

  return NextResponse.json({ message: "Submission received", submitted_at: timestamp });
}
