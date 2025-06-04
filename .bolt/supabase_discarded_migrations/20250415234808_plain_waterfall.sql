/*
  # Create agent_categories table

  1. New Tables
    - `agent_categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name
      - `description` (text) - Category description
      - `created_at` (timestamptz) - When the category was created
  
  2. Security
    - Enable RLS on `agent_categories` table
    - Add policy for authenticated users to read categories
    - Add policy for admins to create, update, and delete categories
*/

-- Create agent_categories table
CREATE TABLE IF NOT EXISTS agent_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable row level security
ALTER TABLE agent_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for all authenticated users to read agent categories
CREATE POLICY "Authenticated users can read agent_categories"
  ON agent_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for admins to manage agent categories
CREATE POLICY "Admins can manage agent_categories"
  ON agent_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Insert default categories
INSERT INTO agent_categories (name, description)
VALUES 
('Nutrition', 'Diet and food-related agents'),
('Fitness', 'Exercise and workout-related agents'),
('Feedback', 'User feedback collection agents'),
('General', 'General purpose assistants')
ON CONFLICT (name) DO NOTHING;