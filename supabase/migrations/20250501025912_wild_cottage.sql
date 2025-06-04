-- create table (run only if it doesn't exist)
create table if not exists public.user_settings (
    user_id uuid primary key references auth.users(id) on delete cascade,
    silent_mode boolean not null default false,
    created_at timestamptz default now()
);

alter table public.user_settings enable row level security;

-- read own / admin
create policy "UserSettings read own" on public.user_settings
for select using ( auth.uid() = user_id );

-- write own / admin
create policy "UserSettings write own" on public.user_settings
for all using ( auth.uid() = user_id );

-- allow service-role bypass
grant select, insert, update, delete on public.user_settings to service_role;

-- seed dev user row (skip if exists)
insert into public.user_settings (user_id, silent_mode)
select id, false
from auth.users
where email = 'dev@example.com'  -- adjust if your dev email differs
on conflict do nothing;