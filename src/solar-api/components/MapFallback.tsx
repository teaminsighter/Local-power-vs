'use client';

import { MapPin, RefreshCw } from 'lucide-react';

interface MapFallbackProps {
  center: { lat: number; lng: number };
  onRetry?: () => void;
  message?: string;
}

const MapFallback = ({ 
  center, 
  onRetry, 
  message = "Map unavailable. Using satellite imagery from coordinates."
}: MapFallbackProps) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin size={32} className="text-primary" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Solar Analysis Active</h3>
        <p className="text-sm text-gray-600 mb-4 max-w-xs">{message}</p>
        
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">Current Location</div>
          <div className="font-mono text-sm text-gray-800">
            {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
          </div>
        </div>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors mx-auto"
          >
            <RefreshCw size={16} />
            Retry Loading Map
          </button>
        )}
        
        <div className="mt-6 text-xs text-gray-500">
          Solar analysis is still running in the background
        </div>
      </div>
    </div>
  );
};

export default MapFallback;