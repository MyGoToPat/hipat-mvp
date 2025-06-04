import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase-client';
import { BarChart3, ThumbsUp, AlertCircle, MessageSquarePlus, Star, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const isDev = import.meta.env.DEV;

interface FeedbackSummary {
  averageRating: number;
  totalFeedback: number;
  categoryCounts: Record<string, number>;
  ratingDistribution: Record<string, number>;
  recentFeedback: Array<{
    id: string;
    rating: number;
    category: string;
    content: string;
    created_at: string;
  }>;
}

export const FeedbackAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const categoryIcons = {
    app_experience: <ThumbsUp className="w-5 h-5" />,
    suggestions: <MessageSquarePlus className="w-5 h-5" />,
    issues: <AlertCircle className="w-5 h-5" />,
    feature_request: <Star className="w-5 h-5" />,
  };
  
  const categoryLabels = {
    app_experience: 'App Experience',
    suggestions: 'Suggestions',
    issues: 'Issues',
    feature_request: 'Feature Request',
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      /* ───────── DEV short-circuit ───────── */
      const { data: s } = await supabase.auth.getSession();
      if (isDev && !s.session) {
        setSummary(null);          // "No feedback yet"
        setIsLoading(false);
        return;
      }

      /* ───────── Real fetch ───────── */
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('id')
          .limit(1);

        if (cancelled) return;
        if (error) throw error;
        setSummary(data?.length ? data[0] : null);
      } catch (err) {
        toast.error(`Feedback fetch failed: ${(err as Error).message}`);
        setSummary(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);
  
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-medium">Feedback Analytics</h2>
        </div>
        <div className="flex justify-center mt-8 mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-medium">Feedback Analytics</h2>
        </div>
        <div className="bg-red-100 p-4 rounded-lg text-red-800">
          <p className="font-medium">Error loading analytics</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!summary) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-medium">Feedback Analytics</h2>
        </div>
        <div className="flex justify-center p-8">
          <p className="text-gray-500">No feedback data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="w-6 h-6 text-primary-600" />
        <h2 className="text-xl font-medium">Feedback Analytics</h2>
      </div>
      
      {summary.totalFeedback === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No feedback has been collected yet.</p>
          <p>User feedback will appear here once submitted.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Average Rating */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Average Rating</h3>
              <div className="flex items-end">
                <span className="text-2xl font-bold">{summary.averageRating}</span>
                <div className="flex ml-2 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className="w-5 h-5"
                      fill={summary.averageRating >= rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">From {summary.totalFeedback} responses</p>
            </div>
            
            {/* Feedback Categories */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Feedback By Category</h3>
              <div className="space-y-2">
                {Object.entries(summary.categoryCounts).length > 0 ? (
                  Object.entries(summary.categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="text-primary-600 mr-2">
                            {category in categoryIcons 
                              ? categoryIcons[category as keyof typeof categoryIcons]
                              : <MessageSquarePlus className="w-5 h-5" />
                            }
                          </div>
                          <span>
                            {category in categoryLabels 
                              ? categoryLabels[category as keyof typeof categoryLabels]
                              : category
                            }
                          </span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500">No category data available</p>
                )}
              </div>
            </div>
            
            {/* Rating Distribution */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Rating Distribution</h3>
              <div className="space-y-2">
                {Object.keys(summary.ratingDistribution).length > 0 ? (
                  [5, 4, 3, 2, 1].map((rating) => {
                    const count = summary.ratingDistribution[rating.toString()] || 0;
                    const percentage = summary.totalFeedback > 0 
                      ? Math.round((count / summary.totalFeedback) * 100) 
                      : 0;
                      
                    return (
                      <div key={rating} className="flex items-center">
                        <div className="flex items-center w-10">
                          <span className="mr-1">{rating}</span>
                          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                        </div>
                        <div className="flex-1 mx-2">
                          <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary-600 h-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-10 text-right text-sm text-gray-500">
                          {count}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No rating data available</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Recent Feedback */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Feedback</h3>
            {summary.recentFeedback.length > 0 ? (
              <div className="space-y-4">
                {summary.recentFeedback.map((feedback) => (
                  <div key={feedback.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="text-primary-600 mr-2">
                          {feedback.category in categoryIcons 
                            ? categoryIcons[feedback.category as keyof typeof categoryIcons]
                            : <MessageSquarePlus className="w-5 h-5" />
                          }
                        </div>
                        <span className="font-medium">
                          {feedback.category in categoryLabels 
                            ? categoryLabels[feedback.category as keyof typeof categoryLabels]
                            : feedback.category
                          }
                        </span>
                      </div>
                      <div className="flex text-yellow-500">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            className="w-4 h-4"
                            fill={feedback.rating >= rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{feedback.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 p-4 bg-gray-50 rounded-lg">No feedback entries yet</p>
            )}
          </div>
        </>
      )}
      
      <div className="flex justify-center mt-6 border-t pt-6">
        <div className="flex items-center text-primary-600">
          <TrendingUp className="w-5 h-5 mr-2" />
          <p>Analytics updated in real-time</p>
        </div>
      </div>
    </div>
  );
};