/*
  # Remove duplicate user settings policies

  1. Changes
    - Drop duplicate policies that may have been created by previous migrations
    - Wrapped in transaction for atomicity
    - Idempotent - safe to run multiple times
*/

begin;

-- Drop any duplicate policies that may exist
drop policy if exists "Users can insert their own settings" on public.user_settings;
drop policy if exists "Users can view their own settings" on public.user_settings;
drop policy if exists "Users can update their own settings" on public.user_settings;
drop policy if exists "Users can view and update their own settings" on public.user_settings;
drop policy if exists "UserSettings self access" on public.user_settings;
drop policy if exists "user_settings_read" on public.user_settings;
drop policy if exists "user_settings_write" on public.user_settings;

commit;