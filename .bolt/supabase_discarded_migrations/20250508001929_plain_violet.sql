/*
  # Fix profiles RLS and ensure_profile function

  1. Security Changes
    - Enable RLS on profiles table
    - Add policy for users to insert their own profile
    - Add policy for users to read/update their own profile
    - Add policy for admins to read/update all profiles
  
  2. Changes
    - Create ensure_profile() function with proper security context
    - Drop existing policies to avoid conflicts
    - Create new granular policies with proper auth checks
*/

begin;

-- Enable RLS
alter table public.profiles enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Profiles: self access" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

-- Create self-access policy
create policy "profiles_self_access"
  on public.profiles
  for all
  to authenticated
  using (uid() = id)
  with check (uid() = id);

-- Create admin access policies
create policy "admins read all"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
    )
  );

create policy "admins update all"
  on public.profiles
  for update
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
    )
  )
  with check (true);

-- Create ensure_profile function with proper security context
create or replace function public.ensure_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    auth.uid(),
    (select email from auth.users where id = auth.uid()),
    'user'
  )
  on conflict (id) do nothing;
end;
$$;

commit;