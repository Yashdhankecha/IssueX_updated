import React, { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = memo(({ children, adminOnly = false, userOnly = false, govOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <motion.div
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access if required
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <motion.div
           className="text-center"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <div className="card p-8 max-w-md mx-auto">
            <div className="text-danger-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h2>
            <p className="text-secondary-600 mb-6">Restricted to Admin only.</p>
            <button onClick={() => window.history.back()} className="px-6 py-2 bg-slate-800 text-white rounded-full">Go Back</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Check government access if required
  if (govOnly && user?.role !== 'government') {
     return <Navigate to="/dashboard" replace />;
  }

  // Redirect Logic based on Role
  // 1. If user is Admin, they shouldn't be on User pages -> redirect to /admin
  // 2. If user is Gov, they shouldn't be on generic User pages -> redirect to /gov-dashboard
  if (userOnly) {
     if (isAdmin) return <Navigate to="/admin" replace />;
     if (user?.role === 'government') return <Navigate to="/gov-dashboard" replace />;
  }

  // Render children if authenticated and authorized
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
});

export default ProtectedRoute; 