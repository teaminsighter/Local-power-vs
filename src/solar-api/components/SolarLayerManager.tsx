'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Layers, Sun, Clock, Mountain, Eye, EyeOff } from 'lucide-react';
import { solarDataService, ProcessedSolarData } from '../services/data-layers';

export type LayerType = 'satellite' | 'flux' | 'shade' | 'dsm' | 'rgb';

interface SolarLayerManagerProps {
  map: google.maps.Map | null;
  center: { lat: number; lng: number };
  onDataUpdate?: (data: ProcessedSolarData | null) => void;
  isLoading?: boolean;
}

const SolarLayerManager = ({
  map,
  center,
  onDataUpdate,
  isLoading = false
}: SolarLayerManagerProps) => {
  const [activeLayer, setActiveLayer] = useState<LayerType>('satellite');
  const [solarData, setSolarData] = useState<ProcessedSolarData | null>(null);
  const [overlays, setOverlays] = useState<Map<LayerType, google.maps.GroundOverlay>>(new Map());
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentHour, setCurrentHour] = useState(12); // Noon by default
  const [opacity, setOpacity] = useState(0.7);

  // Fetch solar data when location changes
  useEffect(() => {
    if (!map || !center) return;
    
    fetchSolarData();
  }, [map, center]);

  const fetchSolarData = useCallback(async () => {
    if (!center) return;

    setIsLoadingData(true);

    try {
      // Fetch data layers from Google Solar API
      const dataLayersResponse = await solarDataService.fetchDataLayers({
        location: {
          latitude: center.lat,
          longitude: center.lng
        },
        radiusMeters: 100, // 100m radius for detailed analysis
        view: 'FULL_LAYERS',
        requiredQuality: 'HIGH',
        pixelSizeMeters: 0.5 // High resolution
      });

      // Process the GeoTIFF data
      const processedData = await solarDataService.processSolarData(dataLayersResponse);
      
      setSolarData(processedData);
      onDataUpdate?.(processedData);

    } catch (error) {
      console.error('Error fetching solar data:', error);
      
      setSolarData(null);
      onDataUpdate?.(null);
    } finally {
      setIsLoadingData(false);
    }
  }, [center, onDataUpdate]);

  // Handle layer switching
  const handleLayerChange = useCallback((layerType: LayerType) => {
    if (!map) return;

    // Clear existing overlays
    overlays.forEach((overlay) => {
      overlay.setMap(null);
    });
    setOverlays(new Map());

    setActiveLayer(layerType);

    // Set base map type
    if (layerType === 'satellite') {
      map.setMapTypeId('satellite');
      return;
    }

    // Set satellite as base for overlays
    map.setMapTypeId('satellite');

    if (!solarData) {
      console.warn('No solar data available for overlay');
      return;
    }

    // Create appropriate overlay
    let canvas: HTMLCanvasElement;
    
    try {
      switch (layerType) {
        case 'flux':
          canvas = solarDataService.createFluxOverlay(solarData, opacity);
          break;
        case 'shade':
          canvas = createShadeOverlay(solarData, currentHour);
          break;
        case 'dsm':
          canvas = createDSMOverlay(solarData);
          break;
        case 'rgb':
          canvas = createRGBOverlay(solarData);
          break;
        default:
          return;
      }

      // Create Google Maps overlay
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(solarData.bounds.south, solarData.bounds.west),
        new google.maps.LatLng(solarData.bounds.north, solarData.bounds.east)
      );

      const groundOverlay = new google.maps.GroundOverlay(
        canvas.toDataURL(),
        bounds,
        {
          opacity: opacity
        }
      );

      groundOverlay.setMap(map);
      
      const newOverlays = new Map(overlays);
      newOverlays.set(layerType, groundOverlay);
      setOverlays(newOverlays);

    } catch (error) {
      console.error('Error creating overlay:', error);
    }
  }, [map, solarData, overlays, opacity, currentHour]);

  // Create shade overlay for specific hour
  const createShadeOverlay = (data: ProcessedSolarData, hour: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = data.width;
    canvas.height = data.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot create canvas context');

    const shadeData = solarDataService.getHourlyShadeData(data, hour);
    if (!shadeData) throw new Error('No shade data for hour');

    const imageData = ctx.createImageData(data.width, data.height);
    const pixels = imageData.data;

    for (let i = 0; i < shadeData.length; i++) {
      const shade = shadeData[i];
      const dataIndex = i * 4;

      if (shade > 0) {
        // Shade intensity: darker = more shade
        const intensity = Math.floor((1 - shade) * 255);
        pixels[dataIndex] = 0;     // R
        pixels[dataIndex + 1] = 0; // G  
        pixels[dataIndex + 2] = intensity; // B
        pixels[dataIndex + 3] = Math.floor(shade * opacity * 255); // A
      } else {
        pixels[dataIndex + 3] = 0; // Transparent
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  // Create DSM (elevation) overlay
  const createDSMOverlay = (data: ProcessedSolarData): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = data.width;
    canvas.height = data.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot create canvas context');

    const imageData = ctx.createImageData(data.width, data.height);
    const pixels = imageData.data;

    // Find elevation range
    let minElev = Infinity;
    let maxElev = -Infinity;
    
    for (let i = 0; i < data.dsmData.length; i++) {
      const elev = data.dsmData[i];
      if (elev > 0) {
        minElev = Math.min(minElev, elev);
        maxElev = Math.max(maxElev, elev);
      }
    }

    // Create elevation visualization
    for (let i = 0; i < data.dsmData.length; i++) {
      const elev = data.dsmData[i];
      const dataIndex = i * 4;

      if (elev > 0) {
        const normalized = (elev - minElev) / (maxElev - minElev);
        const intensity = Math.floor(normalized * 255);
        
        pixels[dataIndex] = intensity;     // R
        pixels[dataIndex + 1] = intensity; // G
        pixels[dataIndex + 2] = intensity; // B
        pixels[dataIndex + 3] = Math.floor(opacity * 255); // A
      } else {
        pixels[dataIndex + 3] = 0; // Transparent
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  // Create RGB overlay
  const createRGBOverlay = (data: ProcessedSolarData): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = data.width;
    canvas.height = data.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot create canvas context');

    const imageData = ctx.createImageData(data.width, data.height);
    const pixels = imageData.data;

    // Copy RGB data directly
    for (let i = 0; i < data.rgbData.length; i += 3) {
      const pixelIndex = (i / 3) * 4;
      pixels[pixelIndex] = data.rgbData[i];         // R
      pixels[pixelIndex + 1] = data.rgbData[i + 1]; // G
      pixels[pixelIndex + 2] = data.rgbData[i + 2]; // B
      pixels[pixelIndex + 3] = Math.floor(opacity * 255); // A
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  // Update overlay opacity
  const updateOpacity = useCallback((newOpacity: number) => {
    setOpacity(newOpacity);
    
    overlays.forEach((overlay) => {
      overlay.setOpacity(newOpacity);
    });
  }, [overlays]);

  const layers = [
    { id: 'satellite' as LayerType, label: 'Satellite', icon: Mountain, available: true },
    { id: 'flux' as LayerType, label: 'Solar Flux', icon: Sun, available: !!solarData },
    { id: 'shade' as LayerType, label: 'Shade Analysis', icon: Clock, available: !!solarData },
    { id: 'dsm' as LayerType, label: 'Elevation', icon: Mountain, available: !!solarData },
    { id: 'rgb' as LayerType, label: 'RGB Imagery', icon: Eye, available: !!solarData }
  ];

  return (
    <div className="absolute top-4 right-4 z-10">
      {/* Compact Dropdown Layer Control */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/30 p-2 min-w-[180px]"
      >
        {/* Layer Dropdown */}
        <div className="relative">
          <select
            value={activeLayer}
            onChange={(e) => handleLayerChange(e.target.value as LayerType)}
            className="w-full px-3 py-2 pr-8 text-xs font-medium bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none cursor-pointer"
          >
            {layers.map((layer) => {
              const isDisabled = !layer.available;
              return (
                <option 
                  key={layer.id} 
                  value={layer.id}
                  disabled={isDisabled}
                >
                  {layer.label} {isDisabled ? '' : ''}
                </option>
              );
            })}
          </select>
          
          {/* Custom dropdown arrow and icons */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none flex items-center gap-1">
            {(isLoadingData || isLoading) ? (
              <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {/* Show eye closed for unavailable layers */}
                {!layers.find(l => l.id === activeLayer)?.available && (
                  <EyeOff size={10} className="text-gray-400" />
                )}
                <Layers size={10} className="text-gray-400" />
              </>
            )}
          </div>
        </div>

        {/* Compact Controls */}
        {activeLayer !== 'satellite' && solarData && (
          <div className="mt-2 space-y-2">
            {/* Compact Opacity Control */}
            <div className="flex items-center gap-2">
              <Eye size={10} className="text-gray-500" />
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => updateOpacity(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-500 w-8">{Math.round(opacity * 100)}%</span>
            </div>

            {/* Compact Hour Control for Shade Layer */}
            {activeLayer === 'shade' && (
              <div className="flex items-center gap-2">
                <Clock size={10} className="text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={currentHour}
                  onChange={(e) => {
                    setCurrentHour(parseInt(e.target.value));
                    handleLayerChange('shade');
                  }}
                  className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500 w-8">{currentHour}h</span>
              </div>
            )}
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default SolarLayerManager;