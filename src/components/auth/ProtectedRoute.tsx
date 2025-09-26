'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, User } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'admin' | 'viewer';
  fallbackPath?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole = 'viewer',
  fallbackPath = '/admin/login'
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Role hierarchy for permission checking
  const roleHierarchy = {
    'super_admin': 3,
    'admin': 2,
    'viewer': 1
  };

  const hasPermission = (userRole: User['role'], requiredRole: User['role']): boolean => {
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Store the attempted URL to redirect after login
        sessionStorage.setItem('redirectAfterLogin', pathname);
        router.push(fallbackPath);
      } else if (user && !hasPermission(user.role, requiredRole)) {
        // User doesn't have sufficient permissions
        router.push('/admin/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, pathname, fallbackPath]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authenticating...</h3>
          <p className="text-gray-600">Please wait while we verify your access</p>
        </motion.div>
      </div>
    );
  }

  // Show unauthorized state
  if (isAuthenticated && user && !hasPermission(user.role, requiredRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this section. Required role: {requiredRole}
          </p>
          <div className="flex items-center gap-2 justify-center text-sm text-gray-500 mb-6">
            <Shield className="w-4 h-4" />
            <span>Your role: {user.role}</span>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/admin')}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-6">
            Please sign in to access the admin dashboard
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(fallbackPath)}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Sign In
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;