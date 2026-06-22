# Frontend Setup Guide — NLS Frontend

Next.js 16 + TypeScript + Tailwind CSS frontend for the Neighborhood Library Service.

## Prerequisites

- Node.js 20+
- npm
- The backend API running (see `BACKEND_SETUP.md`) — the frontend calls it directly

## 1. Navigate to the frontend folder

```bash
cd frontend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Verify Tailwind CSS is wired up correctly

This project uses **Tailwind v3**. Three files must all be present and correct, or styles silently fail to apply (you'll see plain unstyled HTML — black text, blue underlined links, no spacing).

**a) `postcss.config.js`** must exist at the project root:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**b) `app/globals.css`** must be imported in `app/layout.tsx`:

```tsx
import "./globals.css";
```

**c) `tailwind.config.ts`** content paths must match your folders:

```ts
content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
```

If any of these were missing, that's why the UI looked unstyled. All three should now be in place.

## 4. Configure environment variables

Create `.env.local`:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

## 5. (If accessing from another device on your network) Allow your LAN IP

If you open the app from a phone or another computer on your network (e.g. `http://192.168.x.x:3000`), Next.js 16 blocks cross-origin dev requests by default. Add your IP to `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.31.42"], // replace with your actual LAN IP
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
};

export default nextConfig;
```

Skip this step if you only ever access via `localhost:3000`.

## 6. Start the dev server

```bash
npm run dev
```

Open: **http://localhost:3000**

You should see a dark-themed dashboard with stat cards (Total Books, Members, Active Loans, Overdue) and a navbar (Dashboard / Books / Members / Borrowings).

## 7. Build for production (optional)

```bash
npm run build
npm run start
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| UI shows plain text, no colors, no cards, blue underlined links | `postcss.config.js` missing → Tailwind never compiles | Create `postcss.config.js` (see Step 3a), then `rm -rf .next && npm run dev` |
| `Failed to load next.config.ts` / `Unexpected end of JSON input` | Empty or missing `tsconfig.json`, or stale `.next` cache | Run `rm -rf .next node_modules/.cache && npm run dev`. If still broken, delete `tsconfig.json` and let `next dev` regenerate it |
| `⚠ Blocked cross-origin request ... allowedDevOrigins` | Accessing dev server via LAN IP instead of `localhost` | Add your IP to `allowedDevOrigins` in `next.config.ts` (see Step 5), or just use `localhost:3000` |
| Pages load but show no data / network errors in console | Backend not running, or wrong `NEXT_PUBLIC_API_URL` | Confirm `http://localhost:8000/health` works in browser first |
| Styles partially work but colors look wrong | Tailwind v3/v4 mismatch — config written for the wrong version | Run `cat package.json` and check the `tailwindcss` version; v3 needs `postcss.config.js` + `tailwind.config.ts`, v4 needs `@theme` in CSS instead |

## Quick Reference

```bash
# Daily startup (make sure backend is running first)
cd frontend
npm run dev

# If styles ever break again
rm -rf .next
npm run dev

# Production build
npm run build && npm run start
```