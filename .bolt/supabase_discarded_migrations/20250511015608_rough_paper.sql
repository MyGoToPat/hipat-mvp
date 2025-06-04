/*
  # Fix profiles RLS and add backfill

  1. Security Changes
    - Simplify admin policy to direct role check
    - Add trigger for automatic profile creation
    - Update RLS policies for better security
  
  2. Changes
    - Add backfill for existing users
    - Include timestamps in trigger insert
    - Maintain existing permissions structure
*/

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
  );
  return new;
end;
$$;

-- Create trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Update RLS policies
alter table public.profiles enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "profiles_self_access" on public.profiles;
drop policy if exists "admins_read_all" on public.profiles;
drop policy if exists "admins_update_all" on public.profiles;

-- Create new policies with simplified admin check
create policy "profiles_read_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "admins_manage_all"
  on public.profiles
  for all
  to authenticated
  using (role = 'admin')
  with check (role = 'admin');

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