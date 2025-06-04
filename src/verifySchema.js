// Script to verify the structure of key database tables in Supabase
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

// Expected table structures
const expectedStructures = {
  agents: [
    { name: 'id', type: 'uuid', nullable: false },
    { name: 'name', type: 'text', nullable: true },
    { name: 'role', type: 'text', nullable: false },
    { name: 'description', type: 'text', nullable: true },
    { name: 'provider', type: 'text', nullable: true },
    { name: 'created_at', type: 'timestamp with time zone', nullable: true }
  ],
  api_libraries: [
    { name: 'id', type: 'uuid', nullable: false },
    { name: 'name', type: 'text', nullable: false },
    { name: 'provider', type: 'text', nullable: false },
    { name: 'api_key', type: 'text', nullable: false },
    { name: 'purpose', type: 'text', nullable: true },
    { name: 'created_at', type: 'timestamp with time zone', nullable: true }
  ],
  feedback: [
    { name: 'id', type: 'uuid', nullable: false },
    { name: 'user_id', type: 'uuid', nullable: true },
    { name: 'rating', type: 'integer', nullable: true },
    { name: 'category', type: 'text', nullable: true },
    { name: 'content', type: 'text', nullable: true },
    { name: 'created_at', type: 'timestamp with time zone', nullable: true }
  ]
};

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    console.log(`🔍 Checking if ${tableName} table exists...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
      
    if (error) {
      if (error.code === '42P01') {
        console.error(`❌ ${tableName} table does not exist`);
        return false;
      }
      console.error(`❌ Error checking ${tableName} table:`, error.message);
      return false;
    }
    
    console.log(`✅ ${tableName} table exists`);
    return true;
  } catch (error) {
    console.error(`❌ Error checking ${tableName} table:`, error.message);
    return false;
  }
}

// Function to check if a column exists in a table
async function checkColumnExists(tableName, columnName) {
  try {
    console.log(`🔍 Checking if ${columnName} column exists in ${tableName} table...`);
    
    // Create a query selecting just this column
    const query = {};
    query[columnName] = true;
    
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
      
    if (error && error.message.includes(columnName)) {
      console.error(`❌ ${columnName} column does not exist in ${tableName} table`);
      return false;
    }
    
    console.log(`✅ ${columnName} column exists in ${tableName} table`);
    return true;
  } catch (error) {
    console.error(`❌ Error checking ${columnName} column in ${tableName} table:`, error.message);
    return false;
  }
}

// Function to verify a table's structure against expected structure
async function verifyTableStructure(tableName, expectedColumns) {
  console.log(`\n🔍 Verifying ${tableName} table structure...`);
  
  // First check if table exists
  const tableExists = await checkTableExists(tableName);
  if (!tableExists) {
    return {
      exists: false,
      columnsMatch: false,
      missingColumns: expectedColumns.map(col => col.name)
    };
  }
  
  // Check each expected column
  const columnResults = {};
  for (const column of expectedColumns) {
    columnResults[column.name] = await checkColumnExists(tableName, column.name);
  }
  
  // Calculate missing columns
  const missingColumns = expectedColumns
    .filter(col => !columnResults[col.name])
    .map(col => col.name);
    
  const columnsMatch = missingColumns.length === 0;
  
  return {
    exists: true,
    columnsMatch,
    columnResults,
    missingColumns
  };
}

// Function to verify all required tables
async function verifyAllTables() {
  console.log('🔍 Starting comprehensive schema verification...');
  
  const results = {};
  let allTablesCorrect = true;
  
  // Verify each table
  for (const [tableName, expectedColumns] of Object.entries(expectedStructures)) {
    results[tableName] = await verifyTableStructure(tableName, expectedColumns);
    
    if (!results[tableName].exists || !results[tableName].columnsMatch) {
      allTablesCorrect = false;
    }
  }
  
  // Generate summary report
  console.log('\n📊 SCHEMA VERIFICATION SUMMARY:');
  console.log('-----------------------------');
  
  for (const [tableName, result] of Object.entries(results)) {
    console.log(`${tableName} table:`);
    console.log(`  - Exists: ${result.exists ? '✅ Yes' : '❌ No'}`);
    
    if (result.exists) {
      console.log(`  - Columns match: ${result.columnsMatch ? '✅ Yes' : '❌ No'}`);
      
      if (!result.columnsMatch) {
        console.log(`  - Missing columns: ${result.missingColumns.join(', ')}`);
      }
    }
  }
  
  console.log('-----------------------------');
  console.log(`Overall status: ${allTablesCorrect ? '✅ All tables correctly structured' : '❌ Some tables have issues'}`);
  
  return {
    success: allTablesCorrect,
    results
  };
}

// Run verification
console.log('📋 DATABASE SCHEMA VERIFICATION\n');

verifyAllTables()
  .then(result => {
    if (result.success) {
      console.log('\n✅ DATABASE SCHEMA VERIFICATION SUCCESSFUL');
      console.log('All tables exist with the correct structure');
    } else {
      console.error('\n❌ DATABASE SCHEMA VERIFICATION FAILED');
      console.log('Some tables are missing or have incorrect structure');
    }
    
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ VERIFICATION FAILED WITH ERROR:', error.message);
    process.exit(1);
  });