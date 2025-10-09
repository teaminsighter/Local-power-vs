// Google Maps API loader utility

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

let isLoading = false;
let isLoaded = false;

export const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isLoaded && window.google && window.google.maps) {
      resolve();
      return;
    }

    // If already loading, wait for it
    if (isLoading) {
      const checkLoaded = () => {
        if (isLoaded && window.google && window.google.maps) {
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Start loading
    isLoading = true;

    // Create callback function
    const callbackName = 'initGoogleMaps' + Date.now();
    (window as any)[callbackName] = () => {
      isLoaded = true;
      isLoading = false;
      delete (window as any)[callbackName];
      resolve();
    };

    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) {
      reject(new Error('Google Maps API key not found in environment variables'));
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&libraries=places`;
    
    script.onerror = () => {
      isLoading = false;
      delete (window as any)[callbackName];
      reject(new Error('Failed to load Google Maps API'));
    };

    // Append script to head
    document.head.appendChild(script);
  });
};

export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && window.google && window.google.maps;
};