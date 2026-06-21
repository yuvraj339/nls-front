"use client";
import { useEffect, useState } from "react";
import { booksApi, type Book } from "@/lib/api";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";

type FormData = {
  title: string; author: string; isbn: string;
  genre: string; total_copies: number;
};

const empty: FormData = { title: "", author: "", isbn: "", genre: "", total_copies: 1 };

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await booksApi.list(0, 50);
      setBooks(res.items);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setFormError(""); setShowModal(true); };
  const openEdit = (b: Book) => {
    setEditing(b);
    setForm({ title: b.title, author: b.author, isbn: b.isbn || "", genre: b.genre || "", total_copies: b.total_copies });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true); setFormError("");
    try {
      const payload = { ...form, isbn: form.isbn || null, genre: form.genre || null };
      if (editing) await booksApi.update(editing.id, payload);
      else await booksApi.create(payload);
      setShowModal(false);
      await load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this book?")) return;
    try { await booksApi.delete(id); await load(); }
    catch (e: any) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Books</h1>
          <p className="text-text-muted text-sm mt-0.5">{total} in catalog</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-accent hover:bg-accent/80 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add Book
        </button>
      </div>

      {loading && <p className="text-text-muted text-sm">Loading…</p>}
      {error && <p className="text-danger text-sm">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted text-xs uppercase tracking-widest">
              <th className="text-left py-3 pr-4">Title</th>
              <th className="text-left py-3 pr-4">Author</th>
              <th className="text-left py-3 pr-4">ISBN</th>
              <th className="text-left py-3 pr-4">Genre</th>
              <th className="text-left py-3 pr-4">Availability</th>
              <th className="text-left py-3"></th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                <td className="py-3 pr-4 font-medium text-text-primary">{b.title}</td>
                <td className="py-3 pr-4 text-text-muted">{b.author}</td>
                <td className="py-3 pr-4 font-mono text-xs text-text-muted">{b.isbn || "—"}</td>
                <td className="py-3 pr-4 text-text-muted">{b.genre || "—"}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    {/* Signature: segmented availability bar */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: b.total_copies }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-3 rounded-sm ${i < b.available_copies ? "bg-success" : "bg-danger/60"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-text-muted font-mono">
                      {b.available_copies}/{b.total_copies}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(b)} className="text-xs text-accent hover:underline">Edit</button>
                    <button onClick={() => handleDelete(b.id)} className="text-xs text-danger hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Book" : "Add Book"} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {formError && <p className="text-danger text-xs bg-danger/10 border border-danger/20 rounded p-2">{formError}</p>}
            {[
              { label: "Title *", key: "title", type: "text" },
              { label: "Author *", key: "author", type: "text" },
              { label: "ISBN", key: "isbn", type: "text" },
              { label: "Genre", key: "genre", type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-xs text-text-muted mb-1">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-text-muted mb-1">Total Copies *</label>
              <input
                type="number" min={1}
                value={form.total_copies}
                onChange={(e) => setForm({ ...form, total_copies: parseInt(e.target.value) || 1 })}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-surface border border-border text-text-muted text-sm py-2 rounded-lg hover:text-text-primary transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}