'use client';

import { useState, useEffect, useRef } from 'react';
import { ProcessedBuildingData, LivePanelCalculation, SolarPanel } from '../types/building-insights';
import { loadGoogleMapsAPI, isGoogleMapsLoaded } from '../utils/google-maps-loader';
import MapFallback from './MapFallback';
import SolarLayerManager from './SolarLayerManager';
import { ProcessedSolarData } from '../services/data-layers';
import { getDistributedPanelLocations } from './ImprovedPanelPlacement';

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

        // Create the map with very high zoom for detailed solar analysis
        const googleMap = new google.maps.Map(mapRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom: 22, // Very high zoom for detailed satellite imagery
          mapTypeId: 'satellite', // Always start with satellite
          mapId: 'solar-map-analysis',
          disableDefaultUI: true,
          zoomControl: true,
          scaleControl: true,
          gestureHandling: 'greedy',
          tilt: 0, // Disable 3D tilt for accurate analysis
          minZoom: 18, // Minimum zoom for panel visibility
          maxZoom: 23  // Maximum possible zoom
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

    // Get panels to display with improved distribution across roof segments
    let panelsToShow = getDistributedPanelLocations(buildingData, panelCount);
    
    console.log(`🚀 SMART SYSTEM RESULT: Generated ${panelsToShow.length} panels`);
    
    // REMOVED OLD FALLBACKS - Force our smart system to work
    // Only create emergency panels if our smart system truly fails
    if (panelsToShow.length === 0 && panelCount > 0) {
      console.log(`🆘 EMERGENCY: Creating high-energy test panels`);
      panelsToShow = [];
      for (let i = 0; i < Math.min(panelCount, 10); i++) {
        // Create panels with HIGH energy values to test RED/ORANGE colors
        const testEnergy = 1300 + (Math.random() * 200); // 1300-1500 kWh/year = RED panels
        panelsToShow.push({
          center: {
            latitude: center.lat + (i % 3 - 1) * 0.00003,
            longitude: center.lng + (Math.floor(i / 3) - 1) * 0.00003
          },
          orientation: 'LANDSCAPE' as const,
          segmentIndex: 0,
          yearlyEnergyDcKwh: testEnergy
        } as SolarPanel);
        console.log(`🔴 Emergency RED panel ${i + 1}: ${testEnergy.toFixed(0)} kWh/year`);
      }
    }
    
    console.log(`🔍 MAP RENDERING: Placing ${panelsToShow.length} panels on map (requested: ${panelCount})`);
    console.log(`📍 First panel location:`, panelsToShow[0]?.center);
    console.log(`🏠 Building data segments:`, buildingData.roofSegments.length);
    console.log(`🗺️ Map zoom level:`, map.getZoom());
    console.log(`🎯 Map center:`, map.getCenter()?.toJSON());
    
    const newPanelMarkers = panelsToShow.map((panel, index) => {
      // Get segment color for this panel
      const segment = buildingData.roofSegments.find(seg => seg.index === panel.segmentIndex);
      let panelColor = segment?.color || '#FF6B35'; // Bright orange default for visibility
      
      // Use real solar flux data for color if available
      if (solarData) {
        const fluxValue = panel.center ? 
          getSolarFluxAtPoint(solarData, panel.center.latitude, panel.center.longitude) : 0;
        panelColor = getFluxBasedColor(fluxValue);
        
        // Log flux data for first few panels to help debugging
        if (index < 3) {
          console.log(`☀️ Panel ${index + 1} solar flux: ${fluxValue.toFixed(1)} kWh/m²/year, color: ${panelColor}`);
        }
      } else {
        // Fallback: Use panel's actual energy production for coloring
        const energyKwh = panel.yearlyEnergyDcKwh || 400;
        panelColor = getFluxBasedColor(energyKwh);
        
        if (index < 3) {
          console.log(`🔋 Panel ${index + 1} energy estimate: ${energyKwh} kWh/year, color: ${panelColor}`);
        }
      }

      // Get dynamic panel size based on zoom level
      const zoomLevel = map.getZoom() || 20;
      const panelSize = getPanelIconSize(zoomLevel);
      
      return new google.maps.Marker({
        position: {
          lat: panel.center.latitude,
          lng: panel.center.longitude
        },
        map: map,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="${panelSize}" height="${Math.round(panelSize/2)}" viewBox="0 0 ${panelSize} ${Math.round(panelSize/2)}" xmlns="http://www.w3.org/2000/svg">
              <!-- Bold solar panel background with high contrast -->
              <rect x="0" y="0" width="${panelSize}" height="${Math.round(panelSize/2)}" rx="2" 
                    fill="${panelColor}" stroke="#000000" stroke-width="2" opacity="1"/>
              <!-- Solar cell grid (3x6 cells typical) -->
              <g stroke="#000000" stroke-width="1" opacity="0.9">
                ${generateSolarCellGrid(panelSize, Math.round(panelSize/2))}
              </g>
              <!-- Center highlight for visibility -->
              <circle cx="${panelSize/2}" cy="${Math.round(panelSize/4)}" r="3" fill="#FFFFFF" opacity="0.9"/>
              <text x="${panelSize/2}" y="${Math.round(panelSize/4)+2}" text-anchor="middle" fill="#000" font-size="8" font-weight="bold">${index + 1}</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(panelSize, Math.round(panelSize/2)),
          anchor: new google.maps.Point(panelSize/2, Math.round(panelSize/4))
        },
        title: `Panel ${index + 1}: ${Math.round(panel.yearlyEnergyDcKwh)} kWh/year\nLat: ${panel.center.latitude.toFixed(6)}, Lng: ${panel.center.longitude.toFixed(6)}`,
        zIndex: 9999,
        optimized: false, // Ensure markers are always visible
        clickable: true
      });
    });

    setPanelMarkers(newPanelMarkers);
    
    console.log(`✅ PANEL MARKERS CREATED: ${newPanelMarkers.length} markers added to map`);
    newPanelMarkers.forEach((marker, i) => {
      console.log(`📌 Marker ${i + 1}:`, marker.getPosition()?.toJSON());
    });

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
          <div className="text-xs text-blue-600 mt-1">🔍 Zoom: {map?.getZoom()}</div>
        </div>
      )}

      {/* Solar Irradiance Color Legend */}
      {buildingData && panelCount > 0 && !isMapLoading && !mapError && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs border">
          <div className="text-sm font-semibold text-gray-800 mb-2">☀️ Solar Irradiance</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#DC2626' }}></div>
              <span className="text-xs text-gray-700">Excellent (1200+ kWh/m²)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#D97706' }}></div>
              <span className="text-xs text-gray-700">Good (1100-1200 kWh/m²)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#059669' }}></div>
              <span className="text-xs text-gray-700">Moderate (1000-1100 kWh/m²)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#0891B2' }}></div>
              <span className="text-xs text-gray-700">Below Average (900-1000)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#1E40AF' }}></div>
              <span className="text-xs text-gray-700">Low (800-900 kWh/m²)</span>
            </div>
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

// Enhanced solar flux-based coloring system
function getFluxBasedColor(fluxValue: number): string {
  // Normalize flux value with expanded range for Irish solar conditions
  // Typical range in Ireland: 800-1300 kWh/m²/year
  const minFlux = 800;  // Lower threshold for Irish conditions
  const maxFlux = 1300; // Upper threshold for excellent Irish conditions
  const normalized = Math.min(Math.max((fluxValue - minFlux) / (maxFlux - minFlux), 0), 1);
  
  // Enhanced color scheme based on solar irradiance quality
  if (normalized < 0.2) {
    return '#1E40AF'; // Deep Blue - Low solar irradiance (800-900 kWh/m²/year)
  } else if (normalized < 0.4) {
    return '#0891B2'; // Cyan-Blue - Below moderate (900-1000 kWh/m²/year)  
  } else if (normalized < 0.6) {
    return '#059669'; // Green - Moderate solar irradiance (1000-1100 kWh/m²/year)
  } else if (normalized < 0.8) {
    return '#D97706'; // Orange-Yellow - Good solar irradiance (1100-1200 kWh/m²/year)
  } else {
    return '#DC2626'; // Bright Red - Excellent solar irradiance (1200+ kWh/m²/year)
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
  const panelsToUse = getDistributedPanelLocations(buildingData, panelCount);
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

// Helper function to get panel icon size based on zoom level
function getPanelIconSize(zoomLevel: number): number {
  if (zoomLevel >= 21) return 50; // Very detailed view - larger for visibility
  if (zoomLevel >= 20) return 42; // Large detail view
  if (zoomLevel >= 19) return 36; // Standard view  
  if (zoomLevel >= 18) return 30; // Medium view
  if (zoomLevel >= 17) return 26; // Small view
  return 22; // Overview - minimum size for visibility
}

// Helper function to generate solar cell grid SVG
function generateSolarCellGrid(width: number, height: number): string {
  const cellsX = 6; // Typical solar panel has 6 columns
  const cellsY = 3; // Typical solar panel has 3 rows
  
  const cellWidth = (width - 2) / cellsX;
  const cellHeight = (height - 2) / cellsY;
  
  let gridPaths = '';
  
  // Vertical lines
  for (let i = 1; i < cellsX; i++) {
    const x = 1 + (i * cellWidth);
    gridPaths += `<line x1="${x}" y1="1" x2="${x}" y2="${height-1}"/>`;
  }
  
  // Horizontal lines
  for (let i = 1; i < cellsY; i++) {
    const y = 1 + (i * cellHeight);
    gridPaths += `<line x1="1" y1="${y}" x2="${width-1}" y2="${y}"/>`;
  }
  
  return gridPaths;
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