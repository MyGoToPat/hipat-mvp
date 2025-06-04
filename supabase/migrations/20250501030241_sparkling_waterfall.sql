/*
  # Ensure each user has a user_settings record

  1. Changes
    - Add trigger to automatically create user_settings for new users
    - Add function to ensure existing users have settings
    - Create missing user_settings records for existing users
    - Add RPC function to safely set silent mode

  2. Security
    - Maintain existing RLS policies
    - Ensure only users can update their own settings
*/

-- Create RPC function to set silent mode (more convenient than direct update)
CREATE OR REPLACE FUNCTION public.set_silent_mode(mode BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  prev_mode BOOLEAN;
BEGIN
  -- Get the user ID from the current session
  user_id := auth.uid();
  
  -- Ensure user is authenticated
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Insert or update the user settings
  INSERT INTO public.user_settings (user_id, silent_mode)
  VALUES (user_id, mode)
  ON CONFLICT (user_id)
  DO UPDATE SET silent_mode = mode
  RETURNING silent_mode INTO prev_mode;
  
  -- Return previous value (for potential use in UI transitions)
  RETURN prev_mode;
END;
$$;

-- Function to ensure user_settings exists for each user on login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a record for the new user into user_settings
  INSERT INTO public.user_settings (user_id, silent_mode)
  VALUES (NEW.id, false)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run function on new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create user_settings for existing users who don't have them yet
INSERT INTO public.user_settings (user_id, silent_mode)
SELECT id, false
FROM auth.users
WHERE id NOT IN (
  SELECT user_id FROM public.user_settings
)
ON CONFLICT (user_id) DO NOTHING;

-- Update ChatSkeleton component to handle missing settings properly
COMMENT ON TABLE public.user_settings IS 'User preferences and settings';