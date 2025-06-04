// Script to verify and correct database schema issues
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

// Function to check if the agents table exists
async function checkAgentsTable() {
  try {
    console.log('🔍 Checking agents table existence...');
    
    const { data, error } = await supabase
      .from('agents')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.error('❌ Agents table does not exist');
        return false;
      }
      throw error;
    }
    
    console.log('✅ Agents table exists');
    return true;
  } catch (error) {
    console.error('❌ Error checking agents table:', error);
    return false;
  }
}

// Function to check if the provider column exists in the agents table
async function checkProviderColumn() {
  try {
    console.log('🔍 Checking if provider column exists in agents table...');
    
    // Try to query the provider column
    const { data, error } = await supabase
      .from('agents')
      .select('provider')
      .limit(1);
    
    if (error && error.message.includes('provider')) {
      console.error('❌ Provider column does not exist in agents table');
      return false;
    }
    
    console.log('✅ Provider column exists in agents table');
    return true;
  } catch (error) {
    console.error('❌ Error checking provider column:', error);
    return false;
  }
}

// Function to check if api_libraries table exists
async function checkApiLibrariesTable() {
  try {
    console.log('🔍 Checking api_libraries table existence...');
    
    const { data, error } = await supabase
      .from('api_libraries')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.error('❌ api_libraries table does not exist');
        return false;
      }
      throw error;
    }
    
    console.log('✅ api_libraries table exists');
    return true;
  } catch (error) {
    console.error('❌ Error checking api_libraries table:', error);
    return false;
  }
}

// Function to check if feedback table exists
async function checkFeedbackTable() {
  try {
    console.log('🔍 Checking feedback table existence...');
    
    const { data, error } = await supabase
      .from('feedback')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.error('❌ feedback table does not exist');
        return false;
      }
      throw error;
    }
    
    console.log('✅ feedback table exists');
    return true;
  } catch (error) {
    console.error('❌ Error checking feedback table:', error);
    return false;
  }
}

// Function to add provider column to agents table
async function addProviderColumn() {
  try {
    console.log('⚙️ Adding provider column to agents table...');
    
    // We'll use a test insert with provider field to implicitly add the column
    const testAgent = {
      name: 'Test Provider Agent',
      role: 'TestRole',
      description: 'Test agent to add provider column',
      provider: 'TestProvider'
    };
    
    const { data, error } = await supabase
      .from('agents')
      .insert(testAgent)
      .select();
    
    if (error) {
      // If we still can't insert with provider, try another approach
      console.error('❌ Error adding provider column through insert:', error);
      return false;
    }
    
    console.log('✅ Provider column added to agents table');
    
    // Clean up test data
    if (data && data.length > 0) {
      const { error: deleteError } = await supabase
        .from('agents')
        .delete()
        .eq('id', data[0].id);
      
      if (deleteError) {
        console.warn('⚠️ Could not delete test agent:', deleteError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error adding provider column:', error);
    return false;
  }
}

// Function to create api_libraries table
async function createApiLibrariesTable() {
  try {
    console.log('⚙️ Creating api_libraries table...');
    
    // We'll create the table by inserting a test record
    const testLibrary = {
      name: 'Test API Library',
      provider: 'Test Provider',
      api_key: 'test_api_key',
      purpose: 'testing'
    };
    
    const { data, error } = await supabase
      .from('api_libraries')
      .insert(testLibrary)
      .select();
    
    if (error) {
      console.error('❌ Error creating api_libraries table through insert:', error);
      return false;
    }
    
    console.log('✅ api_libraries table created');
    
    // Clean up test data
    if (data && data.length > 0) {
      const { error: deleteError } = await supabase
        .from('api_libraries')
        .delete()
        .eq('id', data[0].id);
      
      if (deleteError) {
        console.warn('⚠️ Could not delete test library:', deleteError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creating api_libraries table:', error);
    return false;
  }
}

// Function to create feedback table
async function createFeedbackTable() {
  try {
    console.log('⚙️ Creating feedback table...');
    
    // We'll create the table by inserting a test record
    const testFeedback = {
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      rating: 5,
      category: 'app_experience',
      content: 'Test feedback'
    };
    
    const { data, error } = await supabase
      .from('feedback')
      .insert(testFeedback)
      .select();
    
    if (error) {
      console.error('❌ Error creating feedback table through insert:', error);
      
      // If it fails, try creating it with a more minimal structure
      const simpleFeedback = {
        rating: 5,
        category: 'test',
        content: 'Test feedback'
      };
      
      const { data: simpleData, error: simpleError } = await supabase
        .from('feedback')
        .insert(simpleFeedback)
        .select();
      
      if (simpleError) {
        console.error('❌ Error creating simplified feedback table:', simpleError);
        return false;
      }
      
      console.log('✅ feedback table created with simplified structure');
      return true;
    }
    
    console.log('✅ feedback table created');
    
    // Clean up test data
    if (data && data.length > 0) {
      const { error: deleteError } = await supabase
        .from('feedback')
        .delete()
        .eq('id', data[0].id);
      
      if (deleteError) {
        console.warn('⚠️ Could not delete test feedback:', deleteError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creating feedback table:', error);
    return false;
  }
}

// Function to verify all corrections
async function verifyCorrections() {
  try {
    console.log('🔍 Verifying all corrections...');
    
    const agentsTableExists = await checkAgentsTable();
    let providerColumnExists = false;
    
    if (agentsTableExists) {
      providerColumnExists = await checkProviderColumn();
    }
    
    const apiLibrariesTableExists = await checkApiLibrariesTable();
    const feedbackTableExists = await checkFeedbackTable();
    
    console.log('\n📊 Verification Results:');
    console.log('-------------------------');
    console.log(`agents table: ${agentsTableExists ? '✅ Exists' : '❌ Missing'}`);
    console.log(`provider column: ${providerColumnExists ? '✅ Exists' : '❌ Missing'}`);
    console.log(`api_libraries table: ${apiLibrariesTableExists ? '✅ Exists' : '❌ Missing'}`);
    console.log(`feedback table: ${feedbackTableExists ? '✅ Exists' : '❌ Missing'}`);
    
    return {
      success: agentsTableExists && providerColumnExists && apiLibrariesTableExists && feedbackTableExists,
      agentsTableExists,
      providerColumnExists,
      apiLibrariesTableExists,
      feedbackTableExists
    };
  } catch (error) {
    console.error('❌ Error verifying corrections:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Main correction function
async function correctDatabaseSchema() {
  console.log('🔧 Starting database schema corrections...');
  
  // Step 1: Verify agents table and provider column
  const agentsTableExists = await checkAgentsTable();
  let providerColumnExists = false;
  
  if (agentsTableExists) {
    providerColumnExists = await checkProviderColumn();
    
    if (!providerColumnExists) {
      await addProviderColumn();
      // Verify provider column was added
      providerColumnExists = await checkProviderColumn();
    }
  } else {
    console.error('❌ Cannot correct provider column: agents table does not exist');
  }
  
  // Step 2: Check and create api_libraries table
  const apiLibrariesTableExists = await checkApiLibrariesTable();
  
  if (!apiLibrariesTableExists) {
    await createApiLibrariesTable();
  }
  
  // Step 3: Check and create feedback table
  const feedbackTableExists = await checkFeedbackTable();
  
  if (!feedbackTableExists) {
    await createFeedbackTable();
  }
  
  // Step 4: Verify all corrections
  const verificationResults = await verifyCorrections();
  
  if (verificationResults.success) {
    console.log('\n✅ All database schema corrections completed successfully!');
  } else {
    console.error('\n❌ Some database schema corrections were not successful.');
    console.log('Please check the verification results above for details.');
  }
  
  return verificationResults;
}

// Run the correction function
correctDatabaseSchema()
  .then(results => {
    console.log('Database schema correction process completed.');
    process.exit(results.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error during schema correction:', error);
    process.exit(1);
  });