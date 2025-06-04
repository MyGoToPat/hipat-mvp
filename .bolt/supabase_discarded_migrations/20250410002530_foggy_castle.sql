/*
  # Create agents table and update profiles table

  1. New Tables
    - `agents`
      - `id` (uuid, primary key)
      - `name` (text) - The name of the agent
      - `role` (text) - The role of the agent (e.g., 'TellMeWhatYouAte', 'TellMeAboutYourWorkout')
      - `description` (text) - Description of the agent's purpose
      - `provider` (text) - The AI provider (e.g., 'OpenAI', 'Claude')
      - `created_by` (uuid) - References auth.users.id
      - `created_at` (timestamptz) - When the agent was created
  
  2. Modified Tables
    - `profiles`
      - Added `is_admin` (boolean) - Flag to identify admin users
  
  3. Security
    - Enable RLS on `agents` table
    - Add policy for authenticated users to read agents
    - Add policy for admin users to create, update, and delete agents
*/

-- First check if agents table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agents') THEN
    -- Create agents table if it doesn't exist
    CREATE TABLE public.agents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      description TEXT,
      provider TEXT NOT NULL,
      created_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ DEFAULT now()
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS agents_role_idx ON agents(role);
    
    -- Enable row level security
    ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for authenticated users to read agents
    CREATE POLICY "Users can read agents"
      ON agents
      FOR SELECT
      TO authenticated
      USING (true);
    
    -- Create policy for admin users to insert agents
    CREATE POLICY "Admins can insert agents"
      ON agents
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email LIKE '%admin%'
        )
      );
    
    -- Create policy for admin users to update agents
    CREATE POLICY "Admins can update agents"
      ON agents
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email LIKE '%admin%'
        )
      );
    
    -- Create policy for admin users to delete agents
    CREATE POLICY "Admins can delete agents"
      ON agents
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email LIKE '%admin%'
        )
      );
  END IF;
END $$;

-- Add is_admin field to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Insert example agents if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM agents LIMIT 1) THEN
    INSERT INTO agents (name, role, description, provider) VALUES 
    ('Nutrition Assistant', 'TellMeWhatYouAte', 'Analyzes your meals and provides nutritional insights', 'OpenAI'),
    ('Workout Analyzer', 'TellMeAboutYourWorkout', 'Reviews your exercise routines and suggests improvements', 'OpenAI'),
    ('Life Coach', 'MakeMeBetter', 'Provides personalized guidance for self-improvement', 'OpenAI'),
    ('General Assistant', 'AskMeAnything', 'Answers general questions about health and fitness', 'OpenAI');
  END IF;
END $$;