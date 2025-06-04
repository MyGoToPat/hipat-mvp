import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUserStore } from '../lib/store';
import { UserCircle, Key, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type AuthView = 'login' | 'signup';

export const Auth = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [autoAuthStatus, setAutoAuthStatus] = useState<{attempted: boolean, success: boolean} | null>(null);

  const { setUser, setAuthenticated } = useUserStore();
  const navigate = useNavigate();

  // Check for auto-authentication on component mount
  useEffect(() => {
    const checkAutoAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session?.user) {
          setAutoAuthStatus({ attempted: true, success: false });
          setAuthenticated(false);
          setUser(null);
          return;
        }

        // Ensure profile exists
        await supabase.from('profiles').upsert({
          id: data.session.user.id,
          email: data.session.user.email,
          role: 'user'
        }, {
          onConflict: 'id'
        });

        // Fetch complete profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          name:
            profileData?.name ||
            data.session.user.email?.split('@')[0] ||
            'User',
          fitnessGoals: profileData?.fitness_goals || [],
          nutritionPreferences: profileData?.nutrition_preferences || [],
          avatar_url: profileData?.avatar_url || undefined,
          isAdmin: profileData?.is_admin || false,
        });
        
        setAuthenticated(true);
        setAutoAuthStatus({ attempted: true, success: true });
        console.log('✅ Authentication successful with existing session');
        
        // Redirect to home if on login page
        navigate('/');
      } catch (error) {
        console.error('Error in auto-authentication:', error);
        setAutoAuthStatus({ attempted: true, success: false });
      }
    };

    checkAutoAuth();
  }, [setAuthenticated, setUser, navigate]);

  const handleViewToggle = () => {
    setView(view === 'login' ? 'signup' : 'login');
    setError(null);
    setMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        console.log('Login successful:', data.user);
        
        // Get user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        const userProfile = {
          id: data.user.id,
          email: data.user.email || '',
          name: profileData?.name || data.user.email?.split('@')[0] || 'User',
          fitnessGoals: profileData?.fitness_goals || [],
          nutritionPreferences: profileData?.nutrition_preferences || [],
          avatar_url: profileData?.avatar_url || undefined,
          isAdmin: profileData?.is_admin || false,
          role: profileData?.role || 'user',
        };
        
        setUser(userProfile);
        setAuthenticated(true);
        
        // Redirect based on role
        if (userProfile.role === 'admin' || userProfile.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      console.error('Login error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        console.log('Signup successful:', data.user);
        
        setMessage('Account created successfully! You can now log in.');
        setView('login');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      console.error('Signup error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show a simple loading state before auto-auth is attempted
  if (autoAuthStatus === null) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
        </div>
        <p className="text-sm text-gray-600">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border-4 border-yellow-500">
      <div className="flex justify-center mb-4">
        <UserCircle className="h-12 w-12 text-black" />
      </div>
      
      <h2 className="text-xl font-semibold text-center mb-4 text-black">
        {view === 'login' ? 'Welcome Back' : 'Create Account'}
      </h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-800 rounded">
          {error}
        </div>
      )}
      
      {message && (
        <div className="mb-4 p-2 bg-green-100 border border-green-300 text-green-800 rounded">
          {message}
        </div>
      )}
      
      <form onSubmit={view === 'login' ? handleLogin : handleSignup}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-black" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-5 w-5 text-black" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder={view === 'signup' ? 'Create a password' : 'Enter your password'}
              required
              minLength={6}
            />
          </div>
          {view === 'signup' && (
            <p className="mt-1 text-xs text-black">Password must be at least 6 characters</p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24">
                <circle className="opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" strokeWidth=\"4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {view === 'login' ? 'Signing In...' : 'Creating Account...'}
            </span>
          ) : (
            <span>{view === 'login' ? 'Sign In' : 'Create Account'}</span>
          )}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={handleViewToggle}
          className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          {view === 'login'
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Sign In'}
        </button>
      </div>

      {/* admin bypass removed – regular login handles role now */}
    </div>
  );
};

export default Auth;