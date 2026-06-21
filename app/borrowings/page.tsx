"use client";
import { useEffect, useState } from "react";
import { borrowingsApi, booksApi, membersApi, type Borrowing, type Book, type Member } from "@/lib/api";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";

function statusVariant(s: string) {
  if (s === "active") return "success";
  if (s === "overdue") return "danger";
  return "neutral";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BorrowingsPage() {
  const [tab, setTab] = useState<"active" | "overdue">("active");
  const [rows, setRows] = useState<Borrowing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBorrow, setShowBorrow] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [borrowForm, setBorrowForm] = useState({ member_id: "", book_id: "", due_days: 14 });
  const [borrowError, setBorrowError] = useState("");
  const [borrowing, setBorrowing] = useState(false);
  const [returning, setReturning] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = tab === "active" ? await borrowingsApi.active() : await borrowingsApi.overdue();
      setRows(res.items); setTotal(res.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const openBorrow = async () => {
    const [b, m] = await Promise.all([booksApi.list(0, 100), membersApi.list(0, 100, true)]);
    setBooks(b.items); setMembers(m.items);
    setBorrowForm({ member_id: "", book_id: "", due_days: 14 });
    setBorrowError(""); setShowBorrow(true);
  };

  const handleBorrow = async () => {
    setBorrowing(true); setBorrowError("");
    try {
      await borrowingsApi.borrow(borrowForm.member_id, borrowForm.book_id, borrowForm.due_days);
      setShowBorrow(false); await load();
    } catch (e: any) { setBorrowError(e.message); }
    finally { setBorrowing(false); }
  };

  const handleReturn = async (id: string) => {
    setReturning(id);
    try { await borrowingsApi.return(id); await load(); }
    catch (e: any) { alert(e.message); }
    finally { setReturning(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Borrowings</h1>
          <p className="text-text-muted text-sm mt-0.5">{total} {tab}</p>
        </div>
        <button onClick={openBorrow} className="bg-accent hover:bg-accent/80 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Borrow Book
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-surface border border-border rounded-lg p-1 w-fit">
        {(["active", "overdue"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t ? "bg-accent text-white" : "text-text-muted hover:text-text-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <p className="text-text-muted text-sm">Loading…</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted text-xs uppercase tracking-widest">
              <th className="text-left py-3 pr-4">Book</th>
              <th className="text-left py-3 pr-4">Member</th>
              <th className="text-left py-3 pr-4">Borrowed</th>
              <th className="text-left py-3 pr-4">Due</th>
              <th className="text-left py-3 pr-4">Status</th>
              <th className="text-left py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                <td className="py-3 pr-4 font-medium text-text-primary">{r.book?.title ?? r.book_id.slice(0, 8)}</td>
                <td className="py-3 pr-4 text-text-muted">{r.member?.name ?? r.member_id.slice(0, 8)}</td>
                <td className="py-3 pr-4 text-text-muted font-mono text-xs">{fmtDate(r.borrowed_at)}</td>
                <td className="py-3 pr-4 text-text-muted font-mono text-xs">{fmtDate(r.due_date)}</td>
                <td className="py-3 pr-4">
                  <Badge label={r.status} variant={statusVariant(r.status)} />
                </td>
                <td className="py-3">
                  {r.status !== "returned" && (
                    <button
                      onClick={() => handleReturn(r.id)}
                      disabled={returning === r.id}
                      className="text-xs text-success hover:underline disabled:opacity-50"
                    >
                      {returning === r.id ? "Returning…" : "Return"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showBorrow && (
        <Modal title="Borrow a Book" onClose={() => setShowBorrow(false)}>
          <div className="space-y-4">
            {borrowError && <p className="text-danger text-xs bg-danger/10 border border-danger/20 rounded p-2">{borrowError}</p>}
            <div>
              <label className="block text-xs text-text-muted mb-1">Member *</label>
              <select
                value={borrowForm.member_id}
                onChange={(e) => setBorrowForm({ ...borrowForm, member_id: e.target.value })}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="">Select member…</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Book *</label>
              <select
                value={borrowForm.book_id}
                onChange={(e) => setBorrowForm({ ...borrowForm, book_id: e.target.value })}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="">Select book…</option>
                {books.filter((b) => b.available_copies > 0).map((b) => (
                  <option key={b.id} value={b.id}>{b.title} ({b.available_copies} left)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Loan Duration (days)</label>
              <input
                type="number" min={1} max={90}
                value={borrowForm.due_days}
                onChange={(e) => setBorrowForm({ ...borrowForm, due_days: parseInt(e.target.value) || 14 })}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleBorrow} disabled={borrowing || !borrowForm.member_id || !borrowForm.book_id}
                className="flex-1 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                {borrowing ? "Processing…" : "Confirm Borrow"}
              </button>
              <button onClick={() => setShowBorrow(false)} className="flex-1 bg-surface border border-border text-text-muted text-sm py-2 rounded-lg hover:text-text-primary transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}