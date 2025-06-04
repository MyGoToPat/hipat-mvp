import React from 'react';
import { useUserStore } from '../lib/store';
import { User, Settings, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase-client';
import { useNavigate } from 'react-router-dom';

export const ProfileSection: React.FC = () => {
  const { user, isAuthenticated, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Don't show anything if not authenticated
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={20} />
            )}
          </div>
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-xs text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="text-gray-700 hover:text-primary-600 transition-colors">
            <Settings size={18} />
          </button>
          <button 
            onClick={handleLogout}
            className="text-gray-700 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      
      {user.fitnessGoals && user.fitnessGoals.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs text-gray-500 uppercase font-medium">Fitness Goals</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {user.fitnessGoals.map((goal, index) => (
              <span 
                key={index}
                className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};