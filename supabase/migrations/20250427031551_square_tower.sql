-- schema -------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  agent_id   uuid references public.agents on delete cascade,
  user_id    uuid references auth.users on delete cascade,
  role       text check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz default now()
);

-- security -----------------------------------------------------
alter table public.messages enable row level security;

-- read: allow any authenticated user in dev
drop policy if exists messages_read on messages;
create policy messages_read
  on messages
  for select
  to authenticated
  using ( true );

-- insert: allow any authenticated user in dev
drop policy if exists messages_insert_dev on messages;
create policy messages_insert_dev
  on messages
  for insert
  to authenticated
  with check ( true );

-- (no update/delete policies yet – not needed for demo)