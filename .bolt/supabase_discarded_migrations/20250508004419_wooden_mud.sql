begin;

-- Enable RLS
alter table public.profiles enable row level security;

-- Drop existing policies
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename  = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles;', pol.policyname);
  end loop;
end$$;

-- Self access policy
create policy "self_access"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin read policy
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

-- Admin update policy
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

-- Profile creation function
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