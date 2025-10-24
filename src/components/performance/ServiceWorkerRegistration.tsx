/**
 * Service Worker Registration Component
 * Handles progressive web app functionality and offline support
 */

'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
}

export function ServiceWorkerRegistration() {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: true,
    updateAvailable: false,
  });

  useEffect(() => {
    // Check if service workers are supported
    const isSupported = 'serviceWorker' in navigator;
    
    setSwState(prev => ({
      ...prev,
      isSupported,
      isOnline: navigator.onLine,
    }));

    if (!isSupported) {
      console.log('Service Workers not supported');
      return;
    }

    // Register service worker
    registerServiceWorker();

    // Listen for online/offline events
    const handleOnline = () => setSwState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSwState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      console.log('Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      console.log('Service Worker registered successfully:', registration);

      setSwState(prev => ({ ...prev, isRegistered: true }));

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker available');
              setSwState(prev => ({ ...prev, updateAvailable: true }));
            }
          });
        }
      });

      // Listen for controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker controller changed');
        window.location.reload();
      });

      // Check for updates periodically
      if (process.env.NODE_ENV === 'production') {
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const updateServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration && registration.waiting) {
        // Send message to waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Failed to update service worker:', error);
    }
  };

  // Don't render anything in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SERVICE_WORKER !== 'true') {
    return null;
  }

  return (
    <>
      {/* Connection status indicator */}
      {!swState.isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
          <span className="text-sm font-medium">
            You're offline. Some features may not be available.
          </span>
        </div>
      )}

      {/* Update notification */}
      {swState.updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Update Available</h4>
              <p className="text-sm opacity-90">
                A new version of the app is ready.
              </p>
            </div>
            <div className="ml-4 flex space-x-2">
              <button
                onClick={() => setSwState(prev => ({ ...prev, updateAvailable: false }))}
                className="text-sm underline opacity-75 hover:opacity-100"
              >
                Later
              </button>
              <button
                onClick={updateServiceWorker}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install prompt for PWA */}
      <InstallPrompt />
    </>
  );
}

/**
 * Install Prompt Component for PWA
 */
function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      
      // Save the event for later use
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);

    // Clear the prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-green-600 text-white rounded-lg shadow-lg p-4 z-40">
      <div className="flex items-start">
        <div className="flex-1">
          <h4 className="font-medium mb-1">Install Local Power</h4>
          <p className="text-sm opacity-90 mb-3">
            Get quick access to solar calculations and quotes. Works offline!
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="text-sm underline opacity-75 hover:opacity-100"
            >
              Not now
            </button>
            <button
              onClick={handleInstallClick}
              className="bg-white text-green-600 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100"
            >
              Install App
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="ml-2 opacity-75 hover:opacity-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ServiceWorkerRegistration;