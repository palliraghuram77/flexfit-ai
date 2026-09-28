-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- One row per user holding their whole app state as JSON.

create table if not exists public.profiles_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: the database itself refuses to show or change
-- anyone else's row, no matter what the browser code asks for.
alter table public.profiles_state enable row level security;

create policy "Users can read their own state"
  on public.profiles_state for select
  using (auth.uid() = user_id);

create policy "Users can insert their own state"
  on public.profiles_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own state"
  on public.profiles_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
