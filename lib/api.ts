const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const V1 = `${BASE}/api/v1`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${V1}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  genre: string | null;
  total_copies: number;
  available_copies: number;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Borrowing {
  id: string;
  member_id: string;
  book_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: "active" | "returned" | "overdue";
  created_at: string;
  member?: Member;
  book?: Book;
}

export interface PaginatedResponse<T> {
  total: number;
  items: T[];
}

// ── Books ──────────────────────────────────────────────────────────────────

export const booksApi = {
  list: (skip = 0, limit = 50) =>
    request<PaginatedResponse<Book>>(`/books/?skip=${skip}&limit=${limit}`),

  get: (id: string) => request<Book>(`/books/${id}`),

  create: (data: Omit<Book, "id" | "available_copies" | "created_at" | "updated_at">) =>
    request<Book>("/books/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Book>) =>
    request<Book>(`/books/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => request<void>(`/books/${id}`, { method: "DELETE" }),
};

// ── Members ────────────────────────────────────────────────────────────────

export const membersApi = {
  list: (skip = 0, limit = 50, activeOnly = false) =>
    request<PaginatedResponse<Member>>(
      `/members/?skip=${skip}&limit=${limit}&active_only=${activeOnly}`
    ),

  get: (id: string) => request<Member>(`/members/${id}`),

  create: (data: Omit<Member, "id" | "is_active" | "created_at" | "updated_at">) =>
    request<Member>("/members/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Member>) =>
    request<Member>(`/members/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => request<void>(`/members/${id}`, { method: "DELETE" }),
};

// ── Borrowings ─────────────────────────────────────────────────────────────

export const borrowingsApi = {
  borrow: (member_id: string, book_id: string, due_days = 14) =>
    request<Borrowing>("/borrowings/borrow", {
      method: "POST",
      body: JSON.stringify({ member_id, book_id, due_days }),
    }),

  return: (borrowing_id: string) =>
    request<Borrowing>("/borrowings/return", {
      method: "POST",
      body: JSON.stringify({ borrowing_id }),
    }),

  active: (skip = 0, limit = 50) =>
    request<PaginatedResponse<Borrowing>>(`/borrowings/active?skip=${skip}&limit=${limit}`),

  overdue: (skip = 0, limit = 50) =>
    request<PaginatedResponse<Borrowing>>(`/borrowings/overdue?skip=${skip}&limit=${limit}`),

  byMember: (member_id: string, skip = 0, limit = 50) =>
    request<PaginatedResponse<Borrowing>>(
      `/borrowings/member/${member_id}?skip=${skip}&limit=${limit}`
    ),

  get: (id: string) => request<Borrowing>(`/borrowings/${id}`),
};