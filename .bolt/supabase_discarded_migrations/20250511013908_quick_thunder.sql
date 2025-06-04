/*
  # Fix profiles RLS and add auto-creation trigger

  1. Security Changes
    - Add policy for profile creation during signup
    - Add trigger to auto-create profiles for new users
    - Maintain existing RLS policies for authenticated access
  
  2. Changes
    - More permissive policy for initial profile creation
    - Automatic profile creation via trigger
    - Better error handling in profile creation
*/

-- Enable RLS
alter table public.profiles enable row level security;

-- Create trigger function for auto-creating profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to auto-create profiles
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Update RLS policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;