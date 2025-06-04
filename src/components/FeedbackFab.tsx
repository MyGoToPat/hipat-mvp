import React, { useState } from 'react';
import { MessageSquarePlus, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useUserStore } from '../lib/store';
import { FeedbackForm } from './Feedback';

export const FeedbackFab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSubmitSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  return (
    <div className="relative">
      {showSuccess && (
        <div className="absolute bottom-full mb-2 right-0 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-md">
          Thank you for your feedback!
        </div>
      )}
      
      {isOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <FeedbackForm 
            onClose={() => setIsOpen(false)} 
            onSubmitSuccess={handleSubmitSuccess}
          />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-6 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-20"
          title="Make Me Better"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default FeedbackFab;