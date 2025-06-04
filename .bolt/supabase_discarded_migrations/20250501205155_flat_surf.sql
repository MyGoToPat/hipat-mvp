/*
  # Update user settings RLS and trigger function

  1. Changes
    - Modify handle_new_user trigger function to be more robust
    - Update RLS policies for user_settings table
    - Add better error handling for user creation

  2. Security
    - Ensure RLS policies properly check user authentication
    - Use security definer for trigger function
    - Maintain existing security context
*/

-- Drop existing trigger function and recreate with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure we have a valid user ID
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;

  -- Insert user settings with explicit error handling
  BEGIN
    INSERT INTO public.user_settings (user_id, silent_mode)
    VALUES (NEW.id, false)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not create user settings for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "UserSettings read own" ON public.user_settings;
DROP POLICY IF EXISTS "UserSettings write own" ON public.user_settings;
DROP POLICY IF EXISTS "read own user_settings" ON public.user_settings;
DROP POLICY IF EXISTS "update own user_settings" ON public.user_settings;
DROP POLICY IF EXISTS "insert own user_settings" ON public.user_settings;

-- Create new, more specific policies
CREATE POLICY "read_own_settings"
  ON public.user_settings
  FOR SELECT
  TO public
  USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

CREATE POLICY "insert_own_settings"
  ON public.user_settings
  FOR INSERT
  TO public
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

CREATE POLICY "update_own_settings"
  ON public.user_settings
  FOR UPDATE
  TO public
  USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

-- Ensure RLS is enabled
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;