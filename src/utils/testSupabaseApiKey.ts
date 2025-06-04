import { supabase } from '../lib/supabase-client';

export async function testSupabaseApiKey() {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('❌ Explicit timeout: Supabase API key test exceeded 10 seconds')), 10000);
  });

  try {
    console.log('🔍 Testing Supabase API key inclusion in requests...');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('API Key (first 10 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10) + '...');
    
    // Test 1: Perform a simple fetch to see if headers are included properly
    console.log('Test 1: Testing direct fetch with explicit headers...');
    const headers = new Headers();
    headers.append('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY || '');
    headers.append('Authorization', `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`);
    headers.append('Content-Type', 'application/json');
    
    console.log('Headers being sent:');
    headers.forEach((value, key) => {
      if (key.toLowerCase() === 'apikey' || key === 'Authorization') {
        console.log(`${key}: ${value.substring(0, 10)}...${value.substring(value.length - 5)}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });
    
    const response = await Promise.race([
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=none`, {
        method: 'GET',
        headers,
      }),
      timeout
    ]);
    
    if (response instanceof Response) {
      console.log('Response status:', response.status, response.statusText);
      
      // Parse the response
      const responseData = await response.json().catch(() => ({}));
      console.log('Response data:', responseData);
      
      // Test 2: Try a direct Supabase query with explicit timeout
      console.log('Test 2: Performing direct table query with explicit timeout...');
      const request = supabase.from('agents').select('*').limit(1);
      
      const { data, error } = await Promise.race([request, timeout]);

      if (error) {
        console.error('❌ Supabase API request failed:', error);
        
        if (error.message && error.message.includes('API key')) {
          console.error('❌ API KEY ERROR DETECTED: The API key is not being included in the request!');
          console.error('Error details:', error);
          return { success: false, error };
        }
        
        // If we get here, it's an error but not an API key error
        console.log('❓ Error occurred, but not related to API key. Likely a different issue.');
        return { success: true, error };
      }

      console.log('✅ Supabase API key verified:', data);
      return { success: true, data };
    } else {
      throw new Error('Response was not a valid Response object');
    }
  } catch (error) {
    console.error('❌ Explicit API key test error:', error);
    return { success: false, explicitError: error };
  }
}