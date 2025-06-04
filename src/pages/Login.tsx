import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom"; 
import { useUserStore } from "../lib/store";
import { Mail, Lock } from "lucide-react";

export default function Login() { 
  const navigate = useNavigate();
  const { setUser, setAuthenticated } = useUserStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          
          const userProfile = {
            id: data.user.id,
            email: data.user.email || '',
            name: profileData?.name || data.user.email?.split('@')[0] || 'User',
            fitnessGoals: profileData?.fitness_goals || [],
            nutritionPreferences: profileData?.nutrition_preferences || [],
            avatar_url: profileData?.avatar_url,
            isAdmin: profileData?.is_admin || false,
            role: profileData?.role || 'user'
          };
        
          setUser(userProfile);
          setAuthenticated(true);
        
          // Redirect based on role
          if (profileData?.role === 'admin' || profileData?.is_admin) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          // Profile will be auto-created by trigger, proceed with basic info
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.email?.split('@')[0] || 'User',
            role: 'user'
          });
          setAuthenticated(true);
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 bg-gray-50">
      <h1 className="text-2xl font-semibold">Welcome back to HiPat</h1>
      
      <form onSubmit={handleSignIn} className="flex flex-col gap-4 w-full max-w-sm bg-white p-6 rounded-lg shadow-sm">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 mt-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}