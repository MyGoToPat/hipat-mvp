import { supabase } from '@/lib/supabaseClient';

// Default credentials for development environment
const DEFAULT_ADMIN_EMAIL = 'info@hipat.app';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

/**
 * Ensures a valid authenticated session exists before any Supabase operations
 */
export async function autoAuthenticate() {
  try {
    console.log('🔐 Ensuring authenticated session exists...');
    
    // Check if we already have a valid session
    const { data: sessionData } = await supabase.auth.getSession();
    const existingSession = sessionData?.session;
    
    // If we have a valid session already, use it
    if (existingSession) {
      console.log('✅ Existing authenticated session found');
      return {
        success: true,
        session: existingSession,
        isNewSession: false
      };
    }
    
    // If no valid session, sign in explicitly
    console.log('⚠️ No active session found, signing in...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
    });
    
    if (error) {
      console.error('❌ Authentication failed:', error.message);
      return {
        success: false,
        session: null,
        error,
        isNewSession: false
      };
    }
    
    console.log('✅ Authentication successful with provided credentials');
    return {
      success: true,
      session: data.session,
      isNewSession: true
    };
  } catch (error) {
    console.error('❌ Unexpected error during authentication:', error);
    return {
      success: false,
      session: null,
      error,
      isNewSession: false
    };
  }
}

/**
 * Verifies the Supabase API key is working correctly
 */
export async function verifyApiKey() {
  try {
    console.log('🔍 Verifying Supabase API key...');
    
    // Simple query to verify API key works
    const { data, error } = await supabase
      .from('agents')
      .select('id')
      .limit(1);
      
    if (error && error.message.includes('apikey')) {
      console.error('❌ API key verification failed:', error.message);
      return { success: false, error };
    }
    
    console.log('✅ API key verified successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error verifying API key:', error);
    return { success: false, error };
  }
}

export async function ensureAuthenticated() {
  // wrapper kept for legacy imports
  await autoAuthenticate();
  await verifyApiKey();
}