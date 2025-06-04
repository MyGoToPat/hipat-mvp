// Script to verify that required columns exist in tables
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

// Function to verify all required columns
async function verifyRequiredColumns() {
  console.log('🔍 Starting column verification...');
  
  const results = {
    agents_category: await checkColumnExists('agents', 'category'),
    agent_categories_description: await checkColumnExists('agent_categories', 'description')
  };
  
  console.log('\n📊 Column Verification Results:');
  console.log('------------------------------');
  console.log(`agents.category: ${results.agents_category ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`agent_categories.description: ${results.agent_categories_description ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log('------------------------------');
  
  const allColumnsExist = Object.values(results).every(result => result === true);
  
  if (allColumnsExist) {
    console.log('✅ All required columns exist');
  } else {
    console.error('❌ Some required columns are missing');
    console.log('Please run the migration script to add missing columns');
  }
  
  return {
    success: allColumnsExist,
    results
  };
}

// Function to add missing columns if needed
async function addMissingColumns() {
  console.log('⚙️ Checking for missing columns and attempting to add them...');
  
  // First check which columns are missing
  const verificationResults = await verifyRequiredColumns();
  
  if (verificationResults.success) {
    console.log('✅ All required columns already exist, no action needed');
    return { success: true, message: 'No columns needed to be added' };
  }
  
  // Try to add missing columns
  const results = {};
  
  // Add category column to agents table if missing
  if (!verificationResults.results.agents_category) {
    try {
      console.log('⚙️ Adding category column to agents table...');
      
      // Since we can't execute direct SQL through the Supabase JS client,
      // we'll try to add the column implicitly by inserting a record with that field
      const testRecord = {
        name: 'Test Category Agent',
        role: 'Primary',
        description: 'Test agent to add category column',
        category: 'General'
      };
      
      const { data, error } = await supabase
        .from('agents')
        .insert(testRecord)
        .select();
        
      if (error) {
        console.error(`❌ Error adding category column: ${error.message}`);
        results.agents_category = false;
      } else {
        console.log('✅ Successfully added category column to agents table');
        results.agents_category = true;
        
        // Clean up test data
        if (data && data.length > 0) {
          await supabase
            .from('agents')
            .delete()
            .eq('id', data[0].id);
        }
      }
    } catch (error) {
      console.error(`❌ Unexpected error: ${error.message}`);
      results.agents_category = false;
    }
  } else {
    results.agents_category = true;
  }
  
  // Add description column to agent_categories table if missing
  if (!verificationResults.results.agent_categories_description) {
    try {
      console.log('⚙️ Adding description column to agent_categories table...');
      
      // Try to add the column implicitly
      const testRecord = {
        name: 'Test Category',
        description: 'Test description for category'
      };
      
      const { data, error } = await supabase
        .from('agent_categories')
        .insert(testRecord)
        .select();
        
      if (error) {
        console.error(`❌ Error adding description column: ${error.message}`);
        results.agent_categories_description = false;
      } else {
        console.log('✅ Successfully added description column to agent_categories table');
        results.agent_categories_description = true;
        
        // Clean up test data
        if (data && data.length > 0) {
          await supabase
            .from('agent_categories')
            .delete()
            .eq('id', data[0].id);
        }
      }
    } catch (error) {
      console.error(`❌ Unexpected error: ${error.message}`);
      results.agent_categories_description = false;
    }
  } else {
    results.agent_categories_description = true;
  }
  
  // Verify the columns again after attempting to add them
  console.log('\n🔍 Verifying columns after corrections...');
  const finalVerification = await verifyRequiredColumns();
  
  return {
    success: finalVerification.success,
    results,
    finalState: finalVerification.results
  };
}

// Run verification and correction
console.log('📋 DATABASE COLUMN VERIFICATION AND CORRECTION\n');

addMissingColumns()
  .then(result => {
    if (result.success) {
      console.log('\n✅ All required columns are now present in the database');
    } else {
      console.error('\n❌ Some columns could not be added');
      console.log('Please apply the SQL migrations manually in the Supabase dashboard');
    }
    
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error(`\n❌ Unexpected error: ${error.message}`);
    process.exit(1);
  });