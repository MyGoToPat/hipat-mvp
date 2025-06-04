/*
  # Tool Registry and Agent-Tool Linking Migration

  1. New Tables
    - `tools`: Stores available tools with name, description, endpoint
    - `agent_tools`: Junction table linking agents to tools (many-to-many)

  2. Schema Changes
    - Add `swarm_group_id` column to `agents` table

  3. Security
    - Enable RLS on all new tables
    - Create read policies for authenticated users
    - Create write policies restricted to admin role
*/

-- tools registry
create table public.tools (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    endpoint text not null,
    created_at timestamptz default now()
);

-- link agents ↔ tools
alter table public.agents
    add column if not exists swarm_group_id uuid;

create table public.agent_tools (
    agent_id uuid references public.agents(id) on delete cascade,
    tool_id  uuid references public.tools(id)  on delete cascade,
    primary key (agent_id, tool_id)
);

-- RLS: allow reads to all authed users
alter table public.tools        enable row level security;
alter table public.agent_tools  enable row level security;

create policy "tools_read" on public.tools
    for select using ( auth.role() in ('authenticated','service_role') );

create policy "agent_tools_read" on public.agent_tools
    for select using ( auth.role() in ('authenticated','service_role') );

-- writes restricted to admins
create policy "tools_write_admin" on public.tools
    for all using ( auth.role() = 'admin' ) with check ( auth.role() = 'admin' );

create policy "agent_tools_write_admin" on public.agent_tools
    for all using ( auth.role() = 'admin' ) with check ( auth.role() = 'admin' );