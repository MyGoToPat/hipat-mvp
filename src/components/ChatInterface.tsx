import React, { useState, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { Send, Loader2, RefreshCw, X } from 'lucide-react';
import { chatMachine } from '../machines/chatMachine';
import { supabase } from '../lib/supabase-client';
import { useUserStore } from '../lib/store';
import { mockRouteHandler } from '../api/route';
import FeedbackFab from './FeedbackFab';

export const ChatInterface: React.FC = () => {
  const [state, send] = useMachine(chatMachine);
  const [input, setInput] = useState('');
  const { user } = useUserStore();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [selectedAgentRole, setSelectedAgentRole] = useState<string>('AskMeAnything');
  const [availableAgents, setAvailableAgents] = useState<Array<{id: string, name: string, role: string}>>([]);

  // Fetch available agents on component mount
  useEffect(() => {
    async function fetchAgents() {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('id, name, role')
          .order('name');
          
        if (error) {
          console.error('Error fetching agents:', error);
        } else {
          setAvailableAgents(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      }
    }
    
    fetchAgents();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.context.messages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');

    // Send user message to state machine
    send({ type: 'SEND_MESSAGE', content: userMessage });
    
    try {
      // Save message to database if user is authenticated
      if (user) {
        const { error } = await supabase
          .from('messages')
          .insert([
            {
              user_id: user.id,
              content: userMessage,
              role: 'user',
              session_id: localStorage.getItem('chat_session_id') || generateSessionId()
            }
          ]);
          
        if (error) {
          console.error('Error saving message:', error);
        }
      }
      
      // Call the route handler with the user's message
      const response = await mockRouteHandler(userMessage);
      
      // Save assistant response to database if user is authenticated
      if (user) {
        supabase
          .from('messages')
          .insert([
            {
              user_id: user.id,
              content: response,
              role: 'assistant',
              session_id: localStorage.getItem('chat_session_id') || generateSessionId()
            }
          ])
          .then(({ error }) => {
            if (error) console.error('Error saving response:', error);
          });
      }
      
      // Send assistant response to state machine
      send({
        type: 'RECEIVE_MESSAGE',
        content: response
      });
    } catch (error) {
      console.error('Error processing message:', error);
      send({
        type: 'ERROR',
        error: 'Failed to process your message. Please try again.'
      });
    }
  };
  
  // Generate a unique session ID for grouping messages
  const generateSessionId = (): string => {
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    localStorage.setItem('chat_session_id', sessionId);
    return sessionId;
  };
  
  // Clear all messages
  const handleClearChat = () => {
    send({ type: 'CLEAR_MESSAGES' });
  };

  // Handle agent selection change
  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAgentRole(e.target.value);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">Chat with HiPat</h2>
        <div className="flex gap-2 items-center">
          {availableAgents.length > 0 && (
            <select
              value={selectedAgentRole}
              onChange={handleAgentChange}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="AskMeAnything">General Assistant</option>
              {availableAgents.map(agent => (
                <option key={agent.id} value={agent.role}>
                  {agent.name}
                </option>
              ))}
            </select>
          )}
          <button 
            onClick={handleClearChat}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Clear chat"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message when no messages */}
        {state.context.messages.length === 0 && (
          <div className="text-center text-gray-500 my-8">
            <h3 className="text-lg font-medium">Welcome to HiPat</h3>
            <p className="text-sm mt-2">Your personal fitness and nutrition assistant</p>
            <p className="text-sm mt-4">Try asking about:</p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {['Workout plans', 'Nutrition advice', 'Fitness tracking', 'Meal suggestions'].map((suggestion) => (
                <button 
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Display messages */}
        {state.context.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {/* Error message */}
        {state.context.error && (
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg flex items-center">
              <X className="w-4 h-4 mr-2" />
              <span>{state.context.error}</span>
            </div>
          </div>
        )}
        
        {/* "Thinking" indicator */}
        {state.context.isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-2 flex items-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        
        {/* Invisible div for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-4 flex items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask HiPat anything..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={state.context.isProcessing}
        />
        <button
          type="submit"
          className={`p-2 rounded-r-lg transition-colors ${
            state.context.isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
          disabled={state.context.isProcessing || !input.trim()}
        >
          {state.context.isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
      
      {/* Feedback button */}
      <FeedbackFab />
    </div>
  );
};