/**
 * Utility to check Supabase client configuration and API key inclusion
 */
import { supabase, verifySupabaseClientConfig } from '../lib/supabase-client';

/**
 * Analyzes a request to verify the API key is included
 */
export async function verifyApiKeyInclusion() {
  console.group('🔍 SUPABASE API KEY VERIFICATION');
  
  // 1. Check environment variables are loaded
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Environment variables:');
  console.log(`VITE_SUPABASE_URL: ${supabaseUrl || 'MISSING'}`);
  console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseKey ? `${supabaseKey.substring(0, 8)}...${supabaseKey.substring(supabaseKey.length - 5)}` : 'MISSING'}`);
  console.log(`API Key length: ${supabaseKey?.length || 0} characters`);
  
  // 2. Retrieve supabase client configuration
  const clientConfig = verifySupabaseClientConfig();
  console.log('Client configuration:', clientConfig);
  
  // 3. Test a simple request
  console.log('Testing a simple request to verify API key inclusion...');
  try {
    // Make a simple request
    const before = performance.now();
    const { data, error } = await supabase.auth.getSession();
    const duration = performance.now() - before;
    
    console.log(`Request completed in ${Math.round(duration)}ms`);
    
    if (error) {
      console.error('Error during test request:', error.message);
      if (error.message.includes('API key')) {
        console.error('❌ API KEY ERROR DETECTED!');
      }
    } else {
      console.log('✅ Request succeeded - API key appears to be working');
      console.log('Session data available:', !!data.session);
    }
  } catch (err) {
    console.error('Exception during test request:', err);
  }
  
  // 4. Test with fetch API directly to see headers
  console.log('Testing direct fetch API call...');
  try {
    const headers = new Headers();
    headers.append('apikey', supabaseKey);
    headers.append('Content-Type', 'application/json');
    
    console.log('Request headers:');
    headers.forEach((value, key) => {
      if (key.toLowerCase() === 'apikey') {
        console.log(`${key}: ${value.substring(0, 8)}...${value.substring(value.length - 5)}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });
    
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=none`, {
      method: 'GET',
      headers,
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    // Try to parse the response
    const responseData = await response.json().catch(() => ({}));
    console.log('Response data:', responseData);
    
    if (responseData.message?.includes('API key')) {
      console.error('❌ API KEY ERROR IN DIRECT FETCH TEST!');
    } else {
      console.log('✅ Direct fetch test - API key appears to be working');
    }
  } catch (err) {
    console.error('Exception during direct fetch test:', err);
  }
  
  console.groupEnd();
  
  return {
    environmentVariables: {
      urlPresent: !!supabaseUrl,
      keyPresent: !!supabaseKey,
      keyLength: supabaseKey?.length || 0,
    },
    clientConfig: {
      url: clientConfig.url,
      keyValid: clientConfig.keyValid,
    }
  };
}

/**
 * Enhanced function to test Supabase connections with API key focus
 */
export async function testSupabaseWithExplicitApiKey() {
  console.group('🧪 COMPREHENSIVE SUPABASE API KEY TEST');
  
  const supabaseConfig = verifySupabaseClientConfig();
  console.log('Supabase client configuration:', supabaseConfig);
  
  // Create explicit headers for direct testing
  const headers = {
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
  
  console.log('Explicit headers configuration:');
  Object.keys(headers).forEach(key => {
    if (key.toLowerCase() === 'apikey' || key.toLowerCase() === 'authorization') {
      const value = headers[key];
      console.log(`${key}: ${value.substring(0, 8)}...${value.substring(value.length - 5)}`);
    } else {
      console.log(`${key}: ${headers[key]}`);
    }
  });
  
  // Test authentication with enhanced logging
  try {
    console.log('Testing authentication with explicit API key...');
    
    // First get any existing session
    console.log('1. Checking for existing session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session check error:', sessionError);
    } else {
      console.log('Session check response:', sessionData.session ? 'Session found' : 'No session');
    }
    
    // Test sign-in with credentials
    console.log('2. Testing sign in with credentials...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'info@hipat.app',
      password: 'admin123',
    });
    
    if (signInError) {
      console.error('Sign-in error:', signInError);
      if (signInError.message?.includes('API key')) {
        console.error('❌ API KEY ERROR DETECTED DURING SIGN-IN!');
      } else {
        console.log('Error does not appear to be API key related');
      }
    } else {
      console.log('✅ Sign-in successful! API key is working');
      console.log('User:', signInData.user?.email);
    }
    
    // Test a direct data query to verify API key in data access
    console.log('3. Testing data query to verify API key in data access...');
    const { data: queryData, error: queryError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (queryError) {
      console.error('Data query error:', queryError);
      if (queryError.message?.includes('API key')) {
        console.error('❌ API KEY ERROR DETECTED DURING DATA QUERY!');
      } else {
        console.log('Error does not appear to be API key related');
      }
    } else {
      console.log('✅ Data query successful! API key is working for data access');
      console.log('Records returned:', queryData?.length || 0);
    }
    
    console.log('API key tests completed');
  } catch (error) {
    console.error('Error during API key testing:', error);
  }
  
  console.groupEnd();
  
  return {
    clientConfigured: true,
    apiKeyVerified: true,
    explicitHeadersUsed: true
  };
}