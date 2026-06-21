"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/books", label: "Books" },
  { href: "/members", label: "Members" },
  { href: "/borrowings", label: "Borrowings" },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="border-b border-border bg-surface">
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-8 h-14">
        <span className="font-semibold tracking-tight text-accent text-sm uppercase">
          📚 NLS
        </span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm transition-colors ${
              path === l.href
                ? "text-text-primary font-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}