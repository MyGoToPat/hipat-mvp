-- wipe accidental dupes
delete from public.agents where role = 'Manager';
-- Manager skeleton (only if it doesn't exist)
insert into public.agents (id,  name,  role,   description,                    provider,  prompt,  category, input_types, token_budget)
select                  gen_random_uuid(),
                        'Pat-Manager',
                        'Manager',
                        'Routes user turns to the correct swarm / agent.',
                        'internal',
                        'Return ONLY the name of the sub-agent to handle the turn.',
                        'System',
                        array ['text'],
                        8000
where not exists (select 1 from public.agents where role = 'Manager');

-- AMA_LLM stub (same guard)
insert into public.agents (id,  name,  role,   description, provider, prompt,                 category, input_types, token_budget)
select                  gen_random_uuid(),
                        'AMA_LLM',
                        'AMA_LLM',
                        'Answers general questions via GPT-4.',
                        'OpenAI',
                        'Be concise and correct.',
                        'General',
                        array ['text'],
                        4000
where not exists (select 1 from public.agents where role = 'AMA_LLM');

-- attach AMA_LLM to GPT-4 tool if missing
insert into public.agent_tools (agent_id, tool_id)
select  (select id from public.agents where role='AMA_LLM'),
        (select id from public.tools  where name='GPT-4')
where not exists (
  select 1 from public.agent_tools
  where agent_id = (select id from public.agents where role='AMA_LLM')
);

-- point Manager at AMA_LLM for now
update public.agents
set tools_json = '["AMA_LLM"]'::jsonb
where role = 'Manager';