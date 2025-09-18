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
        console.log('✅ AuthContext: User is already a seller:', sellerProfile);
        setUser({ 
          ...userData, 
          sellerCompleted: true, 
          isSeller: true, 
          seller: sellerProfile 
        });
      } catch (sellerError) {
        // User is not a seller yet, this is normal
        console.log('ℹ️ AuthContext: User is not a seller yet');
        setUser(userData);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
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
          
          // Check if user is already a seller
          try {
            const sellerProfile = await authService.getSellerProfile();
            console.log('✅ AuthContext: User is already a seller:', sellerProfile);
            setUser({ 
              ...userData, 
              sellerCompleted: true, 
              isSeller: true, 
              seller: sellerProfile 
            });
          } catch (sellerError) {
            // User is not a seller yet, this is normal
            console.log('ℹ️ AuthContext: User is not a seller yet');
            setUser(userData);
          }
          
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
      // For the new seller registration API, sellerData is the response from registerSeller
      // Update user with seller information
      const updatedUser = { 
        ...user, 
        sellerCompleted: true, 
        seller: sellerData, // sellerData is the full seller response from the API
        isSeller: true // Add explicit seller flag
      };
      setUser(updatedUser);
      console.log('✅ AuthContext: Seller onboarding completed, user updated:', updatedUser);
      return sellerData;
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

  const updateSellerData = async (sellerId) => {
    try {
      // Since getSellerProfile might not work, let's use getSellerCatalogue
      // which includes seller information and is known to work
      const catalogueData = await authService.getSellerCatalogue(sellerId);
      console.log('✅ AuthContext: Updated seller data from catalogue:', catalogueData);
      
      // Extract seller info from catalogue data - note: catalogueData has { seller: {...}, products: [...] } structure
      const sellerData = catalogueData.seller;
      const sellerProfile = {
        id: sellerId,
        catalogueName: sellerData.catalogueName,
        storeDescription: sellerData.storeDescription,
        cataloguePicture: sellerData.cataloguePicture || sellerData.catalogueCover, // Use catalogueCover as fallback
        phoneNumber: sellerData.phoneNumber,
        whatsappNumber: sellerData.whatsappNumber,
        location: sellerData.location,
        bankName: sellerData.bankName,
        bankCode: sellerData.bankCode,
        accountNumber: sellerData.accountNumber,
        accountName: sellerData.accountName
      };
      
      // Update the user context with the new seller data
      setUser(prevUser => {
        const updatedUser = {
          ...prevUser,
          seller: sellerProfile
        };
        console.log('🔄 AuthContext: Updating user context with new seller data:', sellerProfile.catalogueName);
        return updatedUser;
      });
      
      return sellerProfile;
    } catch (err) {
      console.error('❌ AuthContext: Failed to update seller data:', err);
      // Don't throw the error, just log it and continue
      console.log('ℹ️ AuthContext: Continuing without updating seller data');
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
    console.error('❌ useAuth: Context is null/undefined. Make sure component is wrapped in AuthProvider.');
    console.error('❌ useAuth: Check provider hierarchy in main.jsx and App.jsx');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
