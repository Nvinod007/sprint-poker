# Sprint Poker

Real-time planning poker for agile teams. Create a room, share a short code, and estimate stories together — no login required.

## Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, RupeeLens-inspired theme tokens
- **UI:** shadcn/ui-style components (Button, Input, Card, Badge, Avatar)
- **Animation:** framer-motion
- **Icons:** lucide-react
- **Theme:** next-themes (system / light / dark)
- **Backend:** Supabase (Postgres + Realtime)

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy keys from `.env.example` into your local env file:

   ```bash
   cp .env.example .env.local
   ```

   Required variables:

   | Variable | Description |
   |----------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

   Optional:

   | Variable | Description |
   |----------|-------------|
   | `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO/sitemap (default: `http://localhost:3000`) |

3. **Database**

   Run the SQL in [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. This creates `rooms`, `participants`, and `votes` tables, RLS policies, and enables Realtime. Rooms track a `facilitator_id` (host) who can reveal votes, start new rounds, and edit the story title.

   **Existing projects:** run the migration comment at the top of `schema.sql` to add `facilitator_id`. Older rooms without a host cannot reveal until recreated.

   If the `alter publication` lines fail, enable Realtime manually: **Database → Publications → supabase_realtime** and add the three tables.

4. **Run dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home — create a room or join with a code |
| `/join/[code]` | Enter display name to join a room |
| `/room/[code]` | Live voting room (`?p=<participantId>` restores your session on refresh or share) |

## How it works

1. **Create room** — assigns a creative name (e.g. Thunder Avenger) and a short join code (e.g. SPARK), sets you as host.
2. **Join room** — enter a code and display name; your participant ID is stored in `localStorage`.
3. **Vote** — pick a Fibonacci card (1, 2, 3, 5, 8, 13, 21, ?, ☕). Votes stay hidden until reveal.
4. **Reveal** — only the room host can reveal all votes.
5. **New round** — host clears votes and hides cards for the next story.

Live updates use **Supabase Realtime (WebSocket)**, not polling — see [docs/realtime-sync.md](./docs/realtime-sync.md).

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/README.md](./docs/README.md) | Doc index |
| [docs/architecture.md](./docs/architecture.md) | Routes, session model, module map |
| [docs/realtime-sync.md](./docs/realtime-sync.md) | Realtime + refetch flow (mermaid diagrams) |

> Local-only notes (`docs/PLAN.md`, `docs/CHANGELOG.md`) are gitignored and not published to the repo.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
