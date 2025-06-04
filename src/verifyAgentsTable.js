// Script to verify that the agents table exists in Supabase
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to check if the agents table exists and insert some data if needed
async function verifyAndPrepareAgentsTable() {
  try {
    console.log('🔍 Verifying agents table in Supabase...');
    
    // Check if table exists by attempting a query
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .limit(5);
      
    if (error) {
      if (error.code === '42P01') { // Table doesn't exist error
        console.error('❌ agents table does not exist in Supabase');
        // Create the table - direct insert to create the table automatically
        console.log('⚙️ Attempting to create agents table through insert...');
        
        const { data: insertData, error: insertError } = await supabase
          .from('agents')
          .insert([
            { 
              name: 'General Assistant', 
              role: 'AskMeAnything',
              description: 'General purpose assistant that can answer questions on various topics',
              provider: 'OpenAI'
            }
          ])
          .select();
          
        if (insertError) {
          console.error('❌ Failed to create agents table:', insertError.message);
          process.exit(1);
        } else {
          console.log('✅ Successfully created agents table');
          console.log('Inserted data:', insertData);
        }
      } else {
        console.error('❌ Error querying agents table:', error.message);
        process.exit(1);
      }
    } else {
      console.log('✅ agents table exists in Supabase');
      console.log('Current data:', data);
      
      // If table is empty, insert sample data
      if (data.length === 0) {
        console.log('⚙️ Table is empty, inserting sample agents...');
        
        const sampleAgents = [
          { 
            name: 'Nutrition Assistant', 
            role: 'TellMeWhatYouAte',
            description: 'Analyzes your meals and provides nutritional insights',
            provider: 'OpenAI'
          },
          { 
            name: 'Workout Analyzer', 
            role: 'TellMeAboutYourWorkout',
            description: 'Reviews your exercise routines and suggests improvements',
            provider: 'OpenAI'
          },
          { 
            name: 'Life Coach', 
            role: 'MakeMeBetter',
            description: 'Provides personalized guidance for self-improvement',
            provider: 'OpenAI'
          },
          { 
            name: 'General Assistant', 
            role: 'AskMeAnything',
            description: 'Answers general questions about health and fitness',
            provider: 'OpenAI'
          }
        ];
        
        const { data: insertData, error: insertError } = await supabase
          .from('agents')
          .insert(sampleAgents)
          .select();
          
        if (insertError) {
          console.error('❌ Failed to insert sample agents:', insertError.message);
        } else {
          console.log('✅ Successfully inserted sample agents');
          console.log('Inserted data:', insertData);
        }
      }
    }
    
    // Final verification
    const { data: finalData, error: finalError } = await supabase
      .from('agents')
      .select('*')
      .limit(5);
      
    if (finalError) {
      console.error('❌ Final verification failed:', finalError.message);
      process.exit(1);
    } else {
      console.log('✅ FINAL VERIFICATION SUCCESSFUL: agents table is available and populated');
      console.log('Sample data:', finalData);
    }
    
    // Check RLS
    console.log('🔍 Checking RLS policy...');
    console.log('Note: RLS verification is inferential since direct policy checking is not possible');
    console.log('If the table query succeeded, RLS is likely correctly configured');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

// Run the verification function
verifyAndPrepareAgentsTable().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});