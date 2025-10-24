'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import LoginForm from '@/components/auth/LoginForm';

const AdminAuthPageContent = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/admin';
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectUrl);
    }
  }, [session, status, router]);

  const handleAuthSuccess = () => {
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/admin';
    sessionStorage.removeItem('redirectAfterLogin');
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Logo/Brand */}
        <div className="absolute top-8 left-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">LP</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Local Power</span>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-6xl mx-auto flex items-center justify-center">
          <div className="grid md:grid-cols-2 gap-12 items-center w-full">
            
            {/* Left Side - Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center md:text-left"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Welcome Back
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Access your admin dashboard to manage solar installations, leads, and analytics.
              </p>
              
              {/* Features */}
              <div className="space-y-4">
                {[
                  { icon: '📊', text: 'Comprehensive Analytics Dashboard' },
                  { icon: '🔧', text: 'Complete API & Pricing Management' },
                  { icon: '🎯', text: 'Advanced CRM System' },
                  { icon: '🚀', text: 'A/B Testing & Optimization Tools' }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Side - Auth Forms */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <LoginForm 
                onToggleMode={() => {}} // Removed registration for now
                onSuccess={handleAuthSuccess}
              />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-gray-500 text-center"
          >
            © 2024 Local Power. All rights reserved.
          </motion.p>
        </div>
      </div>
    </div>
  );
};

const AdminAuthPage = () => {
  return <AdminAuthPageContent />;
};

export default AdminAuthPage;