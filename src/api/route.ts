import { Request, Response } from 'express';
import { routeMessage } from '../lib/agent-route';

/**
 * Express handler for routing user messages to agents
 * @param req Express request object
 * @param res Express response object
 */
export async function routeHandler(req: Request, res: Response) {
  try {
    const { user_text } = req.body;
    
    if (!user_text || typeof user_text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid user_text parameter' });
    }
    
    const response = await routeMessage(user_text);
    
    return res.status(200).json({ response });
  } catch (error) {
    console.error('Error in route handler:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Mock implementation for frontend development
 * This allows direct calling from the frontend
 */
export async function mockRouteHandler(userText: string): Promise<string> {
  try {
    return await routeMessage(userText);
  } catch (error) {
    console.error('Error in mock route handler:', error);
    return "Sorry, something went wrong while processing your message. Please try again.";
  }
}