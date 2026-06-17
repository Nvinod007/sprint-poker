-- Add creative room names for existing databases
alter table public.rooms add column if not exists name text;
