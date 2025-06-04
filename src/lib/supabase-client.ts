import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log configuration values at initialization time
console.log('Supabase Configuration:');
console.log(`URL: ${supabaseUrl}`);
console.log(`API Key: ${supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 5)}` : 'undefined'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration.");
}

// Create client with explicit apikey headers to ensure it's included in all requests
const supabaseOptions = {
  auth: { 
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    headers: { 'apikey': supabaseAnonKey }
  },
  global: { 
    headers: { 
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Function to verify the current client configuration
export function verifySupabaseClientConfig() {
  return {
    url: supabaseUrl,
    keyValid: !!supabaseAnonKey && supabaseAnonKey.length > 20,
    keyFormat: /^eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(supabaseAnonKey || ''),
    options: {
      hasExplicitApiKey: true
    }
  };
}