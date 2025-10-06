import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('campor_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campor_token') || null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);

  // Check if user is a seller (has completed onboarding)
  const isSeller = user?.sellerCompleted || user?.isSeller || user?.seller || false;

  useEffect(() => {
    if (user) localStorage.setItem('campor_user', JSON.stringify(user));
    else localStorage.removeItem('campor_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('campor_token', token);
    else localStorage.removeItem('campor_token');
  }, [token]);

  // Initialize auth state and fetch user profile when needed
  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user) {
        await fetchUserProfile();
      } else {
        // If no token or already have user, stop loading
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      
      // Check if user is already a seller by trying to get seller profile
      try {
        const sellerProfile = await authService.getSellerProfile();
        setUser({ 
          ...userData, 
          sellerCompleted: true, 
          isSeller: true, 
          seller: sellerProfile 
        });
      } catch (sellerError) {
        // User is not a seller yet, this is normal
        setUser(userData);
      }
    } catch (err) {
      // If token is invalid, clear it
      if (err.message.includes('Failed to fetch user profile')) {
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      
      // Check if we have user data
      if (data.user) {
        setUser(data.user);
        setToken(data.token);
      } else if (data.token) {
        // We have a token but no user data, try to fetch user profile again
        setToken(data.token);
        
        try {
          const userData = await authService.getCurrentUser();
          
          // Check if user is already a seller
          try {
            const sellerProfile = await authService.getSellerProfile();
            setUser({ 
              ...userData, 
              sellerCompleted: true, 
              isSeller: true, 
              seller: sellerProfile 
            });
          } catch (sellerError) {
            // User is not a seller yet, this is normal
            setUser(userData);
          }
          

        } catch (profileError) {

          // Still set the token but show a warning
          setError('Login successful but failed to load user profile. Please refresh the page.');
        }
      }
      
      setLoading(false);
      return data;
    } catch (err) {

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
      // For the new seller registration API, sellerData is the response from registerSeller
      // The API now returns a new token with updated role (SELLER)
      if (sellerData.token) {
        setToken(sellerData.token);
      }
      
      // Update user with seller information
      const updatedUser = { 
        ...user, 
        sellerCompleted: true, 
        seller: sellerData.seller, // sellerData.seller contains the seller information
        isSeller: true, // Add explicit seller flag
        role: 'SELLER' // Update the role in user data as well
      };
      setUser(updatedUser);

      return sellerData;
    } catch (err) {
      setError(err.message || 'Failed to complete seller onboarding');
      throw err;
    }
  };

  const updateUserProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      // The API returns both message and user data
      if (response.user) {
        setUser({ ...user, ...response.user });
      } else {
        // Fallback: fetch updated user data if response doesn't include user
        const updatedUser = await authService.getCurrentUser();
        setUser(updatedUser);
      }
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

  const updateSellerData = async (sellerId) => {
    try {
      // Use the correct seller info endpoint
      const sellerInfo = await authService.getSellerInfo(sellerId);
      
      const sellerProfile = {
        id: sellerId,
        slug: sellerInfo.slug,
        catalogueName: sellerInfo.catalogueName,
        storeDescription: sellerInfo.storeDescription,
        catalogueCover: sellerInfo.catalogueCover,
        cataloguePicture: sellerInfo.catalogueCover, // Map to cataloguePicture for backward compatibility
        phoneNumber: sellerInfo.phoneNumber,
        whatsappNumber: sellerInfo.whatsappNumber,
        location: sellerInfo.location,
        bankName: sellerInfo.bankName,
        bankCode: sellerInfo.bankCode,
        accountNumber: sellerInfo.accountNumber,
        accountName: sellerInfo.accountName
      };
      
      // Update the user context with the new seller data
      setUser(prevUser => {
        const updatedUser = {
          ...prevUser,
          seller: sellerProfile
        };
        
        return updatedUser;
      });
      
      return sellerProfile;
    } catch (err) {
      console.error('Failed to update seller data:', err);
      // Don't throw the error, just log it and continue
    }
  };

  const contextValue = { 
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
    updateSellerData,
    fetchUserProfile
  };
  

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined || context === null) {


    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
