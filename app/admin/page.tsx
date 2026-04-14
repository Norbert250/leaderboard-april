"use client";
import { useEffect, useState } from "react";

type Submission = {
  id: number;
  student_name: string;
  filename: string | null;
  submitted_at: string;
  public_score: number | null;
  private_score: number | null;
};

export default function AdminPage() {
  const [rows, setRows] = useState<Submission[]>([]);
  const [scores, setScores] = useState<Record<number, { pub: string; priv: string }>>({});
  const [newName, setNewName] = useState("");
  const [newPub, setNewPub] = useState("");
  const [newPriv, setNewPriv] = useState("");
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/submissions");
    const data: Submission[] = await res.json();
    setRows(data);
    const init: Record<number, { pub: string; priv: string }> = {};
    data.forEach((r) => {
      init[r.id] = {
        pub: r.public_score != null ? String(r.public_score) : "",
        priv: r.private_score != null ? String(r.private_score) : "",
      };
    });
    setScores(init);
  }

  useEffect(() => { load(); }, []);

  function flash(text: string, ok: boolean) { setMsg(text); setMsgOk(ok); }

  async function saveScore(id: number) {
    const s = scores[id];
    const res = await fetch("/api/admin/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        public_score: s.pub !== "" ? parseFloat(s.pub) : null,
        private_score: s.priv !== "" ? parseFloat(s.priv) : null,
      }),
    });
    const data = await res.json();
    flash(data.message || data.error, res.ok);
  }

  async function del(id: number) {
    if (!confirm(`Delete submission #${id}?`)) return;
    await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
    load();
  }

  async function addEntry() {
    if (!newName.trim()) { flash("Name is required", false); return; }
    const res = await fetch("/api/admin/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_name: newName.trim(),
        public_score: newPub !== "" ? parseFloat(newPub) : null,
        private_score: newPriv !== "" ? parseFloat(newPriv) : null,
      }),
    });
    const data = await res.json();
    flash(data.message || data.error, res.ok);
    if (res.ok) { setNewName(""); setNewPub(""); setNewPriv(""); load(); }
  }

  const inputCls = "bg-[#0f1117] border border-[#2d3250] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500";
  const scoreInputCls = "w-24 bg-[#0f1117] border border-[#2d3250] rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono";

  return (
    <main className="min-h-screen bg-[#0f1117] text-slate-200 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
        <p className="text-slate-500 text-sm mb-8">Review submissions · enter scores · manage entries</p>

        {/* Manual add */}
        <div className="bg-[#1e2130] rounded-xl p-5 border border-[#2d3250] mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Add entry manually</h2>
          <div className="flex flex-wrap gap-3">
            <input className={`${inputCls} flex-1 min-w-[160px]`} placeholder="Student name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input className={`${inputCls} w-36`} type="number" step="0.0001" placeholder="Public score" value={newPub} onChange={(e) => setNewPub(e.target.value)} />
            <input className={`${inputCls} w-36`} type="number" step="0.0001" placeholder="Private score" value={newPriv} onChange={(e) => setNewPriv(e.target.value)} />
            <button onClick={addEntry} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors">Add</button>
          </div>
          {msg && <p className={`mt-3 text-sm ${msgOk ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>}
        </div>

        {/* Submissions table */}
        <div className="rounded-xl overflow-hidden border border-[#2d3250] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#2d3250] text-slate-400 uppercase text-xs tracking-widest">
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">File</th>
                  <th className="px-4 py-3 text-left">Submitted (UTC)</th>
                  <th className="px-4 py-3 text-center">Public</th>
                  <th className="px-4 py-3 text-center">Private</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-600">No submissions yet.</td></tr>
                ) : rows.map((r) => (
                  <tr key={r.id} className="border-t border-[#2d3250] hover:bg-[#1a1f35] transition-colors">
                    <td className="px-4 py-3 text-slate-500">{r.id}</td>
                    <td className="px-4 py-3 font-medium">{r.student_name}</td>
                    <td className="px-4 py-3">
                      {r.filename
                        ? <a href={`/api/uploads/${r.filename}`} className="text-indigo-400 hover:underline text-xs" target="_blank">📄 download</a>
                        : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{r.submitted_at}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number" step="0.0001"
                        className={scoreInputCls}
                        value={scores[r.id]?.pub ?? ""}
                        onChange={(e) => setScores((s) => ({ ...s, [r.id]: { ...s[r.id], pub: e.target.value } }))}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number" step="0.0001"
                        className={scoreInputCls}
                        value={scores[r.id]?.priv ?? ""}
                        onChange={(e) => setScores((s) => ({ ...s, [r.id]: { ...s[r.id], priv: e.target.value } }))}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => saveScore(r.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1 text-xs font-medium transition-colors">Save</button>
                        <button onClick={() => del(r.id)} className="bg-red-600 hover:bg-red-500 text-white rounded px-3 py-1 text-xs font-medium transition-colors">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
