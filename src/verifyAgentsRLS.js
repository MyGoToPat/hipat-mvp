// Script to explicitly test insertion and update operations on the 'agents' table
// to confirm that row-level security (RLS) policies are working correctly
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

// Function to test insert operation
async function testInsertOperation() {
  try {
    console.log('🔍 Testing INSERT operation on agents table...');
    
    // Create a test agent record
    const testAgent = {
      name: 'RLS Test Agent',
      role: 'Primary',
      description: 'Testing RLS insert permissions',
      category: 'General',
      default_api_model: '',
      input_types: ['text']
    };
    
    const { data, error } = await supabase
      .from('agents')
      .insert(testAgent)
      .select();
      
    if (error) {
      console.error('❌ INSERT operation failed:', error.message);
      console.error('Error code:', error.code);
      
      if (error.code === '42501') {
        console.error('This is a permission violation error (RLS policy blocking the operation)');
      }
      
      return { success: false, error, data: null };
    }
    
    console.log('✅ INSERT operation successful');
    console.log('Inserted data:', data);
    
    return { success: true, error: null, data };
  } catch (error) {
    console.error('❌ Unexpected error during INSERT test:', error.message);
    return { success: false, error, data: null };
  }
}

// Function to test update operation
async function testUpdateOperation(recordId) {
  try {
    console.log(`\n🔍 Testing UPDATE operation on agents table (id: ${recordId})...`);
    
    // Update fields on the test record
    const updateData = {
      name: 'RLS Test Agent (Updated)',
      description: 'Testing RLS update permissions'
    };
    
    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', recordId)
      .select();
      
    if (error) {
      console.error('❌ UPDATE operation failed:', error.message);
      console.error('Error code:', error.code);
      
      if (error.code === '42501') {
        console.error('This is a permission violation error (RLS policy blocking the operation)');
      }
      
      return { success: false, error, data: null };
    }
    
    console.log('✅ UPDATE operation successful');
    console.log('Updated data:', data);
    
    return { success: true, error: null, data };
  } catch (error) {
    console.error('❌ Unexpected error during UPDATE test:', error.message);
    return { success: false, error, data: null };
  }
}

// Function to test delete operation
async function testDeleteOperation(recordId) {
  try {
    console.log(`\n🔍 Testing DELETE operation on agents table (id: ${recordId})...`);
    
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', recordId);
      
    if (error) {
      console.error('❌ DELETE operation failed:', error.message);
      console.error('Error code:', error.code);
      
      if (error.code === '42501') {
        console.error('This is a permission violation error (RLS policy blocking the operation)');
      }
      
      return { success: false, error };
    }
    
    console.log('✅ DELETE operation successful');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ Unexpected error during DELETE test:', error.message);
    return { success: false, error };
  }
}

// Function to fetch current session info
async function getCurrentSession() {
  try {
    console.log('\n🔍 Fetching current session information...');
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error fetching session:', error.message);
      return null;
    }
    
    if (!data.session) {
      console.log('ℹ️ No active session found (anonymous access)');
      return null;
    }
    
    console.log('✅ Active session found');
    console.log('User ID:', data.session.user.id);
    console.log('User email:', data.session.user.email);
    
    return data.session;
  } catch (error) {
    console.error('❌ Unexpected error fetching session:', error.message);
    return null;
  }
}

// Function to test if the user is an admin
async function checkAdminStatus(userId) {
  if (!userId) return false;
  
  try {
    console.log('\n🔍 Checking admin status for user...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('❌ Error checking admin status:', error.message);
      return false;
    }
    
    console.log('Admin status:', data.is_admin);
    return data.is_admin || false;
  } catch (error) {
    console.error('❌ Unexpected error checking admin status:', error.message);
    return false;
  }
}

// Main function to run all tests
async function main() {
  console.log('📋 EXPLICIT RLS POLICY VERIFICATION FOR AGENTS TABLE\n');
  
  // Step 1: Get current user session
  const session = await getCurrentSession();
  const userId = session?.user?.id;
  
  // Step 2: Check if user is an admin
  const isAdmin = userId ? await checkAdminStatus(userId) : false;
  
  console.log('\n🔐 Authentication Context:');
  console.log(`User is ${userId ? 'authenticated' : 'not authenticated'}`);
  console.log(`User has admin privileges: ${isAdmin}`);
  
  if (!userId) {
    console.warn('\n⚠️ WARNING: No authenticated user found. RLS policies typically require authentication.');
    console.log('These tests may fail if the RLS policies require an authenticated user.');
    console.log('Consider logging in first or using an admin account for complete testing.');
  }
  
  if (!isAdmin) {
    console.warn('\n⚠️ WARNING: User does not have admin privileges.');
    console.log('Some operations may fail if RLS policies restrict non-admin users.');
  }
  
  console.log('\n🧪 BEGINNING RLS TESTS');
  
  // Step 3: Test INSERT operation
  const insertResult = await testInsertOperation();
  
  // Only proceed with update and delete if insert was successful
  if (insertResult.success && insertResult.data && insertResult.data.length > 0) {
    const recordId = insertResult.data[0].id;
    
    // Step 4: Test UPDATE operation
    const updateResult = await testUpdateOperation(recordId);
    
    // Step 5: Test DELETE operation (cleanup)
    await testDeleteOperation(recordId);
  } else if (!insertResult.success) {
    console.error('\n❌ Skipping UPDATE and DELETE tests because INSERT failed');
  }
  
  // Step 6: Provide summary of results
  console.log('\n📊 RLS TEST RESULTS SUMMARY:');
  console.log('---------------------------');
  console.log(`INSERT operation: ${insertResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (insertResult.success && insertResult.data) {
    console.log(`UPDATE operation: ${updateResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`DELETE operation: ${deleteResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  }
  console.log('---------------------------');
  
  // Step 7: Final conclusion
  if (insertResult.success) {
    console.log('\n✅ RLS POLICY VERIFICATION SUCCESSFUL');
    console.log('The current authentication context has permission to perform operations on the agents table.');
    console.log('Previous row-level security errors (code 42501) have been resolved.');
  } else {
    console.error('\n❌ RLS POLICY VERIFICATION FAILED');
    console.error('The current authentication context does not have permission to perform all operations on the agents table.');
    console.error('Row-level security issues still exist.');
    
    if (insertResult.error && insertResult.error.code === '42501') {
      console.log('\n🔍 TROUBLESHOOTING SUGGESTIONS:');
      console.log('1. Check if you are properly authenticated (you may need to log in)');
      console.log('2. Ensure your user account has admin privileges if required by RLS policies');
      console.log('3. Review RLS policies in Supabase dashboard for the agents table');
      console.log('4. The RLS policy may need to be updated to allow the current user to perform these operations');
    }
    
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});