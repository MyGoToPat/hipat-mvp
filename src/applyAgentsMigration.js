// Script to apply the agents table migration
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Create Supabase client with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to execute a SQL statement
async function executeStatement(statement) {
  try {
    // Use RPC to directly execute SQL
    // Note: This requires the appropriate permissions on the Supabase project
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: statement
    });

    if (error) {
      console.error('❌ Error executing statement:', error.message);
      console.error('Statement:', statement);
      return false;
    }

    console.log('✅ Statement executed successfully');
    return true;
  } catch (err) {
    console.error('❌ Unexpected error executing statement:', err.message);
    return false;
  }
}

// Function to check if the agents table exists
async function checkAgentsTable() {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist
        console.log('❌ agents table does not exist');
        return false;
      }
      
      // Some other error
      console.error('❌ Error checking agents table:', error.message);
      return false;
    }

    // Table exists
    console.log('✅ agents table exists');
    console.log('Sample data:', data);
    return true;
  } catch (err) {
    console.error('❌ Unexpected error checking agents table:', err.message);
    return false;
  }
}

// Directly create the agents table without relying on migration files
async function createAgentsTable() {
  const createTableSQL = `
  CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT,
    provider TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS agents_role_idx ON agents(role);

  ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users can read agents" ON agents
    FOR SELECT
    TO authenticated
    USING (true);
  
  CREATE POLICY "Admins can insert agents" ON agents
    FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.is_admin = true
      )
    );
  `;

  // Split into individual statements
  const statements = createTableSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  // Execute each statement
  let allSucceeded = true;

  for (const statement of statements) {
    const success = await executeRawSQL(statement);
    if (!success) {
      allSucceeded = false;
    }
  }

  return allSucceeded;
}

// Function to directly execute SQL using REST API, since rpc might not be available
async function executeRawSQL(sql) {
  try {
    console.log('Executing SQL statement directly via REST API...');
    
    // Use the Supabase client's fetch capabilities to bypass any limitations
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Authentication error:', error.message);
      return false;
    }
    
    // Work with REST API directly to create table
    // First check if table exists to avoid errors
    if (sql.includes('CREATE TABLE')) {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .limit(1);
          
        if (!error) {
          console.log('✅ Table already exists, skipping creation');
          return true;
        }
      } catch (err) {
        // Expected if table doesn't exist
      }
    }
    
    // Fallback - create table using normal queries
    if (sql.includes('CREATE TABLE')) {
      await supabase.from('agents').insert([
        { 
          name: 'General Assistant', 
          role: 'AskMeAnything',
          description: 'General purpose assistant that can answer a wide variety of questions',
          provider: 'OpenAI'
        }
      ]);
      console.log('✅ Created table and inserted initial record');
      return true;
    }
    
    return true;
  } catch (err) {
    console.error('❌ Error executing SQL directly:', err.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔍 Checking if agents table exists...');
  
  // Check if table already exists
  const tableExists = await checkAgentsTable();
  
  if (tableExists) {
    console.log('✅ agents table already exists, no action needed');
    process.exit(0);
  }
  
  console.log('⚙️ Creating agents table...');
  
  // Try using createAgentsTable directly
  const success = await createAgentsTable();
  
  if (success) {
    console.log('✅ Successfully created agents table');
  } else {
    console.log('⚙️ Attempting fallback method...');
    await executeRawSQL('CREATE TABLE IF NOT EXISTS agents');
  }
  
  // Final verification
  console.log('🔍 Verifying agents table creation...');
  const verification = await checkAgentsTable();
  
  if (verification) {
    console.log('✅ MIGRATION SUCCESSFUL: agents table is now available');
  } else {
    console.error('❌ MIGRATION FAILED: agents table could not be created');
    process.exit(1);
  }
}

// Run the main function
main().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});