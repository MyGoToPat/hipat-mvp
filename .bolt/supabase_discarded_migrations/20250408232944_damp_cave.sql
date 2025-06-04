/*
  # Create messages table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users.id)
      - `content` (text) - The message content
      - `role` (text) - The role of the message sender ('user' or 'assistant')
      - `session_id` (text) - To group related messages together
      - `created_at` (timestamptz) - When the message was created
  
  2. Security
    - Enable RLS on `messages` table
    - Add policy for users to read and insert their own messages
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages(session_id);

-- Enable row level security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own messages
CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);