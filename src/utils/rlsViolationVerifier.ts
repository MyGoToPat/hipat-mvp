import { supabase } from '../lib/supabase-client';
import { verifyAuthContext } from './supabaseAuthChecker';
import { ensureAuthenticated } from './autoAuth';

/**
 * Comprehensive verification utility to test if RLS violations are permanently resolved
 * @returns Promise resolving to verification results
 */
export async function verifyRLSPermissions() {
  console.log('🔍 BEGINNING COMPREHENSIVE RLS VERIFICATION');
  console.log('==========================================');
  
  // Step 0: Ensure we're authenticated before verification
  await ensureAuthenticated();
  
  // Step 1: Verify current authentication context
  console.log('\n📋 Step 1: Verifying Authentication Context');
  console.log('------------------------------------------');
  const authContext = await verifyAuthContext();
  
  if (!authContext.authenticated) {
    console.log('⚠️ Not authenticated - Cannot perform complete verification');
    console.log('RLS tests will likely fail as expected for unauthenticated users');
    
    return {
      success: false,
      authStatus: 'unauthenticated',
      reason: 'User not authenticated',
      canRead: false,
      canWrite: false,
      resolved: false,
      details: {
        authContext
      }
    };
  }
  
  // Step 2: Perform READ test
  console.log('\n📋 Step 2: Testing READ Access');
  console.log('---------------------------');
  console.log(`Authenticated as: ${authContext.user?.email} (${authContext.role} role)`);
  
  const readResults = await testReadAccess();
  
  // Step 3: Perform first WRITE test
  console.log('\n📋 Step 3: Testing WRITE Access (Insert)');
  console.log('------------------------------------');
  
  const writeResults = await testWriteAccess();
  
  // Step 4: Perform UPDATE test if write was successful
  console.log('\n📋 Step 4: Testing UPDATE Access');
  console.log('------------------------------');
  
  let updateResults = { success: false, error: null, recordId: null };
  
  if (writeResults.success && writeResults.recordId) {
    updateResults = await testUpdateAccess(writeResults.recordId);
  } else {
    console.log('⚠️ Skipping update test because insert failed');
  }
  
  // Step 5: Perform DELETE test if write was successful
  console.log('\n📋 Step 5: Testing DELETE Access');
  console.log('------------------------------');
  
  let deleteResults = { success: false, error: null };
  
  if (writeResults.success && writeResults.recordId) {
    deleteResults = await testDeleteAccess(writeResults.recordId);
  } else {
    console.log('⚠️ Skipping delete test because insert failed');
  }
  
  // Step 6: Analyze RLS violations
  console.log('\n📋 Step 6: Analyzing RLS Policy Violations');
  console.log('----------------------------------------');
  
  const hasRLSViolations = 
    (readResults.error?.code === '42501') || 
    (writeResults.error?.code === '42501') ||
    (updateResults.error?.code === '42501') ||
    (deleteResults.error?.code === '42501');
  
  if (hasRLSViolations) {
    console.error('❌ RLS POLICY VIOLATIONS DETECTED');
    console.log('RLS issues are NOT permanently resolved');
    
    if (readResults.error?.code === '42501') {
      console.error('- READ access denied by RLS policy');
    }
    
    if (writeResults.error?.code === '42501') {
      console.error('- WRITE access denied by RLS policy');
    }
    
    if (updateResults.error?.code === '42501') {
      console.error('- UPDATE access denied by RLS policy');
    }
    
    if (deleteResults.error?.code === '42501') {
      console.error('- DELETE access denied by RLS policy');
    }
  } else {
    console.log('✅ NO RLS POLICY VIOLATIONS DETECTED');
    
    if (readResults.success && writeResults.success && deleteResults.success) {
      console.log('✅ RLS ISSUES ARE PERMANENTLY RESOLVED');
      console.log('All operations completed successfully without RLS violations');
    } else {
      console.log('⚠️ PARTIAL SUCCESS - Some operations failed but not due to RLS violations');
      console.log('Issues may exist but they are not RLS policy violations (code 42501)');
    }
  }
  
  // Step 7: Generate final report
  console.log('\n📋 FINAL VERIFICATION REPORT');
  console.log('===========================');
  console.log(`Authentication Status: ${authContext.authenticated ? 'Authenticated' : 'Not Authenticated'}`);
  console.log(`User: ${authContext.user?.email || 'None'}`);
  console.log(`Role: ${authContext.role}`);
  console.log(`Valid JWT Sub Claim: ${authContext.hasValidSubClaim ? 'Yes' : 'No'}`);
  console.log(`READ Access: ${readResults.success ? 'Success' : 'Failed'}`);
  console.log(`WRITE Access: ${writeResults.success ? 'Success' : 'Failed'}`);
  console.log(`UPDATE Access: ${updateResults.success ? 'Success' : 'Failed'}`);
  console.log(`DELETE Access: ${deleteResults.success ? 'Success' : 'Failed'}`);
  console.log(`RLS Violations Detected: ${hasRLSViolations ? 'Yes' : 'No'}`);
  console.log(`RLS Issues Resolved: ${!hasRLSViolations ? 'Yes' : 'No'}`);
  
  return {
    success: !hasRLSViolations,
    authStatus: authContext.authenticated ? 'authenticated' : 'unauthenticated',
    role: authContext.role,
    hasValidSubClaim: authContext.hasValidSubClaim,
    canRead: readResults.success,
    canWrite: writeResults.success,
    canUpdate: updateResults.success,
    canDelete: deleteResults.success,
    resolved: !hasRLSViolations && readResults.success,
    details: {
      authContext,
      readResults,
      writeResults,
      updateResults,
      deleteResults
    }
  };
}

/**
 * Test READ access to the agents table
 */
async function testReadAccess() {
  try {
    console.log('Testing READ access to agents table...');
    
    // Ensure we're authenticated first
    await ensureAuthenticated();
    
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .limit(5);
      
    if (error) {
      console.error('❌ READ access failed:', error.message);
      console.error('Error code:', error.code);
      
      if (error.code === '42501') {
        console.error('This is a permission violation error (RLS policy blocking the operation)');
      }
      
      return { success: false, error, data: null };
    }
    
    console.log('✅ READ access successful');
    console.log(`Retrieved ${data?.length || 0} records`);
    
    if (data && data.length > 0) {
      console.log('Sample record:', data[0]);
    }
    
    return { success: true, error: null, data };
  } catch (error) {
    console.error('❌ Unexpected error during READ test:', error);
    return { success: false, error, data: null };
  }
}

/**
 * Test WRITE access to the agents table
 */
async function testWriteAccess() {
  try {
    console.log('Testing WRITE (INSERT) access to agents table...');
    
    // Ensure we're authenticated first
    await ensureAuthenticated();
    
    const timestamp = new Date().toISOString();
    const testAgent = {
      name: `RLS Test Agent ${timestamp}`,
      role: `TestRole-${Date.now()}`,
      description: 'Testing RLS policy resolution',
      provider: 'RLS-Test'
    };
    
    const { data, error } = await supabase
      .from('agents')
      .insert(testAgent)
      .select();
      
    if (error) {
      console.error('❌ WRITE access failed:', error.message);
      console.error('Error code:', error.code);
      
      if (error.code === '42501') {
        console.error('This is a permission violation error (RLS policy blocking the operation)');
      }
      
      return { success: false, error, data: null, recordId: null };
    }
    
    console.log('✅ WRITE access successful');
    
    if (data && data.length > 0) {
      console.log('Inserted record:', data[0]);
      return { success: true, error: null, data, recordId: data[0].id };
    }
    
    return { success: true, error: null, data, recordId: null };
  } catch (error) {
    console.error('❌ Unexpected error during WRITE test:', error);
    return { success: false, error, data: null, recordId: null };
  }
}

/**
 * Test UPDATE access to the agents table
 */
async function testUpdateAccess(recordId: string) {
  try {
    console.log(`Testing UPDATE access to agents table for record ${recordId}...`);
    
    // Ensure we're authenticated first
    await ensureAuthenticated();
    
    const timestamp = new Date().toISOString();
    const updates = {
      name: `Updated RLS Test Agent ${timestamp}`,
      description: 'Updated description for RLS test'
    };
    
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', recordId)
      .select();
      
    if (error) {
      console.error('❌ UPDATE access failed:', error.message);
      console.error('Error code:', error.code);
      
      if (error.code === '42501') {
        console.error('This is a permission violation error (RLS policy blocking the operation)');
      }
      
      return { success: false, error, recordId };
    }
    
    console.log('✅ UPDATE access successful');
    
    if (data && data.length > 0) {
      console.log('Updated record:', data[0]);
    }
    
    return { success: true, error: null, recordId };
  } catch (error) {
    console.error('❌ Unexpected error during UPDATE test:', error);
    return { success: false, error, recordId };
  }
}

/**
 * Test DELETE access to the agents table
 */
async function testDeleteAccess(recordId: string) {
  try {
    console.log(`Testing DELETE access to agents table for record ${recordId}...`);
    
    // Ensure we're authenticated first
    await ensureAuthenticated();
    
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', recordId);
      
    if (error) {
      console.error('❌ DELETE access failed:', error.message);
      console.error('Error code:', error.code);
      
      if (error.code === '42501') {
        console.error('This is a permission violation error (RLS policy blocking the operation)');
      }
      
      return { success: false, error };
    }
    
    console.log('✅ DELETE access successful');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ Unexpected error during DELETE test:', error);
    return { success: false, error };
  }
}