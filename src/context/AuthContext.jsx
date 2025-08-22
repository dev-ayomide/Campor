import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('campor_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campor_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is a seller (has completed onboarding)
  const isSeller = user?.isSeller || false;

  useEffect(() => {
    if (user) localStorage.setItem('campor_user', JSON.stringify(user));
    else localStorage.removeItem('campor_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('campor_token', token);
    else localStorage.removeItem('campor_token');
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setToken(data.token);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
      setLoading(false);
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
      setError(err?.response?.data?.message || err.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const completeSellersOnboarding = (sellerData) => {
    const updatedUser = { ...user, isSeller: true, sellerProfile: sellerData };
    setUser(updatedUser);
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
      completeSellersOnboarding 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
