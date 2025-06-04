/*
  # Add workout templates table

  1. New Tables
    - `workout_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text, not null)
      - `description` (text)
      - `difficulty` (text, check constraint for valid values)
      - `estimated_duration` (integer, minutes)
      - `exercises` (jsonb, array of exercise objects)
      - `is_public` (boolean, default false)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  
  2. Security
    - Enable RLS on `workout_templates` table
    - Add policy for users to manage their own templates
    - Add policy for users to view public templates
    - Add policy for admins to manage all templates
*/

-- Create workout_templates table
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  estimated_duration integer,
  exercises jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS workout_templates_user_id_idx ON public.workout_templates(user_id);
CREATE INDEX IF NOT EXISTS workout_templates_is_public_idx ON public.workout_templates(is_public);

-- Enable Row Level Security
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own templates
CREATE POLICY "Users can view their own workout templates"
  ON public.workout_templates
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can view public templates
CREATE POLICY "Users can view public workout templates"
  ON public.workout_templates
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Users can insert their own templates
CREATE POLICY "Users can insert their own workout templates"
  ON public.workout_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own templates
CREATE POLICY "Users can update their own workout templates"
  ON public.workout_templates
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own templates
CREATE POLICY "Users can delete their own workout templates"
  ON public.workout_templates
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all templates
CREATE POLICY "Admins can manage all workout templates"
  ON public.workout_templates
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