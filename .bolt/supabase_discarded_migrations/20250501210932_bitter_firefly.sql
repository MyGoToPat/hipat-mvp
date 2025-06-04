/*
  # Create profiles table and security policies

  1. New Tables
    - `profiles`: Stores user profile information linked to auth.users
      - `id` (uuid, primary key) - References auth.users
      - `role` (text) - User role with check constraint
      - `first_name` (text) - Optional first name
      - `last_name` (text) - Optional last name
      - `avatar_url` (text) - Optional avatar URL
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `is_admin` (boolean) - Admin flag

  2. Security
    - Enable RLS on profiles table
    - Users can view their own profile
    - Admins can view all profiles
    - Users can update their own profile
    - Trainers can view assigned user profiles
*/

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'user'::text,
    first_name text,
    last_name text,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    is_admin boolean DEFAULT false,
    CONSTRAINT profiles_role_check CHECK (role = ANY (ARRAY['user'::text, 'manager'::text, 'trainer'::text, 'admin'::text]))
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM profiles profiles_1
            WHERE profiles_1.id = auth.uid()
            AND profiles_1.role = 'admin'
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
            WHERE profiles_1.id = auth.uid()
            AND profiles_1.role = 'trainer'
        )
    );

-- Add profile trigger to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();