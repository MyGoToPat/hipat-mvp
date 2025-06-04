/*
  # Link agents to tools and update swarm references
  
  1. Changes
    - Safely links agents to their tools with better error handling
    - Ensures swarm_group_id is properly set for agents with swarm_group name
    - Uses more robust SQL to avoid NULL constraint violations
*/

-- First ensure all required tools and agents exist
-- before attempting to create relationships

-- Step 1: Link AMA_LLM agent to GPT-4 tool (only if both exist)
INSERT INTO public.agent_tools (agent_id, tool_id)
SELECT 
  a.id AS agent_id, 
  t.id AS tool_id
FROM 
  public.agents a,
  public.tools t
WHERE 
  a.role = 'AMA_LLM' AND
  t.name = 'GPT-4'
ON CONFLICT (agent_id, tool_id) DO NOTHING;

-- Step 2: Link AMA_Search agent to WebSearch tool (only if both exist)
INSERT INTO public.agent_tools (agent_id, tool_id)
SELECT 
  a.id AS agent_id, 
  t.id AS tool_id
FROM 
  public.agents a,
  public.tools t
WHERE 
  a.role = 'AMA_Search' AND
  t.name = 'WebSearch'
ON CONFLICT (agent_id, tool_id) DO NOTHING;

-- Step 3: Update swarm_group_id for agents belonging to AMA Swarm
UPDATE public.agents a
SET swarm_group_id = s.id
FROM public.swarms s
WHERE 
  s.name = 'AMA Swarm' AND
  a.swarm_group = 'AMA Swarm' AND
  (a.swarm_group_id IS NULL OR a.swarm_group_id != s.id);