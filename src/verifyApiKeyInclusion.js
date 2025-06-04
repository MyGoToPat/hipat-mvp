// Standalone utility to verify API key inclusion in Supabase requests
import { createClient } from '@supabase/supabase-js';
import { verifySupabaseClientConfig } from './lib/supabase-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to check Supabase client configuration and explicitly test API key
async function verifyApiKey() {
  console.log('📋 VERIFYING API KEY INCLUSION IN SUPABASE REQUESTS');
  console.log('==================================================');
  
  // Get environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Environment variable check:');
  console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Present' : '❌ Missing'}`);
  console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Present' : '❌ Missing'}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }
  
  console.log(`URL: ${supabaseUrl}`);
  console.log(`API Key (preview): ${supabaseKey.substring(0, 8)}...${supabaseKey.substring(supabaseKey.length - 5)}`);
  console.log(`API Key length: ${supabaseKey.length} characters`);
  
  // Validate API key format (should be JWT format)
  const keyFormatValid = /^eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(supabaseKey);
  console.log(`API Key format valid: ${keyFormatValid ? '✅' : '❌'}`);
  
  // Get the client configuration
  try {
    const clientConfig = verifySupabaseClientConfig();
    console.log('Current client configuration:', clientConfig);
  } catch (error) {
    console.error('Error getting client configuration:', error);
  }
  
  // Create a client with very explicit options
  console.log('\n📋 Creating test client with explicit API key configuration...');
  
  const explicitClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    // Explicitly set global headers to include API key
    global: {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'X-Client-Info': 'supabase-js/explicit-test'
      },
    },
  });
  
  // Test API key with simple query
  console.log('\n📋 Testing API key with a simple query...');
  
  try {
    // Try to query an expected table
    const { data, error } = await explicitClient
      .from('_nonexistent_table')
      .select('*')
      .limit(1);
      
    // If error code is 42P01, that means "relation does not exist"
    // This is expected and means the API key worked, it just couldn't find the table
    if (error) {
      if (error.code === '42P01') {
        console.log('✅ API key is valid and included properly (expected "relation does not exist" error)');
      } else if (error.message.includes('API key')) {
        console.error('❌ API KEY ERROR:', error.message);
        console.error('This indicates the API key is not being included correctly');
      } else {
        console.error('❌ Other error during API key test:', error.message);
        console.error('Code:', error.code, 'Details:', error.details || 'No details');
      }
    } else {
      console.log('✅ API key is valid (query succeeded)');
    }
  } catch (error) {
    console.error('❌ Exception during API key test:', error.message);
  }
  
  // Test authentication explicitly
  console.log('\n📋 Testing API key with authentication...');
  
  try {
    // Try to sign in with the test user
    const { data, error } = await explicitClient.auth.signInWithPassword({
      email: 'info@hipat.app',
      password: 'admin123'
    });
    
    if (error) {
      console.error('❌ Authentication error:', error.message);
      
      if (error.message.includes('API key')) {
        console.error('❌ API KEY ERROR DETECTED IN AUTHENTICATION!');
      } else {
        console.log('Error does not appear to be API key related');
      }
    } else {
      console.log('✅ Authentication successful! API key is working correctly');
      console.log('User:', data.user.email);
      
      // Verify the session token
      console.log('Session token check:');
      const token = data.session.access_token;
      console.log(`Token length: ${token.length} characters`);
      console.log(`Token format: ${token.split('.').length === 3 ? '✅ Valid JWT' : '❌ Invalid format'}`);
    }
  } catch (error) {
    console.error('❌ Exception during authentication test:', error.message);
  }
  
  console.log('\n📋 API key verification complete');
}

// Run verification
verifyApiKey()
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });