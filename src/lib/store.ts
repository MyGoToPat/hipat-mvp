import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  fitnessGoals?: string[];
  nutritionPreferences?: string[];
  avatar_url?: string;
  isAdmin?: boolean;
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  userId: string | null;
  setUser: (user: UserProfile | null) => void;
  setAuthenticated: (value: boolean) => void;
  setUserId: (id: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      userId: null,
      setUser: (user) => set({ user, userId: user?.id || null }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setUserId: (id) => set({ userId: id }),
      logout: () => set({ user: null, isAuthenticated: false, userId: null }),
    }),
    {
      name: 'hipat-user-storage',
    }
  )
);

interface ChatState {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  isLoading: boolean;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          role,
          content,
          timestamp: Date.now(),
        },
      ],
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [] }),
}));