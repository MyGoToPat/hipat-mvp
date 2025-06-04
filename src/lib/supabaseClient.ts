import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (import.meta.env.DEV) {
  console.log('Supabase Configuration:');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`API Key: ${supabaseKey ? `${supabaseKey.substring(0, 10)}...${supabaseKey.substring(supabaseKey.length - 5)}` : 'undefined'}`);
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase configuration.");
}

const supabaseOptions = {
  auth: { 
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    headers: { 
      'apikey': supabaseKey,
      'X-Client-Info': 'supabase-js/2.x'
    }
  },
  global: { 
    headers: { 
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions);


// Function to verify the current client configuration
export function verifySupabaseClientConfig() {
  return {
    url: supabaseUrl,
    keyValid: !!supabaseKey && supabaseKey.length > 20,
    keyFormat: /^eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(supabaseKey || ''),
    options: {
      hasExplicitApiKey: true
    }
  };
}