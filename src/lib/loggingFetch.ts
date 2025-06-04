import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Wrap native fetch to log headers of the first call only
let first = true;
async function loggingFetch(input: RequestInfo, init?: RequestInit) {
  if (first) {
    console.log('🚀 REQUEST →', input);
    console.log('🚀 HEADERS →', (init?.headers || {})['apikey'], (init?.headers || {})['Authorization']);
    
    // Log all headers completely
    console.group('🚀 ALL HEADERS');
    if (init?.headers) {
      const headers = init.headers as Record<string, string>;
      Object.entries(headers).forEach(([key, value]) => {
        console.log(`${key}: ${key.toLowerCase() === 'apikey' || key === 'Authorization' ? 
          `${value.substring(0, 10)}...${value.substring(value.length - 5)}` : value}`);
      });
    } else {
      console.log('No headers found in request');
    }
    console.groupEnd();
    
    first = false;
  }
  return fetch(input, init);
}

const supabase = createClient(
  supabaseUrl,
  supabaseAnon,
  {
    global: {
      fetch: loggingFetch,
      headers: {
        apikey: supabaseAnon,
        Authorization: `Bearer ${supabaseAnon}`
      }
    }
  }
);

// Function to verify the current client configuration
export function verifySupabaseClientConfig() {
  return {
    url: supabaseUrl,
    keyValid: !!supabaseAnon && supabaseAnon.length > 20,
    keyFormat: /^eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(supabaseAnon || ''),
    options: {
      hasExplicitApiKey: true
    }
  };
}

export { supabase };