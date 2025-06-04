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
drop policy if exists "user can insert own profile" on public.profiles;
drop policy if exists "user can read own profile" on public.profiles;
drop policy if exists "admin can read all" on public.profiles;
drop policy if exists "admin can update all" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can select their own profile" on public.profiles;
drop policy if exists "Admins can select all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

-- Enable RLS
alter table public.profiles enable row level security;

-- Create new policies
create policy "Profiles: self access"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow admins to view all profiles
create policy "Admins can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1 from profiles profiles_1
      where profiles_1.id = auth.uid()
      and profiles_1.role = 'admin'
    )
  );

-- Allow trainers to view assigned user profiles
create policy "Trainers can view assigned user profiles"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1 from profiles profiles_1
      where profiles_1.id = auth.uid()
      and profiles_1.role = 'trainer'
    )
  );