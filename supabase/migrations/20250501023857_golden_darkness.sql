/*
  # Seed Basic Tools

  Creates default tools for language model and web search capabilities 
  if they don't already exist.
*/

-- Insert GPT-4 tool if it doesn't exist
INSERT INTO public.tools (name, description, endpoint)
VALUES (
  'GPT-4',
  'OpenAI GPT-4 language model for general purpose AI tasks',
  'https://api.openai.com/v1/chat/completions'
)
ON CONFLICT (name) DO NOTHING;

-- Insert WebSearch tool if it doesn't exist
INSERT INTO public.tools (name, description, endpoint)
VALUES (
  'WebSearch',
  'Web search capability for retrieving real-time information',
  'https://api.search.service/search'
)
ON CONFLICT (name) DO NOTHING;