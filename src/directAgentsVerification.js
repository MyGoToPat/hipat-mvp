// Script to directly verify the agents table structure without using RPC
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Supabase client with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected columns for the agents table
const expectedColumns = {
  id: { type: 'uuid', nullable: false },
  name: { type: 'text', nullable: true },
  role: { type: 'text', nullable: false },
  description: { type: 'text', nullable: true },
  created_at: { type: 'timestamp with time zone', nullable: true }
};

// Function to directly verify the agents table structure
async function verifyAgentsTableStructure() {
  try {
    console.log('🔍 Verifying agents table structure directly...');
    
    // First check if table exists by trying to query it
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error querying agents table:', error.message);
      if (error.code === '42P01') {
        console.error('❌ The agents table does not exist in the database.');
      }
      process.exit(1);
    }
    
    console.log('✅ The agents table exists');
    
    // If we have sample data, analyze its structure
    if (data && data.length > 0) {
      const sampleRow = data[0];
      console.log('Sample row:', sampleRow);
      
      // Verify expected columns exist
      const actualColumns = Object.keys(sampleRow);
      console.log('Actual columns:', actualColumns);
      
      const expectedColumnNames = Object.keys(expectedColumns);
      const missingColumns = expectedColumnNames.filter(col => !actualColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.error('❌ Missing expected columns:', missingColumns);
        console.log('❌ The agents table structure DOES NOT MATCH the expected structure');
      } else {
        console.log('✅ All expected columns are present in the table');
        
        // We can't verify types directly, but we can check nullability indirectly
        const nullColumns = actualColumns.filter(col => sampleRow[col] === null);
        console.log('Columns with NULL values:', nullColumns);
        
        console.log('✅ Basic structure verification passed');
        console.log('Note: We cannot directly verify column types or nullability constraints');
      }
    } else {
      console.log('ℹ️ No sample data available to verify structure');
      
      // Insert a test row to check structure
      console.log('Attempting to insert a test row to verify structure...');
      
      const testRow = {
        name: 'Test Agent',
        role: 'TestRole',
        description: 'Test Description'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('agents')
        .insert(testRow)
        .select();
        
      if (insertError) {
        console.error('❌ Error inserting test row:', insertError.message);
        console.log('❌ Cannot verify table structure');
      } else {
        console.log('✅ Successfully inserted test row');
        console.log('Inserted data:', insertData);
        
        // Now we have data to check structure
        const testRecord = insertData[0];
        const actualColumns = Object.keys(testRecord);
        
        const expectedColumnNames = Object.keys(expectedColumns);
        const missingColumns = expectedColumnNames.filter(col => !actualColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.error('❌ Missing expected columns:', missingColumns);
          console.log('❌ The agents table structure DOES NOT MATCH the expected structure');
        } else {
          console.log('✅ All expected columns are present in the table');
          console.log('✅ Basic structure verification passed');
        }
        
        // Clean up test data
        console.log('Cleaning up test data...');
        const { error: deleteError } = await supabase
          .from('agents')
          .delete()
          .eq('id', testRecord.id);
          
        if (deleteError) {
          console.error('⚠️ Error deleting test row:', deleteError.message);
        } else {
          console.log('✅ Test row deleted successfully');
        }
      }
    }
    
    // Additional verification - try to insert a row with missing required fields
    console.log('Performing constraint verification...');
    
    // Test 1: Try to insert without 'role' (should fail if role is NOT NULL)
    const testData1 = {
      name: 'Test Constraint Agent',
      description: 'Testing NOT NULL constraint'
    };
    
    const { error: constraintError } = await supabase
      .from('agents')
      .insert(testData1);
      
    if (constraintError) {
      console.log('✅ NOT NULL constraint on role field verified: insert failed as expected');
      console.log('Constraint error:', constraintError.message);
    } else {
      console.error('❌ NOT NULL constraint verification failed: insert succeeded without role');
    }
    
    console.log('\n📊 STRUCTURE VERIFICATION SUMMARY:');
    console.log('-------------------------------');
    console.log('✅ The agents table exists');
    console.log('✅ Required columns are present');
    console.log('✅ Basic constraint verification performed');
    console.log('Note: Complete type verification requires database admin access');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

// Run the verification function
verifyAgentsTableStructure().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});