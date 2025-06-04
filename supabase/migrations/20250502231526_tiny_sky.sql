/*
  # Fix user settings RLS and add missing columns

  1. Security
    - Drop existing policies
    - Create new policies with proper auth.uid() checks
    - Add updated_at column for tracking changes
  
  2. Changes
    - Ensure table has all required columns
    - Add trigger to update timestamp
*/

begin;

-- Ensure updated_at column exists
alter table public.user_settings 
  add column if not exists updated_at timestamptz default now();

-- Create trigger to update timestamp
create or replace function public.update_user_settings_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add trigger if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_trigger 
    where tgname = 'set_user_settings_timestamp'
  ) then
    create trigger set_user_settings_timestamp
      before update on public.user_settings
      for each row
      execute function public.update_user_settings_timestamp();
  end if;
end $$;

-- Drop existing policies
drop policy if exists "user_settings_insert_own" on public.user_settings;
drop policy if exists "user_settings_select_own" on public.user_settings;
drop policy if exists "user_settings_update_own" on public.user_settings;

-- Create new policies
create policy "user_settings_self_access"
  on public.user_settings
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

commit;