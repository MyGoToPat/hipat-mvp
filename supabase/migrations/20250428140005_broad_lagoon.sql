/*
  # Add memory_flags column to agents table
  
  1. Schema Changes
    - Add `memory_flags` column of type JSONB to the `agents` table
    - Set default value to empty JSON object
  
  2. Changes
    - This allows agents to store configuration for memory management
    - Default empty object ensures backward compatibility with existing code
*/

-- Add memory_flags column to agents table if it doesn't exist
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS memory_flags JSONB DEFAULT '{}'::JSONB;

-- No need for additional RLS policies as existing policies cover this column