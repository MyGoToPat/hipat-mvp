/*
  # Patch Manager Agent with Swarm Routing

  Updates the manager agent's prompt and configuration to include routing rules
  for the AMA swarm.
*/

-- Update the manager agent with swarm routing capabilities
WITH swarm AS (
  SELECT id FROM public.swarms WHERE name = 'AMA Swarm'
)
UPDATE public.agents
SET 
  prompt = 'You are the Manager, the coordinator for all PAT''s capabilities.
When a user message arrives, determine if it should be:
1. Handled directly by you (for simple, administrative queries)
2. Routed to the AMA Swarm (for general knowledge questions)
3. Routed to a specialized agent (for domain-specific tasks)

For AMA Swarm routing:
- Route factual queries and web information needs to AMA_Search
- Route complex reasoning, opinions, and creative tasks to AMA_LLM
- Default route is AMA_LLM for general purposes

Always maintain a friendly, helpful tone and ensure seamless routing experience for the user.',
  
  memory_flags = jsonb_set(
    COALESCE(memory_flags, '{}'::jsonb),
    '{routing_enabled}',
    'true'::jsonb
  ),
  
  tools_json = jsonb_build_array(
    jsonb_build_object(
      'type', 'routing',
      'config', jsonb_build_object(
        'default_swarm', (SELECT id FROM swarm),
        'default_agent', 'AMA_LLM'
      )
    )
  )
WHERE role = 'Manager' OR name = 'Manager';