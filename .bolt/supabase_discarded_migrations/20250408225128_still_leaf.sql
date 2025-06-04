/*
  # Create profiles table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - References auth.users.id
      - `name` (text) - User's display name
      - `email` (text) - User's email address
      - `avatar_url` (text, nullable) - URL to user's avatar image
      - `fitness_goals` (text[], nullable) - Array of user's fitness goals
      - `nutrition_preferences` (text[], nullable) - Array of user's nutrition preferences
      - `created_at` (timestamptz) - When the profile was created
      - `updated_at` (timestamptz) - When the profile was last updated
  
  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read and update their own profile
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  fitness_goals TEXT[],
  nutrition_preferences TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable row level security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);