import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔵 AuthContext useEffect running...');
    
    // Debug: Check ALL localStorage items
    console.log('🔍 ALL localStorage items:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`  ${key}: ${localStorage.getItem(key)}`);
    }
    
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    console.log('🔍 Auth check:', { 
      token: !!token, 
      tokenExists: !!token,
      isLoggedIn: isLoggedIn,
      bothValid: !!(token && isLoggedIn === 'true')
    });
    
    if (token && isLoggedIn === 'true') {
      console.log('✅ Token found, verifying with backend...');
      // Verify token with backend
      verifyToken(token);
    } else {
      console.log('❌ No valid login found, clearing any partial state');
      // Clean up any partial state
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      console.log('🔐 Verifying token with backend...');
      const response = await apiClient.get('/auth/me');
      console.log('✅ Token valid, user data:', response);
      setUser(response);
      setLoading(false);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      // Token is invalid, clear it
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      setLoading(false);
    }
  };

  // Debug user state changes
  useEffect(() => {
    console.log('👤 User state changed to:', user ? `${user.firstName} ${user.lastName}` : 'null');
  }, [user]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔑 Attempting backend login...', { email });
      
      // Clear any existing state first
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      
      // Call real backend login API
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      console.log('✅ Backend login successful:', response);
      
      // Backend should return { token, user }
      const { token, user: userData } = response;
      
      // Store the real JWT token from backend
      localStorage.setItem('token', token);
      localStorage.setItem('isLoggedIn', 'true');
      
      console.log('✅ Real token stored, localStorage updated');
      console.log('🔍 After login verification:', {
        token: !!localStorage.getItem('token'),
        isLoggedIn: localStorage.getItem('isLoggedIn')
      });
      
      setUser(userData);
      toast.success('Login successful');
      return { user: userData };
      
    } catch (error) {
      console.log('❌ Backend login failed:', error.message);
      
      // Clear any partial state
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      
      // Show user-friendly error
      const message = error.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    setUser(null);
    toast.success('Logged out successfully');
    
    // Debug: Verify cleanup
    console.log('🔍 After logout verification:', {
      token: localStorage.getItem('token'),
      isLoggedIn: localStorage.getItem('isLoggedIn'),
      localStorageLength: localStorage.length
    });
  };

  // Helper functions for role checking
  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    // Add your permission logic here
    return user.role === 'admin';
  };

  const canViewUser = (targetUserId) => {
    if (!user) return false;
    // Admins can view anyone, users can view themselves
    return user.role === 'admin' || user.id === targetUserId;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    hasPermission,
    canViewUser
  };

  console.log('🔄 AuthProvider render, current state:', { 
    user: user ? `${user.firstName} ${user.lastName}` : 'null', 
    loading 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthContext;