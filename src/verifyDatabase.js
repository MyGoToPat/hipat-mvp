// Script to verify and ensure all required tables exist in Supabase
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables that should exist in our database
const requiredTables = [
  'profiles',
  'messages',
  'feedback',
  'agents',
  'api_libraries'
];

// Sample data for agents table
const sampleAgents = [
  { 
    name: 'Nutrition Assistant', 
    role: 'TellMeWhatYouAte',
    description: 'Analyzes your meals and provides nutritional insights',
    provider: 'OpenAI'
  },
  { 
    name: 'Workout Analyzer', 
    role: 'TellMeAboutYourWorkout',
    description: 'Reviews your exercise routines and suggests improvements',
    provider: 'OpenAI'
  },
  { 
    name: 'Life Coach', 
    role: 'MakeMeBetter',
    description: 'Provides personalized guidance for self-improvement',
    provider: 'OpenAI'
  },
  { 
    name: 'General Assistant', 
    role: 'AskMeAnything',
    description: 'Answers general questions about health and fitness',
    provider: 'OpenAI'
  }
];

// Check if a table exists
async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log(`❌ Table ${tableName} does not exist`);
      return { exists: false, error: error.message };
    } else if (error) {
      console.error(`❌ Error checking table ${tableName}:`, error.message);
      return { exists: false, error: error.message };
    }

    console.log(`✅ Table ${tableName} exists`);
    return { exists: true, data };
  } catch (err) {
    console.error(`❌ Unexpected error checking table ${tableName}:`, err.message);
    return { exists: false, error: err.message };
  }
}

// Insert sample data into agents table if it's empty
async function populateAgentsTable() {
  try {
    // Check if table has data
    const { data, error } = await supabase
      .from('agents')
      .select('*');

    if (error) {
      console.error('❌ Error checking agents table data:', error.message);
      return { success: false, error: error.message };
    }

    // If table is empty, insert sample agents
    if (data.length === 0) {
      console.log('⚙️ Agents table is empty, inserting sample data...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('agents')
        .insert(sampleAgents)
        .select();
        
      if (insertError) {
        console.error('❌ Failed to insert sample agents:', insertError.message);
        return { success: false, error: insertError.message };
      }
      
      console.log(`✅ Successfully inserted ${insertData.length} sample agents`);
      return { success: true, data: insertData };
    }
    
    console.log(`ℹ️ Agents table already has ${data.length} records, no need to add sample data`);
    return { success: true, existing: true };
  } catch (err) {
    console.error('❌ Error populating agents table:', err.message);
    return { success: false, error: err.message };
  }
}

// Verify all required tables exist
async function verifyDatabase() {
  console.log('🔍 Starting comprehensive database verification...');
  
  const results = {};
  let allTablesExist = true;
  
  // Check Supabase connection
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return { success: false, error: 'Connection failed' };
    }
    console.log('✅ Supabase connection successful');
  } catch (err) {
    console.error('❌ Failed to connect to Supabase:', err.message);
    return { success: false, error: 'Connection failed' };
  }
  
  // Check all required tables
  for (const tableName of requiredTables) {
    const result = await checkTableExists(tableName);
    results[tableName] = result;
    
    if (!result.exists) {
      allTablesExist = false;
    }
  }
  
  // If agents table exists but might be empty, populate it with sample data
  if (results.agents && results.agents.exists) {
    const populateResult = await populateAgentsTable();
    results.agentsPopulated = populateResult;
  }
  
  console.log('\n📊 Database Verification Summary:');
  console.log('------------------------------');
  for (const tableName of requiredTables) {
    const status = results[tableName]?.exists ? '✅ EXISTS' : '❌ MISSING';
    console.log(`${tableName}: ${status}`);
  }
  console.log('------------------------------');
  
  return {
    success: allTablesExist,
    tables: results,
    summary: `${allTablesExist ? '✅ All' : '❌ Not all'} required tables exist`
  };
}

// Run verification
verifyDatabase()
  .then(result => {
    console.log('\n🏁 Verification complete');
    if (result.success) {
      console.log('✅ Database is properly configured');
    } else {
      console.error('❌ Database is missing some required tables');
      console.log('Please ensure all migrations have been applied');
    }
  })
  .catch(err => {
    console.error('❌ Verification failed with error:', err);
  });