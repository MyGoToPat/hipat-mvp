/*
  # Create profiles table and security policies

  1. New Tables
    - `profiles`: Stores user profile information and role-based access control
      - `id` (uuid, primary key): References auth.users
      - `role` (text): User role with check constraint
      - `first_name` (text): Optional first name
      - `last_name` (text): Optional last name
      - `avatar_url` (text): Optional avatar image URL
      - `created_at` (timestamptz): Auto-managed creation timestamp
      - `updated_at` (timestamptz): Auto-managed update timestamp
      - `is_admin` (boolean): Admin status flag

  2. Security
    - Enable RLS on profiles table
    - Users can view their own profile
    - Users can update their own profile
    - Admins can view all profiles
    - Trainers can view assigned user profiles

  3. Changes
    - Creates profiles table with foreign key to auth.users
    - Adds role-based access control
    - Sets up RLS policies for different user roles
*/

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  role text NOT NULL DEFAULT 'user'::text,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_admin boolean DEFAULT false
);

-- Add role validation
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role = ANY (ARRAY['user'::text, 'manager'::text, 'trainer'::text, 'admin'::text]));

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security policies

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles profiles_1
    WHERE profiles_1.id = auth.uid() AND profiles_1.role = 'admin'
  )
);

-- Trainers can view assigned user profiles
CREATE POLICY "Trainers can view assigned user profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles profiles_1
    WHERE profiles_1.id = auth.uid() AND profiles_1.role = 'trainer'
  )
);