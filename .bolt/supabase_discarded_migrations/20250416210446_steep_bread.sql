/*
  # Add default_api_model column to agents table

  1. Modified Tables
    - `agents`
      - Added `default_api_model` (text) - The default API model to use for this agent
  
  2. Actions
    - Check if column exists before adding
    - Reload schema cache
*/

-- Check if default_api_model column exists in agents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'default_api_model'
  ) THEN
    ALTER TABLE public.agents ADD COLUMN default_api_model TEXT;
    RAISE NOTICE 'Added default_api_model column to agents table';
  ELSE
    RAISE NOTICE 'default_api_model column already exists in agents table';
  END IF;
END $$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verification query to confirm reload
SELECT 'Schema cache explicitly reloaded at ' || now() as reload_confirmation;