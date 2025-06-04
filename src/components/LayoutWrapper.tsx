import React, { ReactNode, useState } from 'react';
import { Brain, BarChart3, MessagesSquare, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SidebarDrawer from './SidebarDrawer';
import { ProfileSection } from './ProfileSection';
import { useUserStore } from '../lib/store';

interface LayoutWrapperProps {
  children: ReactNode;
  activeView?: 'chat' | 'analytics';
  onViewChange?: (view: 'chat' | 'analytics') => void;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ 
  children,
  activeView = 'chat',
  onViewChange
}) => {
  const navigate = useNavigate();
  const [view, setView] = useState(activeView);
  const { isAuthenticated } = useUserStore();

  const handleViewChange = (newView: 'chat' | 'analytics') => {
    setView(newView);
    if (onViewChange) onViewChange(newView);
    
    if (newView === 'analytics') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="text-primary-600 h-7 w-7" />
            <h1 className="text-xl font-semibold text-gray-900">HiPat</h1>
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button
          onClick={() => setView(view === 'chat' ? 'analytics' : 'chat')}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
        >
          <MessagesSquare size={24} />
        </button>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden grid grid-cols-12">
        {/* Sidebar Drawer */}
        <SidebarDrawer open={view === 'analytics'} onClose={() => setView('chat')} />
        
        {/* Main Content Area */}
        <div className="col-span-12 md:col-span-9 h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};