import React, { useState } from 'react';
import { FeedbackAnalytics } from './Analytics/FeedbackAnalytics';
import { BarChart3, Users, MessageSquare, Settings, Bot, KeyRound, Home } from 'lucide-react';
import { useUserStore } from '../lib/store';
import AgentManagement from './Admin/AgentManagement';
import APILibraryManagement from './Admin/APILibraryManagement';
import { Link } from 'react-router-dom';

type AdminTab = 'analytics' | 'users' | 'support' | 'settings' | 'agents' | 'api-libraries';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const { user } = useUserStore();
  
  // In a real app, you would check if the user has admin privileges
  // This is just a simple check for demo purposes
  const isAdmin = user?.email?.includes('admin') || user?.isAdmin || true; // For demo, everyone is admin
  
  if (!isAdmin) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-medium mb-4">Admin Panel</h2>
        <p className="text-gray-500">You don't have permission to access this section.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200">
        <h2 className="text-xl font-medium p-4">Admin Panel</h2>
        <div className="flex px-4 overflow-x-auto">
          <Link
            to="/"
            className="flex items-center px-4 py-2 border-transparent border-b-2 text-gray-500 hover:text-gray-700"
          >
            <Home className="w-5 h-5 mr-2" />
            <span>Chat</span>
          </Link>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center px-4 py-2 border-b-2 ${
              activeTab === 'analytics'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`flex items-center px-4 py-2 border-b-2 ${
              activeTab === 'agents'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bot className="w-5 h-5 mr-2" />
            <span>Agents</span>
          </button>
          <button
            onClick={() => setActiveTab('api-libraries')}
            className={`flex items-center px-4 py-2 border-b-2 ${
              activeTab === 'api-libraries'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <KeyRound className="w-5 h-5 mr-2" />
            <span>API Libraries</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-4 py-2 border-b-2 ${
              activeTab === 'users'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center px-4 py-2 border-b-2 ${
              activeTab === 'support'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            <span>Support</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center px-4 py-2 border-b-2 ${
              activeTab === 'settings'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-5 h-5 mr-2" />
            <span>Settings</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'analytics' && <FeedbackAnalytics />}
        
        {activeTab === 'api-libraries' && <APILibraryManagement />}
        
        {activeTab === 'agents' && <AgentManagement />}
        
        {activeTab === 'users' && (
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">User Management</h3>
            <p className="text-gray-500">User management interface will be implemented here.</p>
          </div>
        )}
        
        {activeTab === 'support' && (
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Support Tickets</h3>
            <p className="text-gray-500">Support ticket management will be implemented here.</p>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">Admin Settings</h3>
            <p className="text-gray-500">Admin settings will be implemented here.</p>
          </div>
        )}
      </div>
    </div>
  );
};