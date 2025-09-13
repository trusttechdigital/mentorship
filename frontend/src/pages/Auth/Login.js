import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Users } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: process.env.NODE_ENV === 'development' ? 'admin@mentorship.com' : '',
    password: process.env.NODE_ENV === 'development' ? 'admin123' : ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  console.log('🔐 Login component render:', { 
    user: user ? `${user.firstName} ${user.lastName}` : 'null',
    authLoading,
    isLoading,
    environment: process.env.NODE_ENV
  });

  useEffect(() => {
    console.log('🔐 Login useEffect - user changed:', user ? `${user.firstName} ${user.lastName}` : 'null');
  }, [user]);

  // If user is already logged in, redirect to dashboard
  if (user && !authLoading) {
    console.log('🔐 Login: User already logged in, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while auth is still loading
  if (authLoading) {
    console.log('🔐 Login: Auth still loading, showing spinner');
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
    console.log('🔐 Login form submitted with:', { 
      email: formData.email,
      environment: process.env.NODE_ENV 
    });

    try {
      console.log('🔐 Calling real backend login function...');
      await login(formData.email, formData.password);
      console.log('🔐 Backend login successful, attempting navigation...');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.log('🔐 Login error:', error.message);
      // Error is handled in the login function
    } finally {
      setIsLoading(false);
    }
  };

  console.log('🔐 Login: Rendering login form');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-full">
            <Users className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Mentorship Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Administrator Access
        </p>
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

          {/* Only show default credentials in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 border-t pt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Development Credentials:</h3>
                <div className="text-sm text-gray-600">
                  <p><strong>Email:</strong> admin@mentorship.com</p>
                  <p><strong>Password:</strong> admin123</p>
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