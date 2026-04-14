import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function initDb() {
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

export default sql;
