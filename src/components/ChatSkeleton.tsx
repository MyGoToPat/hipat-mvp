import { useEffect, useState } from 'react';
import { mockRouteHandler } from '@/api/route';
import { useUserStore } from '@/lib/store';
import FeedbackFab from './FeedbackFab';

const promptChips = [
  'Hi Pat!',
  'How\'s my week?',
  'Give me a healthy dinner idea',
  'Calories left today?',
  'Tell me a joke',
];

export default function ChatSkeleton() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function send() {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage = input.trim();
    setMessages([...messages, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Call our API route handler
      const response = await mockRouteHandler(userMessage);
      
      // Add response to messages
      setMessages(prev => [...prev, { role: 'pat', text: response }]);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, { 
        role: 'pat', 
        text: 'Sorry, I encountered an error processing your message. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`max-w-[75%] px-3 py-2 rounded-lg ${
                m.role === 'user'
                  ? 'bg-primary-600 text-white self-end'
                  : 'bg-gray-100'
              }`}
            >
              {m.text}
            </div>
          ))}
          
          {isLoading && (
            <div className="max-w-[75%] px-3 py-2 rounded-lg bg-gray-100">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          
          {messages.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-700">Welcome to HiPat</h3>
                <p className="text-sm text-gray-500 mt-2">Your personal health assistant</p>
              </div>
            </div>
          )}
        </div>

        {/* prompt chips */}
        <div className="flex gap-2 px-4 py-2 border-t overflow-x-auto">
          {promptChips.map((p) => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className="text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 whitespace-nowrap"
            >
              {p}
            </button>
          ))}
        </div>

        {/* input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2 px-4 py-3 border-t"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Ask HiPat anything…"
            disabled={isLoading}
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            disabled={!input.trim() || isLoading}
          >
            Send
          </button>
        </form>
      </div>

      {/* right column – Pat avatar placeholder */}
      <div className="hidden lg:flex w-64 items-center justify-center border-l">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl text-gray-400">👤</span>
          </div>
          <p className="text-sm text-gray-500">Pat is listening…</p>
        </div>
      </div>
      
      {/* Feedback button */}
      <FeedbackFab />
    </div>
  );
}
  )
}