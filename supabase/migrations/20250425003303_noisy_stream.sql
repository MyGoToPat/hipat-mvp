/*
  # Add assistant_id and token_budget columns to agents table

  1. Schema Changes
    - Add `assistant_id` column of type UUID to `agents` table to store references to external assistant IDs
    - Add `token_budget` column of type INTEGER to `agents` table with default value of 0 to track token usage
  
  2. Security
    - Ensure RLS is enabled on the `agents` table
    - Update read policy for the `agents` table to allow any authenticated user to read all agents
    - Maintain existing policies for other operations
*/

-- Add missing columns to agents table
ALTER TABLE public.agents 
  ADD COLUMN IF NOT EXISTS assistant_id UUID,
  ADD COLUMN IF NOT EXISTS token_budget INTEGER DEFAULT 0;

-- Ensure RLS is enabled
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Update/create read policy for agents table
DROP POLICY IF EXISTS "agents_read" ON public.agents;
CREATE POLICY "agents_read" 
  ON public.agents
  FOR SELECT 
  TO authenticated
  USING (true);