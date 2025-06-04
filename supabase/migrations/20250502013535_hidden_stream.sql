/*
  # Fix user_settings RLS policies

  1. Security Changes
    - Drop existing policies
    - Create separate policies for INSERT and SELECT/UPDATE operations
    - Ensure proper auth.uid() checks for both operations
    - Maintain service_role access

  2. Changes
    - More granular RLS policies for better security control
    - Explicit INSERT policy to fix the 42501 violation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "UserSettings self access" ON public.user_settings;
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;

-- Create separate policies for different operations
CREATE POLICY "Users can insert their own settings"
ON public.user_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view and update their own settings"
ON public.user_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to service role
GRANT ALL ON public.user_settings TO service_role;