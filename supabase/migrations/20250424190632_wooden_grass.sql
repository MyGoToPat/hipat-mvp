/*
  # Enable RLS for subscription tables

  1. Security
    - Enable RLS on `subscription_tiers` table
    - Enable RLS on `user_subscriptions` table
    - Add policies for authenticated users to read subscription tiers
    - Add policies for users to read their own subscriptions
    - Add policies for admins to manage all subscription data
  
  2. Changes
    - No schema changes, only security policy updates
*/

-- Enable RLS on subscription_tiers table
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_tiers
CREATE POLICY "Anyone can view subscription tiers" 
  ON public.subscription_tiers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subscription tiers" 
  ON public.subscription_tiers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Enable RLS on user_subscriptions table
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions" 
  ON public.user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions" 
  ON public.user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions" 
  ON public.user_subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );