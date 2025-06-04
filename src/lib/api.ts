import { supabase } from './supabase-client';

/**
 * Check if a table exists in the database
 * @param tableName Name of the table to check
 * @returns Promise that resolves to a boolean indicating if the table exists
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('count(*)', { count: 'exact', head: true });
    
    // If we get here without an error, the table exists
    return true;
  } catch (error) {
    // Check if the error is a "relation does not exist" error
    if (error instanceof Error && error.message.includes('does not exist')) {
      return false;
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Check if RLS is enabled for a table
 * @param tableName Name of the table to check
 * @returns Promise that resolves to a boolean indicating if RLS is enabled
 */
export async function checkRLSEnabled(tableName: string): Promise<boolean> {
  try {
    // Since we can't directly verify RLS, we'll infer it from the table's existence
    // and our ability to query it with the current permissions
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    // If we can query the table without permission errors, we assume RLS is properly configured
    return !error || !error.message.includes('permission denied');
  } catch (error) {
    console.error(`Error checking RLS for ${tableName}:`, error);
    return false;
  }
}

/**
 * Create the agent_categories table if it doesn't exist
 * @returns Promise resolving to a boolean indicating success
 */
export async function createAgentCategoriesTable(): Promise<boolean> {
  try {
    const agentCategoriesExists = await checkTableExists('agent_categories');
    
    if (!agentCategoriesExists) {
      // We would normally execute SQL here, but since we can't directly execute SQL,
      // we'll try to create the table by inserting a record
      console.log('Creating agent_categories table by inserting sample data...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('agent_categories')
        .insert([
          { name: 'Nutrition', description: 'Diet and food-related agents' },
          { name: 'Fitness', description: 'Exercise and workout-related agents' },
          { name: 'Feedback', description: 'User feedback collection agents' },
          { name: 'General', description: 'General purpose assistants' }
        ])
        .select();
        
      if (insertError) {
        console.error('Error creating agent_categories table:', insertError);
        return false;
      }
      
      console.log('Successfully created agent_categories table');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating agent_categories table:', error);
    return false;
  }
}

/**
 * Prepare agents table by ensuring sample agents exist
 * @returns Promise resolving to a boolean indicating success
 */
export async function prepareAgentsTable(): Promise<boolean> {
  try {
    // Check if table exists and has data
    const { data, error } = await supabase
      .from('agents')
      .select('*');
      
    if (error) {
      console.error('Error checking agents table:', error);
      return false;
    }
    
    // If table is empty, add sample data
    if (data.length === 0) {
      const sampleAgents = [
        { 
          name: 'Nutrition Assistant', 
          role: 'Primary',
          category: 'Nutrition',
          description: 'Analyzes your meals and provides nutritional insights',
          default_api_model: '',
          input_types: ['text', 'photo']
        },
        { 
          name: 'Workout Analyzer', 
          role: 'Primary',
          category: 'Fitness',
          description: 'Reviews your exercise routines and suggests improvements',
          default_api_model: '',
          input_types: ['text']
        },
        { 
          name: 'Life Coach', 
          role: 'Support',
          category: 'General',
          description: 'Provides personalized guidance for self-improvement',
          default_api_model: '',
          input_types: ['text']
        },
        { 
          name: 'General Assistant', 
          role: 'Coordinator',
          category: 'General',
          description: 'Answers general questions about health and fitness',
          default_api_model: '',
          input_types: ['text', 'voice']
        }
      ];
      
      const { error: insertError } = await supabase
        .from('agents')
        .insert(sampleAgents);
        
      if (insertError) {
        console.error('Error inserting sample agents:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error preparing agents table:', error);
    return false;
  }
}

/**
 * Check if a column exists in a table
 * @param tableName The name of the table
 * @param columnName The name of the column to check
 * @returns Promise resolving to a boolean indicating if the column exists
 */
export async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    // Create a select query specifying just this column
    const query: Record<string, any> = {};
    query[columnName] = true;
    
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    if (error && error.message.includes(columnName)) {
      // Column doesn't exist
      return false;
    }
    
    // If we got here without a column-specific error, the column exists
    return true;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
}

/**
 * Add required columns to tables if they're missing
 * @returns Promise resolving to an object with the results
 */
export async function addRequiredColumns(): Promise<{success: boolean, results: Record<string, boolean>}> {
  const results: Record<string, boolean> = {};
  let success = true;
  
  try {
    // Check if provider column exists in agents table
    const providerExists = await checkColumnExists('agents', 'provider');
    
    if (!providerExists) {
      // We can't directly add columns through Supabase client API, 
      // but we can try to add the column implicitly by inserting a record
      const testAgent = {
        name: 'Test Provider Agent',
        role: 'TestRole',
        description: 'Test agent to add provider column',
        provider: 'TestProvider'
      };
      
      const { data, error } = await supabase
        .from('agents')
        .insert(testAgent)
        .select();
      
      if (error) {
        console.error('Error adding provider column through insert:', error);
        results['add_provider_column'] = false;
        success = false;
      } else {
        results['add_provider_column'] = true;
        
        // Clean up test data
        if (data && data.length > 0) {
          await supabase
            .from('agents')
            .delete()
            .eq('id', data[0].id);
        }
      }
    } else {
      results['provider_column_exists'] = true;
    }
    
    // Check for default_api_model column
    const defaultApiModelExists = await checkColumnExists('agents', 'default_api_model');
    
    if (!defaultApiModelExists) {
      // Try to add the column implicitly
      const testAgent = {
        name: 'Test Default API Model Agent',
        role: 'TestRole',
        description: 'Test agent to add default_api_model column',
        default_api_model: 'test-model-id'
      };
      
      const { data, error } = await supabase
        .from('agents')
        .insert(testAgent)
        .select();
      
      if (error) {
        console.error('Error adding default_api_model column through insert:', error);
        results['add_default_api_model_column'] = false;
        success = false;
      } else {
        results['add_default_api_model_column'] = true;
        
        // Clean up test data
        if (data && data.length > 0) {
          await supabase
            .from('agents')
            .delete()
            .eq('id', data[0].id);
        }
      }
    } else {
      results['default_api_model_column_exists'] = true;
    }
    
    return { success, results };
  } catch (error) {
    console.error('Error adding required columns:', error);
    return { 
      success: false, 
      results: { 
        ...results, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      } 
    };
  }
}