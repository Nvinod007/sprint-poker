-- Safe to re-run on an EXISTING Supabase project.
-- Do NOT paste full schema.sql again — tables/policies already exist.

-- Columns added after v1 launch
alter table public.rooms add column if not exists facilitator_id uuid references public.participants (id) on delete set null;
alter table public.rooms add column if not exists name text;

-- Leave room + host cleanup (skip if policy already exists)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'participants' and policyname = 'participants_delete'
  ) then
    create policy "participants_delete" on public.participants for delete using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'rooms' and policyname = 'rooms_delete'
  ) then
    create policy "rooms_delete" on public.rooms for delete using (true);
  end if;
end $$;

-- Realtime (ignore if tables already in publication)
do $$
begin
  alter publication supabase_realtime add table public.rooms;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.participants;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.votes;
exception when duplicate_object then null;
end $$;
