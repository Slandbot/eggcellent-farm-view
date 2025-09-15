import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';

const AuthErrorHandler: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for authentication errors
    const handleAuthError = (event: CustomEvent) => {
      setShowError(true);
    };

    // Create a custom event listener for auth errors
    window.addEventListener('auth-error' as any, handleAuthError);

    return () => {
      window.removeEventListener('auth-error' as any, handleAuthError);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear any stored tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth');
      
      // Redirect to login
      navigate('/login');
      setShowError(false);
    }
  };

  if (!showError) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h2>
        <p className="mb-4">
          Your session has expired or is invalid. Please log in again to continue.
        </p>
        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Log In Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorHandler;