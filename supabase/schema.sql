-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query)
-- to set up cloud save storage for the gacha sim.

create table if not exists public.saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.saves enable row level security;

-- Each user can only ever see/write the row matching their own auth id.
create policy "Users can view own save"
  on public.saves for select
  using (auth.uid() = user_id);

create policy "Users can insert own save"
  on public.saves for insert
  with check (auth.uid() = user_id);

create policy "Users can update own save"
  on public.saves for update
  using (auth.uid() = user_id);
