/*
  # Swarms Table and AMA Swarm Seed

  1. New Tables
    - `swarms`: Stores swarm definitions with name, description, purpose
  
  2. Schema Changes
    - Ensures foreign key relationship between agents.swarm_group_id and swarms.id
  
  3. Security
    - Enable RLS on swarms table
    - Allow authenticated users to read swarms
    - Restrict write operations to admins
*/

-- Create swarms table
CREATE TABLE IF NOT EXISTS public.swarms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  purpose text,
  manager_agent_id uuid REFERENCES public.agents(id),
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add foreign key constraint from agents to swarms
ALTER TABLE public.agents
  ADD CONSTRAINT agents_swarm_group_id_fkey
  FOREIGN KEY (swarm_group_id) REFERENCES public.swarms(id)
  ON DELETE SET NULL;

-- Enable RLS on swarms table
ALTER TABLE public.swarms ENABLE ROW LEVEL SECURITY;

-- Create policies for swarms table
CREATE POLICY "swarms_read" 
  ON public.swarms
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "swarms_write_admin" 
  ON public.swarms
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Seed the AMA swarm
INSERT INTO public.swarms (name, description, purpose, config)
VALUES (
  'AMA Swarm', 
  'Ask Me Anything swarm combining LLM and search capabilities',
  'General knowledge and information retrieval',
  '{"routing": {"default": "AMA_LLM", "factual": "AMA_Search"}}'
);