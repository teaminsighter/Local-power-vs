'use client';

import AdminDashboard from '@/components/admin/AdminDashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

export default function AdminPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requiredRole="viewer">
        <AdminDashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
}