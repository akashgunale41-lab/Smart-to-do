import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Protects routes that only admins can access
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // Wait for auth to resolve

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-2xl mb-2">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Access Denied</h1>
          <p className="text-slate-500 text-sm max-w-xs">
            You do not have permission to view this page. This area is for administrators only.
          </p>
          <a
            href="/dashboard"
            className="inline-block mt-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-all"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
