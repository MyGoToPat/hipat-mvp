/*
  # Create API libraries table

  1. New Tables
    - `api_libraries`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the API library
      - `provider` (text) - The provider (e.g., 'OpenAI', 'Claude')
      - `api_key` (text) - The API key for the service
      - `purpose` (text) - Purpose of the API (e.g., 'summarization', 'chat')
      - `created_at` (timestamptz) - When the library was created
  
  2. Security
    - Enable RLS on `api_libraries` table
    - Add policy for authenticated users to access all API libraries
*/

-- Create API libraries table
CREATE TABLE IF NOT EXISTS api_libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  api_key TEXT NOT NULL,
  purpose TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS api_libraries_provider_idx ON api_libraries(provider);
CREATE INDEX IF NOT EXISTS api_libraries_purpose_idx ON api_libraries(purpose);

-- Enable row level security
ALTER TABLE api_libraries ENABLE ROW LEVEL SECURITY;

-- Create policy for all authenticated users to access API libraries
CREATE POLICY "Allow admin read/write access" ON api_libraries
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);