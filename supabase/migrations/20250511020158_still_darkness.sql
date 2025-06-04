/*
  # Fix profiles RLS and add backfill

  1. Security Changes
    - Drop existing policies
    - Create simplified admin policy
    - Add trigger for automatic profile creation
  
  2. Changes
    - Add backfill for existing users
    - Include timestamps in trigger INSERT
    - Improve error handling
*/

begin;

-- Drop existing policies
drop policy if exists "profiles_self_access" on public.profiles;
drop policy if exists "admins_read_all" on public.profiles;
drop policy if exists "admins_update_all" on public.profiles;

-- Create new policies
create policy "profiles_self_access"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "admins_manage_all"
  on public.profiles
  for all
  to authenticated
  using (role = 'admin')
  with check (true);

-- Create/replace profile creation trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    role,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    'user',
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill profiles for existing users
insert into public.profiles (id, email, role, created_at, updated_at)
select 
  id,
  email,
  'user',
  now(),
  now()
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

commit;