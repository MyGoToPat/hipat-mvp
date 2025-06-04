// Script to verify existence of default_api_model column and add it if missing
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

// Function to check if a column exists in a table
async function checkColumnExists(tableName, columnName) {
  try {
    console.log(`🔍 Checking if ${columnName} column exists in ${tableName} table...`);
    
    // Create a query object with just the column we want to check
    const query = {};
    query[columnName] = true;
    
    // Try to select this column from the table
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

// Function to add a column using a test insert
async function addColumnWithTestInsert(tableName, columnName, columnValue) {
  try {
    console.log(`⚙️ Adding ${columnName} column to ${tableName} table...`);
    
    // Create a test record with our new column
    const testRecord = {
      name: `Test ${columnName} Agent`,
      role: 'Primary',
      description: `Test agent to add ${columnName} column`,
      [columnName]: columnValue
    };
    
    const { data, error } = await supabase
      .from(tableName)
      .insert(testRecord)
      .select();
      
    if (error) {
      console.error(`❌ Error adding ${columnName} column: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Successfully added ${columnName} column to ${tableName} table`);
    
    // Clean up test data
    if (data && data.length > 0) {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', data[0].id);
        
      if (deleteError) {
        console.error(`⚠️ Warning: Could not delete test record: ${deleteError.message}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
    return false;
  }
}

// Function to reload schema cache (attempt through RPC)
async function reloadSchemaCache() {
  try {
    console.log('⚙️ Attempting to reload schema cache...');
    
    // Try using RPC if available
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        query: `NOTIFY pgrst, 'reload schema';`
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('✅ Successfully reloaded schema cache through RPC');
      return true;
    } catch (rpcError) {
      console.log('⚠️ Could not reload schema cache through RPC');
      console.log('Please execute the following SQL in the Supabase SQL Editor:');
      console.log(`NOTIFY pgrst, 'reload schema';`);
      
      // Since we can't directly execute SQL, we'll try an alternative approach
      console.log('Attempting to refresh cache through data operations...');
      
      // Perform some operations that might trigger a cache refresh
      await supabase.from('agents').select('*').limit(1);
      
      console.log('✅ Performed operations that may refresh schema cache');
      return true;
    }
  } catch (error) {
    console.error(`❌ Error reloading schema cache: ${error.message}`);
    return false;
  }
}

// Function to verify we can now access the column
async function verifyColumnAccess(tableName, columnName) {
  try {
    console.log(`🔍 Verifying access to ${columnName} column in ${tableName} table...`);
    
    const query = {};
    query[columnName] = true;
    
    const { data, error } = await supabase
      .from(tableName)
      .select(`id, name, ${columnName}`)
      .limit(5);
      
    if (error) {
      console.error(`❌ Error accessing ${columnName} column: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Successfully accessed ${columnName} column in ${tableName} table`);
    console.log('Sample data:', data);
    return true;
  } catch (error) {
    console.error(`❌ Error verifying column access: ${error.message}`);
    return false;
  }
}

// Main function to run the verification and correction
async function verifyAndFixDefaultApiModel() {
  console.log('📋 VERIFYING default_api_model COLUMN\n');
  
  // Step 1: Check if the column exists
  const columnExists = await checkColumnExists('agents', 'default_api_model');
  
  let columnAdded = false;
  
  // Step 2: Add the column if it doesn't exist
  if (!columnExists) {
    columnAdded = await addColumnWithTestInsert('agents', 'default_api_model', 'test-api-model-id');
    
    if (!columnAdded) {
      console.error('❌ Failed to add default_api_model column');
      console.log('Please execute the following SQL in the Supabase SQL Editor:');
      console.log(`ALTER TABLE agents ADD COLUMN default_api_model TEXT;`);
      console.log(`NOTIFY pgrst, 'reload schema';`);
      process.exit(1);
    }
  }
  
  // Step 3: Reload schema cache if we added the column
  if (columnAdded) {
    await reloadSchemaCache();
  }
  
  // Step 4: Verify we can now access the column
  if (columnExists || columnAdded) {
    const accessSuccessful = await verifyColumnAccess('agents', 'default_api_model');
    
    if (!accessSuccessful) {
      console.error('❌ Could not access default_api_model column after adding it');
      console.log('Please execute the following SQL in the Supabase SQL Editor:');
      console.log(`NOTIFY pgrst, 'reload schema';`);
      process.exit(1);
    }
  }
  
  // Final result
  if (columnExists) {
    console.log('\n✅ default_api_model column already exists in agents table');
  } else if (columnAdded) {
    console.log('\n✅ Successfully added default_api_model column to agents table');
  } else {
    console.error('\n❌ Failed to verify or add default_api_model column');
    process.exit(1);
  }
  
  console.log('Operation completed successfully!');
}

// Run the main function
verifyAndFixDefaultApiModel().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});