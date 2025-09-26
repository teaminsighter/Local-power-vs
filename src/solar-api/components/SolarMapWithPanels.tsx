'use client';

import { useState, useEffect, useRef } from 'react';
import { ProcessedBuildingData, LivePanelCalculation } from '../types/building-insights';
import { loadGoogleMapsAPI, isGoogleMapsLoaded } from '../utils/google-maps-loader';
import MapFallback from './MapFallback';
import SolarLayerManager from './SolarLayerManager';
import { ProcessedSolarData } from '../services/data-layers';

interface SolarMapWithPanelsProps {
  center: { lat: number; lng: number };
  onLocationChange: (lat: number, lng: number) => void;
  buildingData?: ProcessedBuildingData;
  panelCount: number;
  onDataUpdate: (data: LivePanelCalculation) => void;
  isLoading?: boolean;
}

const SolarMapWithPanels = ({ 
  center, 
  onLocationChange, 
  buildingData,
  panelCount,
  onDataUpdate,
  isLoading = false
}: SolarMapWithPanelsProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [panelMarkers, setPanelMarkers] = useState<google.maps.Marker[]>([]);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [solarData, setSolarData] = useState<ProcessedSolarData | null>(null);

  // Load Google Maps API and initialize map
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current || map) return;

      try {
        setIsMapLoading(true);
        
        // Load Google Maps API if not already loaded
        if (!isGoogleMapsLoaded()) {
          await loadGoogleMapsAPI();
        }

        // Create the map with high zoom for detailed solar analysis
        const googleMap = new google.maps.Map(mapRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom: 21, // Maximum zoom for satellite detail
          mapTypeId: 'satellite', // Always start with satellite
          mapId: 'solar-map-analysis',
          disableDefaultUI: true,
          zoomControl: true,
          scaleControl: true,
          gestureHandling: 'greedy',
          tilt: 0 // Disable 3D tilt for accurate analysis
        });

        setMap(googleMap);
        setMapError(null);
      } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
        setMapError('Failed to load Google Maps. Using fallback view.');
      } finally {
        setIsMapLoading(false);
      }
    };

    initializeMap();
  }, [center, map]);

  // Initialize draggable marker
  useEffect(() => {
    if (!map || marker) return;

    const newMarker = new google.maps.Marker({
      position: { lat: center.lat, lng: center.lng },
      map: map,
      draggable: true,
      title: 'Drag to analyze different roof locations'
    });

    newMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onLocationChange(lat, lng);
      }
    });

    setMarker(newMarker);
  }, [map, marker, center, onLocationChange]);

  // Update marker position when center changes
  useEffect(() => {
    if (marker) {
      marker.setPosition({ lat: center.lat, lng: center.lng });
      if (map) {
        map.setCenter({ lat: center.lat, lng: center.lng });
      }
    }
  }, [center, marker, map]);

  // Handle solar data updates from layer manager
  const handleSolarDataUpdate = (data: ProcessedSolarData | null) => {
    setSolarData(data);
    
    // Enhanced calculations with real solar flux data
    if (buildingData && onDataUpdate) {
      const liveData = calculateLiveDataWithSolarFlux(buildingData, panelCount, data);
      onDataUpdate(liveData);
    }
  };

  // Render solar panels on roof with real flux data optimization
  useEffect(() => {
    if (!map || !buildingData) return;

    // Clear existing panel markers
    panelMarkers.forEach(marker => marker.setMap(null));
    setPanelMarkers([]);

    if (panelCount === 0) return;

    // Get panels to display based on current panel count
    const panelsToShow = buildingData.optimalPanelLocations.slice(0, panelCount);
    
    const newPanelMarkers = panelsToShow.map((panel, index) => {
      // Get segment color for this panel
      const segment = buildingData.roofSegments.find(seg => seg.index === panel.segmentIndex);
      let panelColor = segment?.color || '#2563EB';
      
      // Use real solar flux data for color if available
      if (solarData) {
        const fluxValue = panel.center ? 
          getSolarFluxAtPoint(solarData, panel.center.latitude, panel.center.longitude) : 0;
        panelColor = getFluxBasedColor(fluxValue);
      }

      return new google.maps.Marker({
        position: {
          lat: panel.center.latitude,
          lng: panel.center.longitude
        },
        map: map,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">
              <!-- Solar panel background -->
              <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" fill=\"${panelColor}\" 
                    stroke=\"white\" stroke-width=\"2\" opacity=\"0.9\"/>
              <!-- Solar panel grid -->
              <path d=\"M8 3v18M12 3v18M16 3v18M3 8h18M3 12h18M3 16h18\" 
                    stroke=\"white\" stroke-width=\"0.8\" opacity=\"0.7\"/>
              <!-- Center highlight -->
              <circle cx=\"12\" cy=\"12\" r=\"2\" fill=\"white\" opacity=\"0.8\"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        },
        title: `Panel ${index + 1}: ${Math.round(panel.yearlyEnergyDcKwh)} kWh/year`,
        zIndex: 1000
      });
    });

    setPanelMarkers(newPanelMarkers);

    // Update live calculations with solar flux data
    if (buildingData && onDataUpdate) {
      const liveData = calculateLiveDataWithSolarFlux(buildingData, panelCount, solarData);
      onDataUpdate(liveData);
    }
  }, [map, buildingData, panelCount, solarData, onDataUpdate]);

  // Render roof segments as overlays
  useEffect(() => {
    if (!map || !buildingData) return;

    buildingData.roofSegments.forEach((segment, index) => {
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(segment.bounds.sw.latitude, segment.bounds.sw.longitude),
        new google.maps.LatLng(segment.bounds.ne.latitude, segment.bounds.ne.longitude)
      );

      const rectangle = new google.maps.Rectangle({
        bounds: bounds,
        fillColor: segment.color,
        fillOpacity: 0.1,
        strokeColor: segment.color,
        strokeOpacity: 0.3,
        strokeWeight: 1,
        map: map
      });

      // Add info window for segment details
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2 text-sm">
            <h4 class="font-semibold">Roof Segment ${index + 1}</h4>
            <p>Area: ${Math.round(segment.area)} m²</p>
            <p>Pitch: ${Math.round(segment.pitch)}°</p>
            <p>Azimuth: ${Math.round(segment.azimuth)}°</p>
            <p>Avg Sunshine: ${Math.round(segment.sunshineHours[5])} hrs/year</p>
          </div>
        `
      });

      rectangle.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          infoWindow.setPosition(e.latLng);
          infoWindow.open(map);
        }
      });
    });
  }, [map, buildingData]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '500px' }}
      />
      
      {/* Solar Layer Manager - Only show when map is loaded and no error */}
      {!isMapLoading && !mapError && map && (
        <SolarLayerManager
          map={map}
          center={center}
          onDataUpdate={handleSolarDataUpdate}
          isLoading={isLoading}
        />
      )}
      
      {/* Loading State */}
      {isMapLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Loading solar map...</p>
          </div>
        </div>
      )}

      {/* Error State - Fallback Map */}
      {mapError && (
        <div className="absolute inset-0 rounded-lg">
          <MapFallback
            center={center}
            message="Google Maps couldn't load. Solar analysis is still active."
            onRetry={() => {
              setMapError(null);
              setMap(null);
              setIsMapLoading(true);
            }}
          />
        </div>
      )}
      

      {/* Panel Count Display - moved to bottom left */}
      {buildingData && !isMapLoading && !mapError && (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-white/30">
          <div className="text-xs font-medium text-gray-700">Panels on Roof</div>
          <div className="text-xl font-bold text-primary">{panelCount}</div>
          <div className="text-xs text-gray-600">of {buildingData.maxPanels} max</div>
          {solarData && (
            <div className="text-xs text-green-600 mt-1">✓ Real solar data</div>
          )}
        </div>
      )}

      {/* Legend */}
      {buildingData && buildingData.roofSegments.length > 1 && !isMapLoading && !mapError && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <div className="text-xs font-medium text-gray-700 mb-2">Roof Segments</div>
          <div className="grid grid-cols-2 gap-1">
            {buildingData.roofSegments.slice(0, 4).map((segment, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-xs text-gray-600">
                  {Math.round(segment.azimuth)}° ({getDirectionName(segment.azimuth)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get solar flux at a specific point
function getSolarFluxAtPoint(
  solarData: ProcessedSolarData,
  latitude: number,
  longitude: number
): number {
  // Convert lat/lng to pixel coordinates
  const x = Math.floor(
    ((longitude - solarData.bounds.west) / 
     (solarData.bounds.east - solarData.bounds.west)) * solarData.width
  );
  
  const y = Math.floor(
    ((solarData.bounds.north - latitude) / 
     (solarData.bounds.north - solarData.bounds.south)) * solarData.height
  );

  // Check bounds
  if (x < 0 || x >= solarData.width || y < 0 || y >= solarData.height) {
    return 0;
  }

  // Get flux value from array
  const index = y * solarData.width + x;
  return solarData.fluxData[index] || 0;
}

// Helper function to get color based on solar flux
function getFluxBasedColor(fluxValue: number): string {
  // Normalize flux value (typical range: 900-1400 kWh/m²/year)
  const normalized = Math.min(Math.max((fluxValue - 900) / 500, 0), 1);
  
  if (normalized < 0.25) {
    return '#3B82F6'; // Blue - lower flux
  } else if (normalized < 0.5) {
    return '#10B981'; // Green - medium flux
  } else if (normalized < 0.75) {
    return '#F59E0B'; // Yellow - good flux
  } else {
    return '#EF4444'; // Red - excellent flux
  }
}

// Enhanced calculation with real solar flux data
function calculateLiveDataWithSolarFlux(
  buildingData: ProcessedBuildingData, 
  panelCount: number,
  solarData: ProcessedSolarData | null
): LivePanelCalculation {
  if (panelCount === 0) {
    return {
      panelCount: 0,
      annualEnergyKwh: 0,
      monthlySavingsEur: 0,
      systemSizeKw: 0,
      roofCoveragePercent: 0,
      co2OffsetKgPerYear: 0
    };
  }

  // Calculate based on optimal panel locations with real flux data
  const panelsToUse = buildingData.optimalPanelLocations.slice(0, panelCount);
  let annualEnergyKwh: number;
  
  if (solarData) {
    // Use real solar flux data for accurate calculations
    annualEnergyKwh = panelsToUse.reduce((sum, panel) => {
      const fluxValue = getSolarFluxAtPoint(solarData, panel.center.latitude, panel.center.longitude);
      // Convert flux (kWh/m²/year) to panel energy with efficiency factor
      const panelArea = buildingData.panelDimensions.width * buildingData.panelDimensions.height; // m²
      const efficiency = 0.20; // 20% panel efficiency
      const systemEfficiency = 0.85; // System losses
      return sum + (fluxValue * panelArea * efficiency * systemEfficiency);
    }, 0);
  } else {
    // Fallback to building insights data
    annualEnergyKwh = panelsToUse.reduce((sum, panel) => sum + panel.yearlyEnergyDcKwh, 0);
  }
  
  const systemSizeKw = (panelCount * buildingData.panelDimensions.capacity) / 1000;
  const panelArea = buildingData.panelDimensions.width * buildingData.panelDimensions.height;
  const roofCoveragePercent = (panelArea * panelCount) / buildingData.totalRoofArea * 100;
  
  // Irish electricity rate ~€0.28/kWh (updated rate)
  const monthlySavingsEur = (annualEnergyKwh / 12) * 0.28;
  
  // CO2 offset: 0.295 kg per kWh in Ireland
  const co2OffsetKgPerYear = annualEnergyKwh * 0.295;

  return {
    panelCount,
    annualEnergyKwh: Math.round(annualEnergyKwh),
    monthlySavingsEur: Math.round(monthlySavingsEur),
    systemSizeKw: Math.round(systemSizeKw * 10) / 10,
    roofCoveragePercent: Math.round(roofCoveragePercent),
    co2OffsetKgPerYear: Math.round(co2OffsetKgPerYear)
  };
}

// Helper function to calculate live data (fallback)
function calculateLiveData(buildingData: ProcessedBuildingData, panelCount: number): LivePanelCalculation {
  if (panelCount === 0) {
    return {
      panelCount: 0,
      annualEnergyKwh: 0,
      monthlySavingsEur: 0,
      systemSizeKw: 0,
      roofCoveragePercent: 0,
      co2OffsetKgPerYear: 0
    };
  }

  // Calculate based on optimal panel locations
  const panelsToUse = buildingData.optimalPanelLocations.slice(0, panelCount);
  const annualEnergyKwh = panelsToUse.reduce((sum, panel) => sum + panel.yearlyEnergyDcKwh, 0);
  
  const systemSizeKw = (panelCount * buildingData.panelDimensions.capacity) / 1000;
  const panelArea = buildingData.panelDimensions.width * buildingData.panelDimensions.height;
  const roofCoveragePercent = (panelArea * panelCount) / buildingData.totalRoofArea * 100;
  
  // Irish electricity rate ~€0.28/kWh (updated)
  const monthlySavingsEur = (annualEnergyKwh / 12) * 0.28;
  
  // CO2 offset: 0.295 kg per kWh in Ireland
  const co2OffsetKgPerYear = annualEnergyKwh * 0.295;

  return {
    panelCount,
    annualEnergyKwh: Math.round(annualEnergyKwh),
    monthlySavingsEur: Math.round(monthlySavingsEur),
    systemSizeKw: Math.round(systemSizeKw * 10) / 10,
    roofCoveragePercent: Math.round(roofCoveragePercent),
    co2OffsetKgPerYear: Math.round(co2OffsetKgPerYear)
  };
}

// Helper function to get direction name from azimuth
function getDirectionName(azimuth: number): string {
  if (azimuth >= 337.5 || azimuth < 22.5) return 'N';
  if (azimuth >= 22.5 && azimuth < 67.5) return 'NE';
  if (azimuth >= 67.5 && azimuth < 112.5) return 'E';
  if (azimuth >= 112.5 && azimuth < 157.5) return 'SE';
  if (azimuth >= 157.5 && azimuth < 202.5) return 'S';
  if (azimuth >= 202.5 && azimuth < 247.5) return 'SW';
  if (azimuth >= 247.5 && azimuth < 292.5) return 'W';
  if (azimuth >= 292.5 && azimuth < 337.5) return 'NW';
  return 'N';
}

export default SolarMapWithPanels;