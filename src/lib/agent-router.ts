import { supabase } from './supabase-client';

/**
 * Routes a message to the appropriate agent based on the agent role
 * @param agentRole The role of the agent to route the message to
 * @param message The message to route
 * @param inputType The type of input (text, voice, photo)
 * @returns A promise that resolves to the agent's response
 */
export async function routeMessageToAgent(
  agentRole: string, 
  message: string,
  inputType: 'text' | 'voice' | 'photo' = 'text'
): Promise<string> {
  try {
    // Fetch agent details from Supabase
    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('role', agentRole)
      .single();
    
    if (error) {
      console.error('Error fetching agent:', error);
      // Fallback to default behavior if agent not found
      return await callOpenAI(message, 'Primary', inputType);
    }
    
    // If agent exists, check if it supports the input type
    if (agent) {
      console.log(`Routing message to agent: ${agent.name} (${agent.role})`);
      
      // Check if the agent supports this input type
      if (agent.input_types && !agent.input_types.includes(inputType)) {
        return `Sorry, the ${agent.name} agent doesn't support ${inputType} input. Please try using text instead.`;
      }
      
      // Check if the agent has the required API models linked
      if (agent.linked_api_models && agent.linked_api_models.length > 0) {
        // Use the default API model if specified, otherwise use the first linked model
        const apiModelToUse = agent.default_api_model || agent.linked_api_models[0];
        console.log(`Using API model: ${apiModelToUse}`);
      }
      
      return await callOpenAI(message, agent.role, inputType, agent.prompt);
    } else {
      // Fallback to default behavior
      return await callOpenAI(message, 'Primary', inputType);
    }
  } catch (error) {
    console.error('Error in agent routing:', error);
    return `Sorry, I encountered an error while processing your message. Please try again.`;
  }
}

/**
 * Mock function to simulate calling OpenAI API
 * @param message The message to send to OpenAI
 * @param role The role context for the message
 * @param inputType The type of input (text, voice, photo)
 * @param prompt Optional custom prompt for the agent
 * @returns A promise that resolves to the OpenAI response
 */
async function callOpenAI(
  message: string, 
  role: string = 'Primary',
  inputType: 'text' | 'voice' | 'photo' = 'text',
  prompt?: string
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // If there's a custom prompt, use it to influence the response
  if (prompt) {
    console.log(`Using custom prompt: "${prompt.substring(0, 30)}..."`);
  }
  
  // Handle different input types
  let inputContext = '';
  switch (inputType) {
    case 'voice':
      inputContext = '[Voice Transcription] ';
      break;
    case 'photo':
      inputContext = '[Photo Analysis] ';
      break;
    default:
      inputContext = '';
  }
  
  // Generate contextual responses based on the role
  switch (role) {
    case 'Primary':
      return `${inputContext}I'm your primary agent. Based on what you mentioned about "${message}", I can provide detailed assistance.`;
    
    case 'Support':
      return `${inputContext}As a support agent, I'm here to assist with your query: "${message}". I'll help provide additional context and information.`;
    
    case 'Coordinator':
      return `${inputContext}I'm coordinating the best response to your query: "${message}". Let me organize the right information for you.`;
    
    default:
      return `${inputContext}I'm your personal assistant. Regarding "${message}", I can provide general guidance.`;
  }
}