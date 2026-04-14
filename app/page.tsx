"use client";
import { useEffect, useState, useRef } from "react";

type Row = {
  student_name: string;
  public_score: number | null;
  private_score: number | null;
  submitted_at: string;
};

const fmt = (v: number | null) => (v != null ? v.toFixed(4) : "—");
const rankColor = (i: number) =>
  i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-500";
const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1);

export default function Home() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    const res = await fetch("/api/leaderboard");
    setRows(await res.json());
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("Uploading…");
    const fd = new FormData(formRef.current!);
    const res = await fetch("/api/submit", { method: "POST", body: fd });
    const data = await res.json();
    setMsgOk(res.ok);
    setMsg(res.ok ? `✓ Received at ${data.submitted_at} UTC. Scores appear after review.` : `✗ ${data.error}`);
    if (res.ok) { formRef.current!.reset(); load(); }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0f1117] text-slate-200 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-1">🏆 Competition Leaderboard</h1>
        <p className="text-center text-slate-500 text-sm mb-10">Rankings update after each scored submission</p>

        {/* Leaderboard table */}
        <div className="rounded-xl overflow-hidden shadow-xl mb-10 border border-[#2d3250]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#2d3250] text-slate-400 uppercase text-xs tracking-widest">
                <th className="px-5 py-3 text-left w-12">#</th>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-right">Public Score</th>
                <th className="px-5 py-3 text-right">Private Score</th>
                <th className="px-5 py-3 text-right hidden sm:table-cell">Submitted (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-600">
                    No scores yet — be the first!
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i} className="border-t border-[#2d3250] hover:bg-[#1a1f35] transition-colors">
                    <td className={`px-5 py-3 font-bold ${rankColor(i)}`}>{medal(i)}</td>
                    <td className="px-5 py-3 font-medium">{r.student_name}</td>
                    <td className="px-5 py-3 text-right font-mono text-emerald-400 font-semibold">{fmt(r.public_score)}</td>
                    <td className="px-5 py-3 text-right font-mono text-indigo-400 font-semibold">{fmt(r.private_score)}</td>
                    <td className="px-5 py-3 text-right text-slate-600 text-xs hidden sm:table-cell">{r.submitted_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Submit form */}
        <div className="bg-[#1e2130] rounded-xl p-6 border border-[#2d3250] shadow-xl">
          <h2 className="text-base font-semibold mb-4 text-slate-300">Submit your predictions</h2>
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap gap-3">
            <input
              name="student_name"
              type="text"
              placeholder="Your full name"
              required
              className="flex-1 min-w-[160px] bg-[#0f1117] border border-[#2d3250] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <input
              name="file"
              type="file"
              accept=".csv"
              required
              className="flex-1 min-w-[160px] bg-[#0f1117] border border-[#2d3250] rounded-lg px-3 py-2 text-sm text-slate-400 file:mr-3 file:bg-indigo-600 file:text-white file:border-0 file:rounded file:px-2 file:py-1 file:text-xs cursor-pointer"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
            >
              {loading ? "Uploading…" : "Submit"}
            </button>
          </form>
          {msg && <p className={`mt-3 text-sm ${msgOk ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>}
        </div>
      </div>
    </main>
  );
}
