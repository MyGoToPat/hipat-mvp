import { supabase } from '@/lib/supabaseClient'
export async function seedAgentsIfEmpty() {
  if (!import.meta.env.DEV) return;
  const { count } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true });
  if (count && count > 0) return;

  await supabase.from('agents').insert([{
    id           : crypto.randomUUID(),
    name         : 'Demo Coach',
    role         : 'assistant',
    category     : 'fitness',
    description  : 'Helps with workout planning',
    default_api_model: 'gpt-4o',
    input_types  : ['text'],
    assistant_id : null,
    token_budget : 0
  }]);
}