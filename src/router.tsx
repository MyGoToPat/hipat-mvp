import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import App from './App';
import { AdminPanel } from './components/Admin/AdminPanel';
import { FeedbackButton } from './components/Feedback';
import Home from './pages/Home';
import FeedbackFab from './components/FeedbackFab';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { useUserStore } from './lib/store';
import { Navigate } from 'react-router-dom';
import ChatSkeleton from './components/ChatSkeleton';
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings"; 

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useUserStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Main application router
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App>
          <Home />
        </App>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <AdminPanel />
          <FeedbackFab />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Profile />
          <FeedbackFab />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <MainLayout>
        <Login />
      </MainLayout>
    )
  }, 
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <App>
          <Dashboard />
        </App>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Settings />
          <FeedbackFab />
        </MainLayout>
      </ProtectedRoute>
    ),
  },

  /* fallback – any unknown path */
  {
    path: '*',
    element: (
      <MainLayout>
        <Navigate to="/" replace />
      </MainLayout>
    )
  }
]);