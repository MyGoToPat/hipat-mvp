/*
  # Create feedback table

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users.id)
      - `rating` (integer) - User satisfaction rating (1-5)
      - `category` (text) - Category of feedback (e.g., 'app_experience', 'suggestions', 'issues')
      - `content` (text) - Detailed feedback content
      - `created_at` (timestamptz) - When the feedback was submitted
  
  2. Security
    - Enable RLS on `feedback` table
    - Add policy for users to read and insert their own feedback
    - Add policy for admins to read all feedback (to be implemented)
*/

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category TEXT NOT NULL CHECK (category IN ('app_experience', 'suggestions', 'issues', 'feature_request')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_category_idx ON feedback(category);
CREATE INDEX IF NOT EXISTS feedback_rating_idx ON feedback(rating);

-- Enable row level security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own feedback
CREATE POLICY "Users can read their own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);