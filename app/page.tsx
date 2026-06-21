import { booksApi, membersApi, borrowingsApi } from "@/lib/api";
import StatCard from "@/components/StatCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [books, members, active, overdue] = await Promise.all([
    booksApi.list(0, 1),
    membersApi.list(0, 1),
    borrowingsApi.active(0, 1),
    borrowingsApi.overdue(0, 1),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Library at a glance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Books" value={books.total} accent="accent" />
        <StatCard label="Members" value={members.total} />
        <StatCard label="Active Loans" value={active.total} accent="success" />
        <StatCard label="Overdue" value={overdue.total} accent="danger" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/books", label: "Manage Books", desc: "Add, edit, or remove books from the catalog." },
          { href: "/members", label: "Manage Members", desc: "Register new members or update existing ones." },
          { href: "/borrowings", label: "Borrow / Return", desc: "Record checkouts, returns, and view overdue loans." },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block bg-surface border border-border rounded-lg p-5 hover:border-accent transition-colors group"
          >
            <p className="font-medium text-text-primary group-hover:text-accent transition-colors">
              {card.label}
            </p>
            <p className="text-text-muted text-sm mt-1">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}