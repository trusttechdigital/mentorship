import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

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

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const verifyToken = useCallback(async (token) => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, [verifyToken]);

  const login = useCallback(async (email, password, loginType) => {
    try {
      let response;
      if (loginType === 'admin') {
        response = await api.post('/auth/login', { email, password });
      } else if (loginType === 'staff') {
        response = await api.post('/auth/login/staff', { email, password });
      } else {
        throw new Error('Invalid login type');
      }
      
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Login successful');
      return { user: userData };
      
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  }, []);
  
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success(response.data.message);
    } catch (error) {
      console.error('Password change failed:', error);
      const errorMessage = error.response?.data?.message || 'Password change failed';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }, [user]);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    return user.role === 'admin' || (user.isStaff && permission === 'access_staff_dashboard');
  }, [user]);

  const canViewUser = useCallback((targetUserId) => {
    if (!user) return false;
    return user.role === 'admin' || user.id === targetUserId || (user.isStaff && user.id === targetUserId);
  }, [user]);

  const value = {
    user,
    loading,
    login,
    logout,
    changePassword,
    updateUser,
    hasRole,
    hasPermission,
    canViewUser,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext };