/**
 * Cache Initializer Component
 * Initializes Redis cache system on application startup
 */

'use client';

import { useEffect } from 'react';

export default function CacheInitializer() {
  useEffect(() => {
    // Initialize cache system on client mount
    const initializeCache = async () => {
      try {
        // Call cache initialization endpoint
        const response = await fetch('/api/cache-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'health_check' })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Cache system status:', data.data?.status || 'unknown');
        }
      } catch (error) {
        console.warn('Cache initialization check failed:', error);
      }
    };

    initializeCache();
  }, []);

  return null; // This component doesn't render anything
}