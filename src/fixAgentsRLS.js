// Script to fix RLS policies on the agents table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Fixing RLS policy for agents table...');
console.log('⚠️ IMPORTANT: This script is provided for reference only.');
console.log('⚠️ Please execute the SQL commands directly in the Supabase SQL Editor as instructed.');

console.log('\nSQL Commands to execute in Supabase SQL Editor:');
console.log('-----------------------------------------------');
console.log('-- Drop the current RLS policy if it exists');
console.log('DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.agents;');
console.log('\n-- Create a new full-access authenticated policy');
console.log('CREATE POLICY "Authenticated users can read and write" ON public.agents');
console.log('FOR ALL');
console.log('TO authenticated');
console.log('USING (true)');
console.log('WITH CHECK (true);');
console.log('\n-- Explicitly confirm execution');
console.log('SELECT * FROM public.agents LIMIT 1;');
console.log('-----------------------------------------------');

// This section is for verification purposes only
// It will show what policies exist after manual SQL execution
async function checkPolicies() {
  try {
    console.log('\n🔍 Checking if agents table exists...');
    
    // Check if agents table exists
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error accessing agents table:', error.message);
      return;
    }
    
    console.log('✅ Successfully accessed agents table');
    console.log('Table data sample:', data);
    
    // Test inserting a row
    console.log('\n🔍 Testing insert into agents table...');
    
    const testAgent = {
      name: 'Test RLS Agent',
      role: 'TestRole',
      description: 'Testing RLS policy',
      provider: 'TestProvider'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('agents')
      .insert(testAgent)
      .select();
      
    if (insertError) {
      console.error('❌ Error inserting into agents table:', insertError.message);
      console.error('❌ RLS policy fix may not have been applied correctly');
    } else {
      console.log('✅ Successfully inserted row into agents table');
      console.log('✅ RLS policy has been fixed successfully');
      
      // Clean up test data
      if (insertData && insertData.length > 0) {
        await supabase
          .from('agents')
          .delete()
          .eq('id', insertData[0].id);
          
        console.log('✅ Test data cleaned up');
      }
    }
  } catch (error) {
    console.error('❌ Error checking policies:', error.message);
  }
}

// Run the check after SQL has been manually executed
console.log('\n🔍 Ready to verify RLS policy changes...');
console.log('⚠️ Please run the SQL commands in Supabase SQL Editor first,');
console.log('⚠️ then run this script to verify the changes.');

// This function would verify the changes, but it's commented out since it should be run
// only after the SQL has been manually executed in the Supabase SQL Editor
// checkPolicies();