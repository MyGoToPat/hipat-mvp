/*
  # Fix user settings RLS policies and initialization

  1. Security
    - Drop and recreate RLS policies with unique names
    - Add trigger for automatic user_settings creation
    - Enable RLS on table
  
  2. Changes
    - Ensure table exists
    - Create initialization trigger
    - Add granular policies for INSERT/SELECT/UPDATE
*/

-- Wrap in transaction for atomicity
begin;

-- Ensure table exists (idempotent)
create table if not exists public.user_settings (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  silent_mode boolean not null default false,
  updated_at  timestamptz not null default now()
);

-- Enable RLS
alter table public.user_settings enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "user_settings_insert_own" on public.user_settings;
drop policy if exists "user_settings_select_own" on public.user_settings;
drop policy if exists "user_settings_update_own" on public.user_settings;

-- Create granular policies with unique names
create policy "user_settings_insert_own"
on public.user_settings
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_settings_select_own"
on public.user_settings
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_settings_update_own"
on public.user_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create/replace initialization trigger function
create or replace function public.handle_new_user_settings()
returns trigger as $$
begin
  insert into public.user_settings (user_id, silent_mode)
  values (new.id, false)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop and recreate trigger
drop trigger if exists on_auth_user_created_settings on auth.users;

create trigger on_auth_user_created_settings
  after insert on auth.users
  for each row
  execute function public.handle_new_user_settings();

commit;