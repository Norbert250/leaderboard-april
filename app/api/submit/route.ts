import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sql, { initDb } from "@/lib/db";

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

  const blob = await put(filename, file, { access: "public" });

  await initDb();
  await sql`INSERT INTO submissions (student_name, file_url, submitted_at) VALUES (${name}, ${blob.url}, ${timestamp})`;

  return NextResponse.json({ message: "Submission received", submitted_at: timestamp });
}
