/*
  # Create agents table

  1. New Tables
    - `agents`
      - `id` (uuid, primary key)
      - `role` (text, unique) - The role identifier for the agent
      - `description` (text) - Description of what the agent does
      - `created_at` (timestamptz) - When the agent was created
  
  2. Security
    - Enable RLS on `agents` table
    - Add policy for all authenticated users to read agents
*/

CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.agents
FOR SELECT
TO authenticated
USING (true);