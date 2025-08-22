import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component to redirect signed-in users from landing page to marketplace
export function AuthenticatedRedirect({ children }) {
  const { user } = useAuth();
  
  // If user is signed in, redirect to marketplace
  if (user) {
    return <Navigate to="/marketplace" replace />;
  }
  
  // If not signed in, show the landing page
  return children;
}

// Component to protect routes that require authentication
export function RequireAuth({ children }) {
  const { user } = useAuth();
  
  // If user is not signed in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If signed in, show the protected content
  return children;
}
