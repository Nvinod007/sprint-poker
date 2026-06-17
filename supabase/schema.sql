-- Sprint Poker v1 schema
--
-- FRESH project: run this entire file once in Supabase SQL Editor.
-- EXISTING project (you already ran schema before): do NOT re-run this file.
--   Use supabase/upgrade-existing.sql instead — it only adds missing columns/policies.

create extension if not exists "pgcrypto";

-- Rooms
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text,
  story_title text,
  revealed boolean not null default false,
  facilitator_id uuid references public.participants (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Migration for existing databases:
-- alter table public.rooms add column if not exists facilitator_id uuid references public.participants (id) on delete set null;
-- alter table public.rooms add column if not exists name text;
-- Rooms created before facilitator_id was added have facilitator_id = null; reveal/reset/title edit are disabled until a new room is created.
-- Rooms created before name was added have name = null; the app derives a display name from code when needed.

create index if not exists rooms_code_idx on public.rooms (code);

-- Participants
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists participants_room_id_idx on public.participants (room_id);

-- Votes
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  participant_id uuid not null references public.participants (id) on delete cascade,
  value text not null check (value in ('1', '2', '3', '5', '8', '13', '21', '?', '☕')),
  created_at timestamptz not null default now(),
  unique (room_id, participant_id)
);

create index if not exists votes_room_id_idx on public.votes (room_id);

-- Row Level Security (anon-friendly for v1)
alter table public.rooms enable row level security;
alter table public.participants enable row level security;
alter table public.votes enable row level security;

create policy "rooms_select" on public.rooms for select using (true);
create policy "rooms_insert" on public.rooms for insert with check (true);
create policy "rooms_update" on public.rooms for update using (true);
create policy "rooms_delete" on public.rooms for delete using (true);

create policy "participants_select" on public.participants for select using (true);
create policy "participants_insert" on public.participants for insert with check (true);
create policy "participants_delete" on public.participants for delete using (true);

create policy "votes_select" on public.votes for select using (true);
create policy "votes_insert" on public.votes for insert with check (true);
create policy "votes_update" on public.votes for update using (true);
create policy "votes_delete" on public.votes for delete using (true);

-- Realtime (enable replication for these tables in Dashboard > Database > Publications,
-- or run the following if using supabase_realtime publication)
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.participants;
alter publication supabase_realtime add table public.votes;
