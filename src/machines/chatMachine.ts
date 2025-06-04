import { createMachine, assign } from 'xstate';

// Define message interface
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// Define chat context interface
interface ChatContext {
  messages: Message[];
  isProcessing: boolean;
  error: string | null;
}

// Define chat events
type ChatEvent =
  | { type: 'SEND_MESSAGE'; content: string }
  | { type: 'RECEIVE_MESSAGE'; content: string }
  | { type: 'ERROR'; error: string }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'START' }
  | { type: 'STOP' };

// Generate a unique ID for messages
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const chatMachine = createMachine({
  id: 'chat',
  initial: 'idle',
  context: {
    messages: [],
    isProcessing: false,
    error: null
  } as ChatContext,
  states: {
    idle: {
      on: {
        START: 'active',
        SEND_MESSAGE: {
          target: 'processing',
          actions: 'addUserMessage'
        }
      }
    },
    active: {
      on: {
        SEND_MESSAGE: {
          target: 'processing',
          actions: 'addUserMessage'
        },
        STOP: 'idle',
        ERROR: {
          target: 'error',
          actions: 'setError'
        },
        CLEAR_MESSAGES: {
          actions: 'clearMessages',
          target: 'idle'
        }
      }
    },
    processing: {
      entry: 'setProcessing',
      on: {
        RECEIVE_MESSAGE: {
          target: 'active',
          actions: ['addAssistantMessage', 'clearProcessing']
        },
        ERROR: {
          target: 'error',
          actions: ['setError', 'clearProcessing']
        }
      }
    },
    error: {
      on: {
        SEND_MESSAGE: {
          target: 'processing',
          actions: ['clearError', 'addUserMessage']
        },
        CLEAR_MESSAGES: {
          actions: ['clearMessages', 'clearError'],
          target: 'idle'
        }
      }
    }
  }
}, {
  actions: {
    addUserMessage: assign({
      messages: (context, event) => {
        if (event.type !== 'SEND_MESSAGE') return context.messages;
        
        return [...context.messages, {
          id: generateId(),
          role: 'user',
          content: event.content,
          timestamp: Date.now()
        }];
      }
    }),
    addAssistantMessage: assign({
      messages: (context, event) => {
        if (event.type !== 'RECEIVE_MESSAGE') return context.messages;
        
        return [...context.messages, {
          id: generateId(),
          role: 'assistant',
          content: event.content,
          timestamp: Date.now()
        }];
      }
    }),
    setProcessing: assign({
      isProcessing: (_) => true
    }),
    clearProcessing: assign({
      isProcessing: (_) => false
    }),
    setError: assign({
      error: (_, event) => {
        if (event.type !== 'ERROR') return null;
        return event.error;
      }
    }),
    clearError: assign({
      error: (_) => null
    }),
    clearMessages: assign({
      messages: (_) => []
    })
  }
});