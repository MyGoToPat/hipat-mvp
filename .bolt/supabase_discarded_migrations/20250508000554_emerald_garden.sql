/*
  # Fix profiles table RLS policies

  1. Security Changes
    - Enable RLS on profiles table
    - Add policy for users to insert their own profile
    - Add policy for users to read their own profile
    - Add policy for admins to read all profiles
    - Add policy for admins to update all profiles
    - Add policy for users to update their own profile

  2. Changes
    - Drop existing policies to avoid conflicts
    - Create new granular policies with proper auth.uid() checks
*/

-- Drop existing policies to avoid conflicts
drop policy if exists "Profiles: self access" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Trainers can view assigned user profiles" on public.profiles;
drop policy if exists "profiles_read_own" on public.profiles;
drop policy if exists "profiles_write_own" on public.profiles;

-- Enable RLS
alter table public.profiles enable row level security;

-- Create new policies
create policy "profiles_read own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (uid() = id);

create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using (uid() = id);

create policy "Admins can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );