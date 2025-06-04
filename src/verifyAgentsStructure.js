// Script to verify the structure of the agents table in Supabase
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

// Expected structure for the agents table
const expectedStructure = [
  { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
  { column_name: 'name', data_type: 'text', is_nullable: 'YES' },
  { column_name: 'role', data_type: 'text', is_nullable: 'NO' },
  { column_name: 'description', data_type: 'text', is_nullable: 'YES' },
  { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES' }
];

// Function to check the structure of the agents table
async function verifyAgentsTableStructure() {
  try {
    console.log('🔍 Verifying agents table structure in Supabase...');
    
    // Execute the exact SQL query as requested
    const { data, error } = await supabase.rpc('execute_sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'agents';
      `
    });

    if (error) {
      console.error('❌ Error executing SQL query:', error.message);
      console.log('⚠️ The RPC function "execute_sql" may not exist.');
      console.log('Attempting alternative method to check table structure...');
      
      // Alternative method: try to query the table directly
      const { data: tableData, error: tableError } = await supabase
        .from('agents')
        .select('*')
        .limit(1);
        
      if (tableError) {
        console.error('❌ Error querying agents table:', tableError.message);
        if (tableError.code === '42P01') {
          console.error('❌ The agents table does not exist in the database.');
        }
        process.exit(1);
      }
      
      // If we got here, the table exists but we couldn't query its structure directly
      console.log('✅ The agents table exists, but we cannot directly verify its structure.');
      console.log('Table data sample:', tableData);
      
      // Check which columns are available in the returned data
      if (tableData && tableData.length > 0) {
        const sampleRow = tableData[0];
        const actualColumns = Object.keys(sampleRow);
        console.log('Available columns:', actualColumns);
        
        // Compare with expected columns
        const expectedColumns = expectedStructure.map(col => col.column_name);
        const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
        const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.error('❌ Missing expected columns:', missingColumns);
        } else if (extraColumns.length > 0) {
          console.log('ℹ️ Additional columns found:', extraColumns);
        } else {
          console.log('✅ All expected columns are present in the table');
        }
      }
      
      process.exit(1);
    }
    
    // If we got here, the SQL query executed successfully
    console.log('✅ SQL query executed successfully');
    console.log('Table structure:', data);

    // Check if the returned structure matches the expected structure
    const structureMatches = verifyStructureMatch(data);
    if (structureMatches) {
      console.log('✅ The agents table structure MATCHES the expected structure');
    } else {
      console.error('❌ The agents table structure DOES NOT MATCH the expected structure');
      console.log('Expected structure:', expectedStructure);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

// Function to verify if the returned structure matches the expected structure
function verifyStructureMatch(actualStructure) {
  if (!actualStructure || actualStructure.length === 0) {
    return false;
  }
  
  // Check if all expected columns are present with the correct types and nullability
  for (const expectedCol of expectedStructure) {
    const matchingCol = actualStructure.find(col => 
      col.column_name === expectedCol.column_name
    );
    
    if (!matchingCol) {
      console.error(`❌ Expected column not found: ${expectedCol.column_name}`);
      return false;
    }
    
    if (matchingCol.data_type !== expectedCol.data_type) {
      console.error(`❌ Column ${expectedCol.column_name} has wrong data type. Expected: ${expectedCol.data_type}, Actual: ${matchingCol.data_type}`);
      return false;
    }
    
    if (matchingCol.is_nullable !== expectedCol.is_nullable) {
      console.error(`❌ Column ${expectedCol.column_name} has wrong nullability. Expected: ${expectedCol.is_nullable}, Actual: ${matchingCol.is_nullable}`);
      return false;
    }
  }
  
  // Check if there are any extra columns not in our expected structure
  const extraColumns = actualStructure
    .filter(col => !expectedStructure.some(expected => expected.column_name === col.column_name))
    .map(col => col.column_name);
    
  if (extraColumns.length > 0) {
    console.log('ℹ️ Additional columns found:', extraColumns);
    // We don't consider extra columns as a structure mismatch
  }
  
  return true;
}

// Run the verification function
verifyAgentsTableStructure().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});