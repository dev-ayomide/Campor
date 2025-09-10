import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component to redirect signed-in users from landing page to marketplace
export function AuthenticatedRedirect({ children }) {
  const { user, loading } = useAuth();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // If user is signed in, redirect to marketplace
  if (user) {
    return <Navigate to="/marketplace" replace />;
  }
  
  // If not signed in, show the landing page
  return children;
}

// Component to protect routes that require authentication
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // If user is not signed in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If signed in, show the protected content
  return children;
}
