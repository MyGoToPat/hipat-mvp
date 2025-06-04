import { supabase } from '../lib/supabase-client';

export async function checkSupabaseConnection() {
  try {
    // Use a simple auth check instead of querying system tables
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    console.log('✅ Supabase connection successful');
    return {
      success: true
    };
  } catch (err) {
    console.error('❌ Supabase connection test error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      details: err
    };
  }
}

export async function checkTableExists(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      console.error(`❌ ${tableName} table does not exist.`);
      return {
        success: false,
        exists: false,
        error: 'Table does not exist'
      };
    } else {
      console.log(`✅ ${tableName} table exists or is accessible.`);
      return {
        success: true,
        exists: true
      };
    }
  } catch (err) {
    console.error(`❌ Error checking if table ${tableName} exists:`, err);
    return {
      success: false,
      exists: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

export async function testTableQuery(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`❌ Test query on ${tableName} failed:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log(`✅ Successfully queried table ${tableName}:`, data);
    return {
      success: true,
      data
    };
  } catch (err) {
    console.error(`❌ Test query on ${tableName} failed:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

export async function runFullDatabaseCheck() {
  console.log('🔍 Starting Supabase database verification...');
  
  // Step 1: Test connection
  const connectionResult = await checkSupabaseConnection();
  if (!connectionResult.success) {
    console.error('❌ Database verification aborted: Cannot connect to Supabase');
    return {
      success: false,
      connectionTest: connectionResult,
      message: 'Failed to connect to Supabase'
    };
  }
  
  // Step 2: Check if essential tables exist
  const messagesTableExists = await checkTableExists('messages');
  const agentsTableExists = await checkTableExists('agents');
  const profilesTableExists = await checkTableExists('profiles');
  const feedbackTableExists = await checkTableExists('feedback');
  const apiLibrariesTableExists = await checkTableExists('api_libraries');
  
  // Step 3: Run test queries on existing tables
  let messagesQueryResult = null;
  let agentsQueryResult = null;
  let profilesQueryResult = null;
  let feedbackQueryResult = null;
  let apiLibrariesQueryResult = null;
  
  if (messagesTableExists.exists) {
    messagesQueryResult = await testTableQuery('messages');
  }
  
  if (agentsTableExists.exists) {
    agentsQueryResult = await testTableQuery('agents');
  }
  
  if (profilesTableExists.exists) {
    profilesQueryResult = await testTableQuery('profiles');
  }
  
  if (feedbackTableExists.exists) {
    feedbackQueryResult = await testTableQuery('feedback');
  }
  
  if (apiLibrariesTableExists.exists) {
    apiLibrariesQueryResult = await testTableQuery('api_libraries');
  }
  
  // Prepare a comprehensive report
  return {
    success: true,
    connectionTest: connectionResult,
    tables: {
      messages: messagesTableExists,
      agents: agentsTableExists,
      profiles: profilesTableExists,
      feedback: feedbackTableExists,
      api_libraries: apiLibrariesTableExists
    },
    testQueries: {
      messages: messagesQueryResult,
      agents: agentsQueryResult,
      profiles: profilesQueryResult,
      feedback: feedbackQueryResult,
      api_libraries: apiLibrariesQueryResult
    }
  };
}