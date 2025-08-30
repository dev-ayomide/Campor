import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('campor_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campor_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is a seller (has completed onboarding)
  const isSeller = user?.sellerCompleted || false;

  useEffect(() => {
    if (user) localStorage.setItem('campor_user', JSON.stringify(user));
    else localStorage.removeItem('campor_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('campor_token', token);
    else localStorage.removeItem('campor_token');
  }, [token]);

  // Fetch user profile when token changes
  useEffect(() => {
    if (token && !user) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      // If token is invalid, clear it
      if (err.message.includes('Failed to fetch user profile')) {
        setToken(null);
        setUser(null);
      }
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 AuthContext: Starting login process');
      const data = await authService.login(email, password);
      console.log('🔍 AuthContext: Login successful, setting user and token');
      console.log('🔍 AuthContext: Full response data:', data);
      console.log('🔍 AuthContext: User data:', data.user);
      console.log('🔍 AuthContext: Token:', data.token);
      console.log('🔍 AuthContext: Data type:', typeof data);
      console.log('🔍 AuthContext: Data keys:', Object.keys(data || {}));
      
      // Check if we have user data
      if (data.user) {
        setUser(data.user);
        setToken(data.token);
        console.log('🔍 AuthContext: User and token set successfully');
      } else if (data.token) {
        // We have a token but no user data, try to fetch user profile again
        console.log('🔍 AuthContext: Token received but no user data, attempting to fetch profile');
        setToken(data.token);
        
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          console.log('🔍 AuthContext: User profile fetched on second attempt');
        } catch (profileError) {
          console.error('❌ AuthContext: Failed to fetch user profile on second attempt:', profileError);
          // Still set the token but show a warning
          setError('Login successful but failed to load user profile. Please refresh the page.');
        }
      }
      
      setLoading(false);
      return data;
    } catch (err) {
      console.error('❌ AuthContext: Login error:', err);
      setError(err.message || 'Login failed');
      setLoading(false);
      
      // If email is not verified, redirect to verification
      if (err.message.includes('Email not verified')) {
        // Store email for verification
        localStorage.setItem('campor_verification_email', email);
        // Redirect to verification page
        window.location.href = '/verify';
        return;
      }
      
      throw err;
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(payload);
      setUser(data.user);
      setToken(data.token);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const completeSellersOnboarding = async (sellerData) => {
    try {
      const response = await authService.completeSellerOnboarding(sellerData);
      // Update user with seller information
      const updatedUser = { 
        ...user, 
        sellerCompleted: true, 
        seller: response.seller || sellerData 
      };
      setUser(updatedUser);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to complete seller onboarding');
      throw err;
    }
  };

  const updateUserProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      setUser({ ...user, ...response.user });
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const refreshUserProfile = async () => {
    if (token) {
      await fetchUserProfile();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      error, 
      login, 
      register, 
      logout, 
      isSeller,
      completeSellersOnboarding,
      updateUserProfile,
      refreshUserProfile,
      fetchUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
