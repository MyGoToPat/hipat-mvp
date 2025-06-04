/*
  # Fix profiles RLS and ensure_profile function

  1. Security Changes
    - Drop all existing policies
    - Create new policies with proper auth.uid() checks
    - Add proper grants for ensure_profile function
  
  2. Changes
    - Improve ensure_profile() function with better error handling
    - Add proper search_path setting
*/

begin;

-- Enable RLS
alter table public.profiles enable row level security;

-- Drop all existing policies
do $$
declare
  pol record;
begin
  for pol in
    select policyname 
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles;', pol.policyname);
  end loop;
end$$;

-- Create self-access policy
create policy "profiles_self_access"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create admin policies
create policy "admins_read_all"
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

create policy "admins_update_all"
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

-- Create ensure_profile function
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
  on conflict (id) do update
  set email = EXCLUDED.email
  where profiles.email is null;
end;
$$;

-- Grant execute permission
grant execute on function public.ensure_profile to authenticated;

commit;