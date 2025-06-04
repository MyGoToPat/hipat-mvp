import { supabase } from './supabaseClient';

/**
 * Routes a user message through the Manager agent
 * @param userText The user's message text
 * @returns Promise resolving to the agent's response
 */
export async function routeMessage(userText: string): Promise<string> {
  try {
    // 1. Look up the Manager agent
    const { data: managerAgent, error: managerError } = await supabase
      .from('agents')
      .select('*')
      .eq('role', 'Manager')
      .single();
      
    if (managerError) {
      console.error('Error fetching Manager agent:', managerError);
      return "Sorry, I couldn't find the Manager agent to process your request.";
    }
    
    // 2. For now, simulate a response (stub implementation)
    // In a real implementation, we would call OpenAI here with the manager's prompt
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate a contextual response based on the user's text
    let response = `I processed your message: "${userText}"`;
    
    if (userText.toLowerCase().includes('hello') || userText.toLowerCase().includes('hi')) {
      response = "Hello! I'm Pat, your personal assistant. How can I help you today?";
    } else if (userText.toLowerCase().includes('help')) {
      response = "I'm here to help! You can ask me about fitness, nutrition, or general questions.";
    } else if (userText.toLowerCase().includes('fitness') || userText.toLowerCase().includes('workout')) {
      response = "For fitness questions, I can suggest workout routines, track your progress, or provide exercise tips.";
    } else if (userText.toLowerCase().includes('food') || userText.toLowerCase().includes('nutrition')) {
      response = "Regarding nutrition, I can help with meal plans, calorie tracking, or dietary recommendations.";
    } else {
      response = "I understand you're asking about: " + userText + ". I'm still learning but I'll do my best to help!";
    }
    
    return response;
  } catch (error) {
    console.error('Error in routeMessage:', error);
    return "Sorry, something went wrong while processing your message. Please try again.";
  }
}