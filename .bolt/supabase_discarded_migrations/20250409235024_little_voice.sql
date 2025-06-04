/*
  # Create agents table

  1. New Tables
    - `agents`
      - `id` (uuid, primary key)
      - `name` (text) - The name of the agent
      - `role` (text) - The role of the agent (e.g., 'TellMeWhatYouAte', 'TellMeAboutYourWorkout')
      - `description` (text) - Description of the agent's purpose
      - `provider` (text) - The AI provider (e.g., 'OpenAI', 'Claude')
      - `created_by` (uuid) - References auth.users.id
      - `created_at` (timestamptz) - When the agent was created
  
  2. Security
    - Enable RLS on `agents` table
    - Add policy for authenticated users to read agents
    - Add policy for admin users to create, update, and delete agents
*/

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  provider TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS agents_role_idx ON agents(role);

-- Enable row level security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Create policy for all authenticated users to read agents
CREATE POLICY "Authenticated users can read agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for admin users to insert agents
CREATE POLICY "Admin users can insert agents"
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
CREATE POLICY "Admin users can update agents"
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
CREATE POLICY "Admin users can delete agents"
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