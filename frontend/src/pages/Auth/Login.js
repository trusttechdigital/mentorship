import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Users, UserCog } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../../services/api'; // Corrected import

const Login = () => {
  const [formData, setFormData] = useState({
    email: process.env.NODE_ENV === 'development' ? 'admin@mentorship.com' : '',
    password: process.env.NODE_ENV === 'development' ? 'admin123' : ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'staff'
  
  const { user, loading: authLoading, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loginType === 'staff') {
      setFormData({ email: '', password: '' });
    } else {
      setFormData({
        email: process.env.NODE_ENV === 'development' ? 'admin@mentorship.com' : '',
        password: process.env.NODE_ENV === 'development' ? 'admin123' : ''
      });
    }
  }, [loginType]);

  // If user is already logged in, redirect to dashboard
  if (user && !authLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      if (loginType === 'admin') {
        response = await api.post('/auth/login', formData); // Corrected usage
      } else {
        response = await api.post('/auth/login/staff', formData); // Corrected usage
      }
      
      const { token, user: loggedInUser } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser); // Update user in AuthContext
      toast.success('Login successful!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      // Log the full error object for debugging
      console.log('Full login error object:', JSON.stringify(error, null, 2));
      const errorMessage = error.response?.data?.message || error.message || 'Failed to login. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-full">
            {loginType === 'admin' ? (
              <Users className="w-8 h-8 text-white" />
            ) : (
              <UserCog className="w-8 h-8 text-white" />
            )}
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Mentorship Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {loginType === 'admin' ? 'Administrator Access' : 'Staff Access'}
        </p>

        <div className="mt-4 flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors duration-200
              ${loginType === 'admin' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Admin Login
          </button>
          <button
            type="button"
            onClick={() => setLoginType('staff')}
            className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors duration-200
              ${loginType === 'staff' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Staff Login
          </button>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? <LoadingSpinner size="small" /> : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Only show default credentials in development for admin */}
          {process.env.NODE_ENV === 'development' && loginType === 'admin' && (
            <div className="mt-6 border-t pt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Development Credentials (Admin):</h3>
                <div className="text-sm text-gray-600">
                  <p><strong>Email:</strong> admin@mentorship.com</p>
                  <p><strong>Password:</strong> admin123</p>
                </div>
              </div>
            </div>
          )}
           {/* Only show default credentials in development for staff (if applicable) */}
           {process.env.NODE_ENV === 'development' && loginType === 'staff' && (
            <div className="mt-6 border-t pt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Development Credentials (Staff):</h3>
                <div className="text-sm text-gray-600">
                  <p><strong>Email:</strong> staff@mentorship.com</p>
                  <p><strong>Password:</strong> staff123</p>
                </div>
              </div>
            </div>
          )}

          {/* Debug info only in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
              <p><strong>Debug:</strong> Auth Loading: {authLoading ? 'Yes' : 'No'}, User: {user ? 'Logged In' : 'Not Logged In'}</p>
              <p><strong>Backend:</strong> {process.env.REACT_APP_API_URL}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;