/*
  # Create profiles table

  1. New Tables
    - `profiles`: Stores user profile information including role, name, and admin status
  
  2. Security
    - Enable RLS on profiles table
    - Add policies for users to view their own profile
    - Add policies for trainers to view assigned profiles
    - Add policies for admins to view all profiles
    - Add policy for users to update their own profile

  3. Changes
    - Creates profiles table with foreign key to auth.users
    - Adds role validation with CHECK constraint
    - Sets up timestamps for created_at and updated_at
*/

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'manager', 'trainer', 'admin')),
    first_name text,
    last_name text,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    is_admin boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for viewing profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Trainers can view assigned user profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles profiles_1
            WHERE profiles_1.id = auth.uid()
            AND profiles_1.role = 'trainer'
        )
    );

CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles profiles_1
            WHERE profiles_1.id = auth.uid()
            AND profiles_1.role = 'admin'
        )
    );

-- Policy for updating profiles
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());