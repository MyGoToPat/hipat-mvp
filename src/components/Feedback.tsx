import React, { useState } from 'react';
import { Star, ThumbsUp, AlertCircle, MessageSquarePlus, X } from 'lucide-react';
import { supabase } from '../lib/supabase-client';
import { useUserStore } from '../lib/store';

type FeedbackCategory = 'app_experience' | 'suggestions' | 'issues' | 'feature_request';

interface FeedbackFormProps {
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const FeedbackCategoryIcons = {
  app_experience: <ThumbsUp className="w-5 h-5" />,
  suggestions: <MessageSquarePlus className="w-5 h-5" />,
  issues: <AlertCircle className="w-5 h-5" />,
  feature_request: <Star className="w-5 h-5" />,
};

const FeedbackCategoryLabels = {
  app_experience: 'App Experience',
  suggestions: 'Suggestions',
  issues: 'Issues',
  feature_request: 'Feature Request',
};

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onClose, onSubmitSuccess }) => {
  const { user } = useUserStore();
  const [rating, setRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackCategory>('app_experience');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit feedback');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!content.trim()) {
      setError('Please provide feedback details');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error: submitError } = await supabase
        .from('feedback')
        .insert([
          {
            user_id: user.id,
            rating,
            category,
            content,
          }
        ]);
        
      if (submitError) {
        throw new Error(submitError.message);
      }
      
      onSubmitSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Share Your Feedback</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-800 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            How would you rate your experience?
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`p-2 rounded-full transition-colors ${
                  rating >= value 
                    ? 'text-yellow-500' 
                    : 'text-gray-300 hover:text-yellow-500'
                }`}
              >
                <Star className="w-6 h-6" fill={rating >= value ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feedback Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(FeedbackCategoryLabels) as FeedbackCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-2 p-2 border rounded-md transition-colors ${
                  category === cat
                    ? 'bg-primary-100 border-primary-300 text-primary-800'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {FeedbackCategoryIcons[cat]}
                <span>{FeedbackCategoryLabels[cat]}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            Your Feedback
          </label>
          <textarea
            id="feedback"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell us more about your experience, suggestions, or issues..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const FeedbackButton: React.FC = () => {
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
          className="fixed bottom-6 right-6 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-20"
          title="Give Feedback"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};