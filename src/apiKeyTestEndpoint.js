// Direct test utility to verify API key inclusion
import { verifySupabaseClientConfig } from './lib/supabase-client';
import { createClient } from '@supabase/supabase-js';

// Function to run a direct test to verify API key inclusion in requests
export async function testApiKeyInclusion() {
  try {
    console.group('🔍 API KEY INCLUSION TEST');
    console.log('Testing if API key is properly included in Supabase requests...');

    // Get current client configuration
    const clientConfig = verifySupabaseClientConfig();
    console.log('Current client configuration:', clientConfig);

    // Test with fetch directly to see exact headers
    const headers = new Headers();
    headers.append('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY);
    headers.append('Authorization', `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`);
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    // Log the actual headers being sent
    console.log('🔶 Headers being sent in direct test:');
    headers.forEach((value, key) => {
      if (key.toLowerCase() === 'apikey' || key === 'Authorization') {
        console.log(`${key}: ${value.substring(0, 8)}...${value.substring(value.length - 5)}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });

    // Make a direct request to auth endpoint to check if API key is recognized
    const response = await fetch(`${clientConfig.url}/auth/v1/token?grant_type=none`, {
      method: 'GET',
      headers,
    });

    console.log('🔶 Response status:', response.status, response.statusText);
    
    // Parse response - we don't expect successful auth, but we want to see if API key is recognized
    const responseData = await response.json().catch(() => ({}));
    
    // Check for specific error types
    if (responseData.error && responseData.error === 'invalid_grant') {
      console.log('✅ API key was accepted (got expected auth error, not API key error)');
    } else if (response.status === 401 && responseData.message?.includes('API key')) {
      console.error('❌ API key not accepted:', responseData.message);
    } else if (response.status === 400) {
      console.log('✅ API key appears valid (got expected bad request error)');
    } else {
      console.log('Response data:', responseData);
    }
    
    // Check with a Supabase client created with explicit headers
    console.log('🔶 Testing with explicitly created Supabase client...');
    
    // Create a new client with very explicit headers
    const explicitClient = createClient(clientConfig.url, import.meta.env.VITE_SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'X-Client-Info': 'supabase-js/2.x',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
      },
    });
    
    // Try a simple query with the explicit client
    const { error: explicitError } = await explicitClient.from('non_existent_table').select('*').limit(1);
    
    if (explicitError) {
      if (explicitError.code === '42P01') { // Table doesn't exist error - expected
        console.log('✅ Explicit client working correctly (API key accepted)');
      } else if (explicitError.message.includes('API key')) {
        console.error('❌ API key issue with explicit client:', explicitError.message);
      } else {
        console.warn('⚠️ Other error with explicit client:', explicitError.message);
      }
    }

    console.log('🔍 API key inclusion test complete');
    console.groupEnd();
    
    return {
      success: !responseData.message?.includes('API key'),
      details: {
        clientConfig,
        response: {
          status: response.status,
          data: responseData
        }
      }
    };
  } catch (error) {
    console.error('❌ Error testing API key inclusion:', error);
    console.groupEnd();
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}