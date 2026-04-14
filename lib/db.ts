import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

function getDb() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

export async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      student_name TEXT NOT NULL,
      public_score REAL,
      private_score REAL,
      file_url TEXT,
      submitted_at TEXT NOT NULL
    )
  `;
}

export default function sql() {
  return getDb();
}
