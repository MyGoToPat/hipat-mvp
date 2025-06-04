/*
  # Fix user_settings RLS policies

  1. Security Changes
    - Update RLS policies to use correct auth.uid() function
    - Ensure proper authentication checks
    - Maintain existing permissions structure
*/

-- Drop existing policies
DROP POLICY IF EXISTS "UserSettings self access" ON public.user_settings;

-- Create new policy with correct auth.uid() function
CREATE POLICY "UserSettings self access"
ON public.user_settings
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to service role
GRANT ALL ON public.user_settings TO service_role;