/*
  # Create agents table

  1. New Tables
    - `agents`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the agent
      - `role` (text) - Role of the agent (e.g., TellMeWhatYouAte, TellMeAboutYourWorkout)
      - `description` (text) - Detailed description of the agent's purpose
      - `provider` (text) - The AI model provider for this agent
      - `created_by` (uuid) - References the user who created the agent
      - `created_at` (timestamptz) - When the agent was created
  
  2. Security
    - Enable RLS on `agents` table
    - Add policy for admins to read, insert, update, and delete agents
    - Add policy for regular users to only read agents
*/

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  provider TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS agents_role_idx ON agents(role);
CREATE INDEX IF NOT EXISTS agents_created_by_idx ON agents(created_by);

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
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create policy for admin users to update agents
CREATE POLICY "Admins can update agents"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create policy for admin users to delete agents
CREATE POLICY "Admins can delete agents"
  ON agents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Add is_admin field to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
END $$;