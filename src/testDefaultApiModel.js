// Script to verify default_api_model column is accessible in Supabase
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

// Function to explicitly verify the column is accessible
async function verifyDefaultApiModelColumn() {
  console.log('🔍 Explicitly verifying default_api_model column is accessible...');
  
  try {
    // Test 1: Simple select with the column
    console.log('Test 1: Selecting with default_api_model column...');
    const { data: selectData, error: selectError } = await supabase
      .from('agents')
      .select('id, name, role, default_api_model')
      .limit(5);
      
    if (selectError) {
      console.error('❌ Error selecting with default_api_model column:', selectError.message);
      return false;
    }
    
    console.log('✅ Successfully selected with default_api_model column');
    console.log('Sample data:', selectData);
    
    // Test 2: Filter using the column
    console.log('\nTest 2: Filtering with default_api_model column...');
    const { data: filterData, error: filterError } = await supabase
      .from('agents')
      .select('id, name, role')
      .eq('default_api_model', 'test-api-model-id')
      .limit(5);
      
    // Note: This query might return no results, which is fine
    if (filterError) {
      console.error('❌ Error filtering with default_api_model column:', filterError.message);
      return false;
    }
    
    console.log('✅ Successfully filtered with default_api_model column');
    console.log('Matching records:', filterData.length);
    
    // Test 3: Update a record with the column (creating a test record first)
    console.log('\nTest 3: Testing update operation with default_api_model column...');
    
    // Create a test record
    const testAgent = {
      name: 'Test Update Agent',
      role: 'Primary',
      description: 'Test agent for updating default_api_model',
      default_api_model: 'initial-model-id'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('agents')
      .insert(testAgent)
      .select();
      
    if (insertError) {
      console.error('❌ Error creating test record:', insertError.message);
      return false;
    }
    
    console.log('✅ Successfully created test record with default_api_model');
    
    // Update the test record
    const testId = insertData[0].id;
    const { data: updateData, error: updateError } = await supabase
      .from('agents')
      .update({ default_api_model: 'updated-model-id' })
      .eq('id', testId)
      .select();
      
    if (updateError) {
      console.error('❌ Error updating test record:', updateError.message);
      
      // Clean up the test record anyway
      await supabase.from('agents').delete().eq('id', testId);
      return false;
    }
    
    console.log('✅ Successfully updated record with default_api_model');
    console.log('Updated data:', updateData);
    
    // Clean up the test record
    const { error: deleteError } = await supabase
      .from('agents')
      .delete()
      .eq('id', testId);
      
    if (deleteError) {
      console.error('⚠️ Warning: Could not delete test record:', deleteError.message);
    } else {
      console.log('✅ Successfully cleaned up test record');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('📋 EXPLICIT VERIFICATION OF default_api_model COLUMN ACCESSIBILITY\n');
  
  const success = await verifyDefaultApiModelColumn();
  
  if (success) {
    console.log('\n✅ VERIFICATION SUCCESSFUL: default_api_model column is fully accessible');
    console.log('The schema cache is correctly updated and the column can be used in queries.');
  } else {
    console.error('\n❌ VERIFICATION FAILED: default_api_model column is not fully accessible');
    console.log('Please run the following SQL in the Supabase SQL Editor:');
    console.log('NOTIFY pgrst, \'reload schema\';');
    console.log('Then restart your application.');
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});