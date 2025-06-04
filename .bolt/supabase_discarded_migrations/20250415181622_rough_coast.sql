/*
  # Update agents table schema with extended fields

  1. Modified Tables
    - `agents`
      - Added `category` (text) - Category for the agent (Nutrition, Fitness, etc)
      - Added `prompt` (text) - Instructions defining agent behavior
      - Added `knowledge_base` (text[]) - Links to user docs, PDFs, video codes
      - Added `context_window` (text) - Short, Medium, Long-term context retention
      - Added `priority` (text) - Primary, Secondary, Tertiary for routing logic
      - Added `trigger_keywords` (text[]) - Agent-specific phrase triggers
      - Added `linked_api_models` (text[]) - Link to API models
      - Added `input_types` (text[]) - Supported input types (text, voice, photo)
      - Added `free_access` (boolean) - Whether agent is included in free plan
      - Added `premium_access` (boolean) - Whether agent is restricted to premium plan
      - Added `status` (text) - Development stage (dev, beta, live)
      - Added `version` (text) - For tracking changes and rollbacks
  
  2. Security
    - Maintain existing RLS policies for the agents table
*/

-- Add new columns to the agents table if they don't exist
DO $$
BEGIN
  -- Check and add category column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'category') THEN
    ALTER TABLE agents ADD COLUMN category TEXT;
  END IF;

  -- Check and add prompt column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'prompt') THEN
    ALTER TABLE agents ADD COLUMN prompt TEXT;
  END IF;

  -- Check and add knowledge_base column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'knowledge_base') THEN
    ALTER TABLE agents ADD COLUMN knowledge_base TEXT[];
  END IF;

  -- Check and add context_window column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'context_window') THEN
    ALTER TABLE agents ADD COLUMN context_window TEXT;
  END IF;

  -- Check and add priority column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'priority') THEN
    ALTER TABLE agents ADD COLUMN priority TEXT;
  END IF;

  -- Check and add trigger_keywords column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'trigger_keywords') THEN
    ALTER TABLE agents ADD COLUMN trigger_keywords TEXT[];
  END IF;

  -- Check and add linked_api_models column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'linked_api_models') THEN
    ALTER TABLE agents ADD COLUMN linked_api_models TEXT[];
  END IF;

  -- Check and add input_types column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'input_types') THEN
    ALTER TABLE agents ADD COLUMN input_types TEXT[] DEFAULT '{text}';
  END IF;

  -- Check and add free_access column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'free_access') THEN
    ALTER TABLE agents ADD COLUMN free_access BOOLEAN DEFAULT TRUE;
  END IF;

  -- Check and add premium_access column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'premium_access') THEN
    ALTER TABLE agents ADD COLUMN premium_access BOOLEAN DEFAULT FALSE;
  END IF;

  -- Check and add status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'status') THEN
    ALTER TABLE agents ADD COLUMN status TEXT DEFAULT 'dev';
  END IF;

  -- Check and add version column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'version') THEN
    ALTER TABLE agents ADD COLUMN version TEXT;
  END IF;
END $$;