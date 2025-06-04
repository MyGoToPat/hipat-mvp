/**
 * Utility to diagnose Supabase authentication issues
 * Provides network‑level debugging and connectivity testing
 */

/* ─────────────────────────  Connectivity helpers  ────────────────────────── */

/**
 * Tests network connectivity to a URL
 * @param url   URL to test
 * @returns     Diagnostic info about the attempt
 */
export async function testConnectivity(
  url: string
): Promise<{
  success: boolean;
  latency: number | null;
  error?: Error | null;
  status?: number;
  statusText?: string;
}> {
  try {
    const startTime = performance.now();

    // add cache‑buster so Cloudflare/CDN doesn’t return a stale response
    const testUrl = url.includes('?')
      ? `${url}&_=${Date.now()}`
      : `${url}?_=${Date.now()}`;

    const headers = {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY
    };

    console.log(`Testing connectivity to ${url} with API‑key header`);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers,
      mode: 'cors',
      signal: AbortSignal.timeout(5_000) // 5 s timeout
    });

    const endTime = performance.now();

    // Auth endpoint → 405 on GET, /health → 400 with cache‑buster
    const ok =
      response.ok || response.status === 405 || response.status === 400;

    return {
      success: ok,
      latency: endTime - startTime,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.error(`Connectivity test to ${url} failed:`, error);
    return {
      success: false,
      latency: null,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/* ────────────────────────  Supabase‑specific checks  ─────────────────────── */

/**
 * Tests whether the key Supabase endpoints are reachable.
 * The base‑URL ping is *skipped* because browsers block it via CORS.
 */
export async function testSupabaseConnectivity(
  supabaseUrl: string
): Promise<{
  baseUrl: boolean; // always true now (skipped)
  authEndpoint: boolean;
  restEndpoint: boolean;
  details: Record<string, any>;
}> {
  console.log('🧪 Testing Supabase connectivity…');

  const normalizedUrl = supabaseUrl.endsWith('/')
    ? supabaseUrl.slice(0, -1)
    : supabaseUrl;

  /* ── 1. base‑URL (skipped – CORS) ──────────────────────────────────────── */
  console.log('Skipping base‑URL connectivity test in browser (CORS).');
  const baseUrlTest = { success: true, latency: null };

  /* ── 2. auth endpoint ─────────────────────────────────────────────────── */
  const authUrl = `${normalizedUrl}/auth/v1/token`;
  console.log(`Testing connectivity to auth endpoint: ${authUrl}`);
  const authEndpointTest = await testConnectivity(authUrl);

  /* ── 3. REST endpoint ─────────────────────────────────────────────────── */
  const restUrl = `${normalizedUrl}/rest/v1/health`; // lightweight
  console.log(`Testing connectivity to REST endpoint: ${restUrl}`);
  const restEndpointTest = await testConnectivity(restUrl);

  /* ── 4. compile / log results ─────────────────────────────────────────── */
  const results = {
    baseUrl: baseUrlTest.success,
    authEndpoint: authEndpointTest.success,
    restEndpoint: restEndpointTest.success,
    details: {
      baseUrl: baseUrlTest,
      authEndpoint: authEndpointTest,
      restEndpoint: restEndpointTest
    }
  };

  console.log('📊 Supabase Connectivity Test Results:');
  console.log(
    `Auth Endpoint: ${results.authEndpoint ? '✅' : '❌'} – ${
      authEndpointTest.latency
        ? `${Math.round(authEndpointTest.latency)} ms`
        : 'N/A'
    }`
  );
  console.log(
    `REST Endpoint: ${results.restEndpoint ? '✅' : '❌'} – ${
      restEndpointTest.latency
        ? `${Math.round(restEndpointTest.latency)} ms`
        : 'N/A'
    }`
  );

  return results;
}

/* ──────────────────────  Env‑var sanity checker  ────────────────────────── */

export function verifySupabaseConfig(
  supabaseUrl?: string,
  supabaseKey?: string
): {
  valid: boolean;
  urlValid: boolean;
  keyValid: boolean;
  details: {
    urlLength?: number;
    keyLength?: number;
    urlFormat: boolean;
    keyFormat: boolean;
  };
} {
  console.log('🔍 Verifying Supabase configuration…');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return {
      valid: false,
      urlValid: !!supabaseUrl,
      keyValid: !!supabaseKey,
      details: { urlFormat: false, keyFormat: false }
    };
  }

  /* URL format */
  let urlValid = false;
  try {
    const url = new URL(supabaseUrl);
    urlValid = url.protocol === 'https:' && url.hostname.includes('supabase');
  } catch {
    urlValid = false;
  }

  /* anon‑key format (= JWT) */
  const keyValid = /^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(
    supabaseKey
  );

  console.log(`Supabase URL:  ${supabaseUrl}`);
  console.log(`URL format:    ${urlValid ? '✅' : '❌'}`);
  console.log(
    `Supabase Key:  ${supabaseKey.slice(0, 10)}…${supabaseKey.slice(-5)}`
  );
  console.log(`Key format:    ${keyValid ? '✅' : '❌'}`);

  return {
    valid: urlValid && keyValid,
    urlValid,
    keyValid,
    details: {
      urlLength: supabaseUrl.length,
      keyLength: supabaseKey.length,
      urlFormat: urlValid,
      keyFormat: keyValid
    }
  };
}

/* ─────────────────  Direct password‑grant auth smoke‑test  ──────────────── */

export async function testManualAuthentication(
  supabaseUrl: string,
  email: string,
  password: string
): Promise<{
  success: boolean;
  duration: number;
  response?: any;
  error?: any;
  status?: number;
}> {
  console.log('🧪 Testing manual authentication directly with Supabase API');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password ? '********' : 'undefined'}`);

  const startTime = performance.now();

  try {
    const normalizedUrl = supabaseUrl.endsWith('/')
      ? supabaseUrl.slice(0, -1)
      : supabaseUrl;
    const authUrl = `${normalizedUrl}/auth/v1/token?grant_type=password`;

    console.log(`🔄 Sending direct auth request to: ${authUrl}`);

    const body = JSON.stringify({ email, password });

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
      },
      body,
      signal: AbortSignal.timeout(5_000)
    });

    const duration = performance.now() - startTime;
    const data = await response.json();

    console.log(`🕐 Auth request duration: ${Math.round(duration)} ms`);
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    console.log('📄 Response data:', data);

    return {
      success: response.ok,
      duration,
      response: data,
      status: response.status
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error('❌ Manual authentication test failed:', error);

    return {
      success: false,
      duration,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
