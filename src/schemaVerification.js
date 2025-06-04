// Script to verify column existence and reload schema cache
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

// Function to verify column existence using direct SQL
async function verifyColumnExistence() {
  try {
    console.log('🔍 Explicitly verifying column existence...');
    
    // We can use RPC to execute SQL if available
    try {
      const { data: agentsData, error: agentsError } = await supabase.rpc('execute_sql', {
        query: `
          SELECT column_name FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'agents';
        `
      });
      
      if (!agentsError) {
        console.log('✅ SQL execution successful');
        console.log('Columns in agents table:', agentsData);
        
        // Check if 'category' column exists
        const categoryExists = agentsData.some(col => col.column_name === 'category');
        console.log(`agents.category column: ${categoryExists ? '✅ EXISTS' : '❌ MISSING'}`);
      } else {
        throw new Error('RPC execution failed');
      }
    } catch (rpcError) {
      console.log('ℹ️ RPC not available, falling back to regular queries');
      
      // Fallback: Check using regular queries
      await checkColumnExistsWithQuery('agents', 'category');
      await checkColumnExistsWithQuery('agent_categories', 'description');
    }
    
    // Attempt to reload schema cache using RPC
    try {
      console.log('⚙️ Explicitly reloading schema cache...');
      
      const { data: reloadData, error: reloadError } = await supabase.rpc('execute_sql', {
        query: `NOTIFY pgrst, 'reload schema';`
      });
      
      if (!reloadError) {
        console.log('✅ Schema cache explicitly reloaded');
      } else {
        throw new Error('Schema cache reload failed');
      }
    } catch (reloadError) {
      console.log('⚠️ Could not reload schema cache through RPC.');
      console.log('Please run the following SQL in the Supabase SQL Editor:');
      console.log('NOTIFY pgrst, \'reload schema\';');
    }
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
  }
}

// Function to check if a column exists using a query
async function checkColumnExistsWithQuery(tableName, columnName) {
  try {
    console.log(`🔍 Checking if ${columnName} exists in ${tableName} using query...`);
    
    // Create a query object with just the column we want to check
    const query = {};
    query[columnName] = true;
    
    // Try to select using this column
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
      
    if (error && error.message.includes(columnName)) {
      console.error(`❌ Column ${columnName} does not exist in ${tableName}`);
      return false;
    }
    
    console.log(`✅ Column ${columnName} exists in ${tableName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error checking column: ${error.message}`);
    return false;
  }
}

// Function to verify actual data access
async function verifyDataAccess() {
  console.log('\n🔍 Verifying actual data access...');
  
  // Check agents table with category column
  try {
    const { data: agentsData, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, role, category')
      .limit(5);
      
    if (agentsError) {
      console.error('❌ Error accessing agents with category:', agentsError.message);
    } else {
      console.log('✅ Successfully accessed agents with category column');
      console.log('Sample data:', agentsData);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Check agent_categories table with description column
  try {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('agent_categories')
      .select('id, name, description')
      .limit(5);
      
    if (categoriesError) {
      console.error('❌ Error accessing agent_categories with description:', categoriesError.message);
    } else {
      console.log('✅ Successfully accessed agent_categories with description column');
      console.log('Sample data:', categoriesData);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main function
async function main() {
  console.log('📋 EXPLICIT SCHEMA VERIFICATION AND CACHE RELOAD\n');
  
  // Step 1: Verify column existence
  await verifyColumnExistence();
  
  // Step 2: Verify actual data access
  await verifyDataAccess();
  
  console.log('\n📝 VERIFICATION COMPLETE');
  console.log('If you encountered any errors, please run the SQL migration manually in the Supabase SQL Editor.');
  console.log('Then restart your application with: npm run dev');
}

// Run the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});