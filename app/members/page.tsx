"use client";
import { useEffect, useState } from "react";
import { membersApi, type Member } from "@/lib/api";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";

type FormData = { name: string; email: string; phone: string; address: string };
const empty: FormData = { name: "", email: "", phone: "", address: "" };

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await membersApi.list(0, 50);
      setMembers(res.items); setTotal(res.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setFormError(""); setShowModal(true); };
  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({ name: m.name, email: m.email, phone: m.phone || "", address: m.address || "" });
    setFormError(""); setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true); setFormError("");
    try {
      const payload = { ...form, phone: form.phone || null, address: form.address || null };
      if (editing) await membersApi.update(editing.id, payload);
      else await membersApi.create(payload);
      setShowModal(false); await load();
    } catch (e: any) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  const toggleActive = async (m: Member) => {
    try { await membersApi.update(m.id, { is_active: !m.is_active }); await load(); }
    catch (e: any) { alert(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    try { await membersApi.delete(id); await load(); }
    catch (e: any) { alert(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-text-muted text-sm mt-0.5">{total} registered</p>
        </div>
        <button onClick={openCreate} className="bg-accent hover:bg-accent/80 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Add Member
        </button>
      </div>

      {loading && <p className="text-text-muted text-sm">Loading…</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted text-xs uppercase tracking-widest">
              <th className="text-left py-3 pr-4">Name</th>
              <th className="text-left py-3 pr-4">Email</th>
              <th className="text-left py-3 pr-4">Phone</th>
              <th className="text-left py-3 pr-4">Status</th>
              <th className="text-left py-3"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                <td className="py-3 pr-4 font-medium text-text-primary">{m.name}</td>
                <td className="py-3 pr-4 text-text-muted">{m.email}</td>
                <td className="py-3 pr-4 text-text-muted">{m.phone || "—"}</td>
                <td className="py-3 pr-4">
                  <Badge label={m.is_active ? "Active" : "Inactive"} variant={m.is_active ? "success" : "neutral"} />
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)} className="text-xs text-accent hover:underline">Edit</button>
                    <button onClick={() => toggleActive(m)} className="text-xs text-warning hover:underline">
                      {m.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="text-xs text-danger hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Member" : "Add Member"} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {formError && <p className="text-danger text-xs bg-danger/10 border border-danger/20 rounded p-2">{formError}</p>}
            {[
              { label: "Name *", key: "name" },
              { label: "Email *", key: "email" },
              { label: "Phone", key: "phone" },
              { label: "Address", key: "address" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs text-text-muted mb-1">{label}</label>
                <input
                  type={key === "email" ? "email" : "text"}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors">
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