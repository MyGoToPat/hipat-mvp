import { supabase } from '../lib/supabase-client';
import { ensureAuthenticated } from './autoAuth';

/**
 * Decodes a JWT token without using external libraries
 * @param token The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Verifies and logs the current authentication context
 * @returns Promise that resolves to an object with auth details or error
 */
export async function verifyAuthContext(): Promise<{
  authenticated: boolean;
  session: any;
  user: any;
  jwtPayload: any;
  hasValidSubClaim: boolean;
  role: string;
}> {
  try {
    console.log('Verifying Supabase authentication context...');
    
    // First ensure we're authenticated before verification
    await ensureAuthenticated();
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('⚠️ Error getting session:', error.message);
      return {
        authenticated: false,
        session: null,
        user: null,
        jwtPayload: null,
        hasValidSubClaim: false,
        role: 'unauthenticated'
      };
    }
    
    if (!session) {
      console.log('⚠️ No active session found (anonymous/unauthenticated access)');
      return {
        authenticated: false,
        session: null,
        user: null,
        jwtPayload: null,
        hasValidSubClaim: false,
        role: 'anon'
      };
    }
    
    // Extract and decode the access token
    const accessToken = session.access_token;
    const jwtPayload = decodeJwt(accessToken);
    
    // Check for sub claim (user ID)
    const hasValidSubClaim = !!(jwtPayload && jwtPayload.sub);
    
    // Log detailed authentication info
    console.log('✅ Active session found');
    console.log('User ID (sub):', jwtPayload?.sub);
    console.log('User email:', session.user?.email);
    console.log('Role:', jwtPayload?.role || 'unknown');
    console.log('Has valid sub claim:', hasValidSubClaim);
    console.log('JWT issued at:', new Date((jwtPayload?.iat || 0) * 1000).toISOString());
    console.log('JWT expires at:', new Date((jwtPayload?.exp || 0) * 1000).toISOString());
    console.log('Full JWT payload:', jwtPayload);
    
    // Check for admin status if we have a user
    let isAdmin = false;
    if (session.user) {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        isAdmin = profileData?.is_admin || false;
        console.log('User has admin privileges:', isAdmin);
      } catch (profileError) {
        console.error('Error checking admin status:', profileError);
      }
    }
    
    return {
      authenticated: true,
      session,
      user: session.user,
      jwtPayload,
      hasValidSubClaim,
      role: jwtPayload?.role || 'authenticated'
    };
  } catch (error) {
    console.error('❌ Unexpected error verifying auth context:', error);
    return {
      authenticated: false,
      session: null,
      user: null,
      jwtPayload: null,
      hasValidSubClaim: false,
      role: 'error'
    };
  }
}

/**
 * Tests write operations on the agents table to verify RLS policies
 */
export async function testAgentsTableAccess() {
  console.log('Testing agents table access permissions...');
  
  // Step 1: Ensure we're authenticated before testing
  await ensureAuthenticated();
  
  // Step 2: Verify current auth context
  const authContext = await verifyAuthContext();
  
  // Step 3: Try to read from the agents table
  console.log('Testing READ access to agents table...');
  const { data: readData, error: readError } = await supabase
    .from('agents')
    .select('*')
    .limit(1);
    
  if (readError) {
    console.error('❌ READ access failed:', readError.message);
    console.error('Error code:', readError.code);
    
    if (readError.code === '42501') {
      console.error('This is a permission violation error (RLS policy blocking the operation)');
    }
  } else {
    console.log('✅ READ access successful');
    console.log('Sample data:', readData);
  }
  
  // Step 4: Try to write to the agents table
  console.log('Testing WRITE access to agents table...');
  const testAgent = {
    name: 'Auth Test Agent',
    role: 'TestRole',
    description: 'Testing auth context and RLS policies',
    provider: 'Test'
  };
  
  const { data: writeData, error: writeError } = await supabase
    .from('agents')
    .insert(testAgent)
    .select();
    
  if (writeError) {
    console.error('❌ WRITE access failed:', writeError.message);
    console.error('Error code:', writeError.code);
    
    if (writeError.code === '42501') {
      console.error('This is a permission violation error (RLS policy blocking the operation)');
      console.log('Current auth context:', {
        authenticated: authContext.authenticated,
        userId: authContext.user?.id,
        role: authContext.role
      });
    }
  } else {
    console.log('✅ WRITE access successful');
    console.log('Inserted data:', writeData);
    
    // Clean up test data
    if (writeData && writeData.length > 0) {
      const { error: deleteError } = await supabase
        .from('agents')
        .delete()
        .eq('id', writeData[0].id);
        
      if (deleteError) {
        console.error('⚠️ Could not delete test data:', deleteError.message);
      } else {
        console.log('✅ Test data cleaned up successfully');
      }
    }
  }
  
  return {
    authContext,
    readAccess: !readError,
    writeAccess: !writeError,
    readError,
    writeError
  };
}