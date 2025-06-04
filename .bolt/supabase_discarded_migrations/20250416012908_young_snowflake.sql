/*
  # Reload Schema Cache

  This migration explicitly reloads the Supabase schema cache to ensure all column changes
  are recognized by both the frontend and backend without requiring a full server restart.
  
  This is especially important after adding or modifying columns like:
  - `category` column in the `agents` table
  - `description` column in the `agent_categories` table
*/

-- First, verify that the required columns exist
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'category'
) as agents_category_exists;

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'agent_categories' AND column_name = 'description'
) as agent_categories_description_exists;

-- Explicitly reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Verification query to confirm reload
SELECT 'Schema cache explicitly reloaded at ' || now() as reload_confirmation;