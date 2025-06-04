/*
  # Add missing columns to existing tables

  1. Modified Tables
    - `agents`
      - Added `category` (text) - Category for the agent (Nutrition, Fitness, etc)
    
    - `agent_categories`
      - Added `description` (text) - Description of the category
  
  2. Changes
    - Use DO blocks to safely add columns only if they don't already exist
    - Reload schema cache to ensure changes are immediately available
*/

-- Check and add category column to agents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.agents ADD COLUMN category TEXT;
    RAISE NOTICE 'Added category column to agents table';
  ELSE
    RAISE NOTICE 'category column already exists in agents table';
  END IF;
END $$;

-- Check and add description column to agent_categories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'agent_categories' AND column_name = 'description'
  ) THEN
    ALTER TABLE public.agent_categories ADD COLUMN description TEXT;
    RAISE NOTICE 'Added description column to agent_categories table';
  ELSE
    RAISE NOTICE 'description column already exists in agent_categories table';
  END IF;
END $$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';