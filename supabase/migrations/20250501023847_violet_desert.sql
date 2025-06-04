/*
  # Seed AMA Swarm Agents

  Creates the necessary agents for the AMA (Ask Me Anything) swarm:
  - AMA_LLM: Primary language model agent for general queries
  - AMA_Search: Search-augmented agent for factual information
*/

-- Create AMA Swarm agents if they don't already exist

-- Get the swarm ID
WITH swarm AS (
  SELECT id FROM public.swarms WHERE name = 'AMA Swarm'
)
-- Insert AMA_LLM agent
INSERT INTO public.agents (
  name,
  role,
  description,
  prompt,
  category,
  swarm_group,
  swarm_group_id,
  input_types,
  free_access,
  premium_access,
  status,
  tools_json,
  memory_flags
)
SELECT
  'AMA_LLM',
  'AMA_LLM',
  'Primary language model for general queries and creative tasks',
  'You are AMA_LLM, the primary language model in the Ask Me Anything swarm.
You excel at:
- Complex reasoning and explanations
- Creative writing and ideation
- Opinion-based responses
- Nuanced conversation

Always be helpful, accurate, and engaging.',
  'General',
  'AMA Swarm',
  id,
  ARRAY['text', 'voice', 'photo']::text[],
  true,
  true,
  'live',
  '[{"type":"code_interpreter"}, {"type":"retrieval"}]'::jsonb,
  '{"persist_context":true,"retain_history":true}'::jsonb
FROM swarm
WHERE NOT EXISTS (
  SELECT 1 FROM public.agents WHERE role = 'AMA_LLM'
);

-- Insert AMA_Search agent
WITH swarm AS (
  SELECT id FROM public.swarms WHERE name = 'AMA Swarm'
)
INSERT INTO public.agents (
  name,
  role,
  description,
  prompt,
  category,
  swarm_group,
  swarm_group_id,
  input_types,
  free_access,
  premium_access,
  status,
  tools_json,
  memory_flags
)
SELECT
  'AMA_Search',
  'AMA_Search',
  'Search-augmented agent for factual information and web queries',
  'You are AMA_Search, the search-specialized agent in the Ask Me Anything swarm.
You excel at:
- Retrieving factual information
- Web searches and real-time data
- Finding specific details and references
- Providing sources and citations

Always verify information and prefer recent, authoritative sources.',
  'General',
  'AMA Swarm',
  id,
  ARRAY['text']::text[],
  true,
  true,
  'live',
  '[{"type":"web_search"}]'::jsonb,
  '{"persist_context":false,"retain_history":true}'::jsonb
FROM swarm
WHERE NOT EXISTS (
  SELECT 1 FROM public.agents WHERE role = 'AMA_Search'
);