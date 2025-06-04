begin;

-- Drop any remaining duplicate policies that might exist
drop policy if exists "Users can insert their own settings" on public.user_settings;
drop policy if exists "Users can view their own settings" on public.user_settings;
drop policy if exists "Users can update their own settings" on public.user_settings;
drop policy if exists "Users can view and update their own settings" on public.user_settings;
drop policy if exists "UserSettings self access" on public.user_settings;
drop policy if exists "user_settings_read" on public.user_settings;
drop policy if exists "user_settings_write" on public.user_settings;
drop policy if exists "user_settings_self_select" on public.user_settings;
drop policy if exists "user_settings_self_update" on public.user_settings;

-- Verify the correct policies exist (recreate if missing)
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_settings' 
    and policyname = 'user_settings_insert_own'
  ) then
    create policy "user_settings_insert_own"
    on public.user_settings
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_settings' 
    and policyname = 'user_settings_select_own'
  ) then
    create policy "user_settings_select_own"
    on public.user_settings
    for select
    to authenticated
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_settings' 
    and policyname = 'user_settings_update_own'
  ) then
    create policy "user_settings_update_own"
    on public.user_settings
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end $$;

commit;