/*
  # Add user bootstrap RPC function
  
  1. New Functions
    - bootstrap_user: Creates required rows in profiles and user_settings tables
  
  2. Changes
    - Ensures user has required profile and settings records
    - Safe to call multiple times (idempotent)
*/

-- Create RPC function to bootstrap user records
create or replace function public.bootstrap_user()
returns void
language plpgsql
security definer
as $$
begin
  -- Ensure profile exists
  insert into public.profiles (id, email, role)
  values (
    auth.uid(),
    (select email from auth.users where id = auth.uid()),
    'user'
  )
  on conflict (id) do nothing;

  -- Ensure user_settings exists  
  insert into public.user_settings (user_id, silent_mode)
  values (auth.uid(), false)
  on conflict (user_id) do nothing;
end;
$$;