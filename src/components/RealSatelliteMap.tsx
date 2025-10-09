'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { loadGoogleMapsAPI, isGoogleMapsLoaded } from '@/solar-api/utils/google-maps-loader';

interface RealSatelliteMapProps {
  address: string;
  onLocationConfirmed: () => void;
  onLocationChange?: (lat: number, lng: number) => void;
  onSearchAgain?: () => void;
}

const RealSatelliteMap = ({ 
  address, 
  onLocationConfirmed,
  onLocationChange,
  onSearchAgain
}: RealSatelliteMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    initializeMap();
  }, [address]);

  const initializeMap = async () => {
    if (!mapRef.current || !address) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load Google Maps API if not already loaded
      if (!isGoogleMapsLoaded()) {
        await loadGoogleMapsAPI();
      }

      // Geocode the address to get coordinates
      const geocoder = new google.maps.Geocoder();
      const geocodeResult = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      const location = geocodeResult[0].geometry.location;
      const coordinates = { lat: location.lat(), lng: location.lng() };
      setCurrentLocation(coordinates);

      // Create the map centered on the geocoded location
      const googleMap = new google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: 18, // Zoom level for satellite detail
        mapTypeId: 'satellite',
        mapId: 'step1-satellite-map',
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_CENTER,
          mapTypeIds: ['satellite', 'hybrid']
        },
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: 'greedy'
      });

      // Create a draggable marker using AdvancedMarkerElement (new approach)
      let mapMarker: google.maps.Marker;
      
      try {
        // Try to use the new AdvancedMarkerElement if available
        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
          // For now, fallback to regular marker as AdvancedMarkerElement needs different setup
          mapMarker = new google.maps.Marker({
            position: coordinates,
            map: googleMap,
            draggable: true,
            title: 'Drag to adjust your exact location'
          });
        } else {
          mapMarker = new google.maps.Marker({
            position: coordinates,
            map: googleMap,
            draggable: true,
            title: 'Drag to adjust your exact location'
          });
        }
      } catch (error) {
        console.warn('Advanced markers not available, using standard marker');
        mapMarker = new google.maps.Marker({
          position: coordinates,
          map: googleMap,
          draggable: true,
          title: 'Drag to adjust your exact location'
        });
      }

      // Add drag event listener
      mapMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const newCoords = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          };
          setCurrentLocation(newCoords);
          onLocationChange?.(newCoords.lat, newCoords.lng);
        }
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2 text-sm">
            <h4 class="font-semibold mb-2">📍 Selected Location</h4>
            <p class="text-gray-600 mb-2">${address}</p>
            <p class="text-xs text-gray-500">
              Drag the pin to adjust your exact roof location
            </p>
          </div>
        `
      });

      mapMarker.addListener('click', () => {
        infoWindow.open(googleMap, mapMarker);
      });

      setMap(googleMap);
      setMarker(mapMarker);
      setError(null);

      // Notify parent of initial location
      onLocationChange?.(coordinates.lat, coordinates.lng);

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setError('Failed to load map. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Desktop: Spacer to push content below search area */}
      <div className="hidden lg:block h-32"></div>
      
      {/* Mobile: No spacing - map directly below search */}
      <div className="block lg:hidden h-0"></div>
      
      {/* Main container */}
      <div className="w-full px-4 py-0 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout: Map only */}
          <div className="block lg:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-6"
            >
              {/* Map Container */}
              <div className="relative h-80">
                <div 
                  ref={mapRef}
                  className="w-full h-full"
                />
                
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p className="text-sm text-gray-600">Loading satellite imagery...</p>
                    </div>
                  </div>
                )}

                {/* Error Overlay */}
                {error && (
                  <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
                    <div className="text-center p-6 max-w-sm">
                      <div className="text-red-500 mb-3 text-2xl">🗺️</div>
                      <h3 className="font-semibold text-red-700 mb-2">Map Loading Error</h3>
                      <p className="text-sm text-red-600 mb-4">{error}</p>
                      <button
                        onClick={initializeMap}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors mb-2"
                      >
                        🔄 Retry Loading Map
                      </button>
                      <button
                        onClick={onLocationConfirmed}
                        className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
                      >
                        ▶️ Continue Without Map
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Mobile: Continue Button */}
            <motion.button
              onClick={onLocationConfirmed}
              disabled={isLoading || !!error}
              whileHover={!isLoading && !error ? { scale: 1.02 } : {}}
              whileTap={!isLoading && !error ? { scale: 0.98 } : {}}
              className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-base ${
                isLoading || error
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark text-white'
              }`}
            >
              ✅ Confirm Location & Continue
            </motion.button>
          </div>

          {/* Desktop Layout: Map + Location Details */}
          <div className="hidden lg:flex flex-col lg:flex-row gap-8 justify-center items-start">
            {/* Left Box - Rectangular Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
            >
              {/* Map Container */}
              <div className="relative h-80">
                <div 
                  ref={mapRef}
                  className="w-full h-full"
                />
                
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p className="text-sm text-gray-600">Loading satellite imagery...</p>
                    </div>
                  </div>
                )}

                {/* Error Overlay */}
                {error && (
                  <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
                    <div className="text-center p-6 max-w-sm">
                      <div className="text-red-500 mb-3 text-2xl">🗺️</div>
                      <h3 className="font-semibold text-red-700 mb-2">Map Loading Error</h3>
                      <p className="text-sm text-red-600 mb-4">{error}</p>
                      <div className="space-y-2">
                        <button
                          onClick={initializeMap}
                          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                        >
                          🔄 Retry Loading Map
                        </button>
                        <button
                          onClick={onLocationConfirmed}
                          className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
                        >
                          ▶️ Continue Without Map
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Box - Location Details & Actions */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-80"
            >
              {/* Location Details Section */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-primary" />
                    Location Details
                  </h4>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Address</label>
                    <p className="text-sm text-gray-800 mt-1">{address}</p>
                  </div>
                </div>
                
                {/* Action Buttons - At Bottom */}
                <div className="space-y-3">
                  <motion.button
                    onClick={onLocationConfirmed}
                    disabled={isLoading || !!error}
                    whileHover={!isLoading && !error ? { scale: 1.02 } : {}}
                    whileTap={!isLoading && !error ? { scale: 0.98 } : {}}
                    className={`w-full font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm ${
                      isLoading || error
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dark text-white'
                    }`}
                  >
                    ✅ Confirm Location
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealSatelliteMap;