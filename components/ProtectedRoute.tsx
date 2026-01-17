import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../src/auth/AuthContext';
import PageLoader from './PageLoader';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isConfigured, error } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  // If Supabase is not configured, show error message
  if (!isConfigured) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <AlertCircle size={24} />
            <h2 className="text-xl font-bold">Configuration Missing</h2>
          </div>
          <p className="text-gray-700 mb-4">
            {error || 'Supabase environment variables are not configured. Please contact the administrator.'}
          </p>
          <div className="bg-gray-100 p-4 rounded text-sm text-gray-600 font-mono">
            <p>Missing variables:</p>
            <ul className="mt-2 space-y-1">
              <li>• VITE_SUPABASE_URL</li>
              <li>• VITE_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
