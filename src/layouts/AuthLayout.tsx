import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthLayout: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect to dashboard if user is logged in
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 flex items-center justify-center">
              <span className="text-4xl mr-3">🚀</span> 1percentrise
            </h1>
            <p className="text-gray-600 mt-2">Track your habits, achieve your goals</p>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;