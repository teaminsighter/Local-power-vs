// Google Solar API Types

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoTiff {
  width: number;
  height: number;
  rasters: Array<number>[];
  bounds: Bounds;
}

export interface DataLayersResponse {
  imageryDate: {
    year: number;
    month: number;
    day: number;
  };
  imageryProcessedDate: {
    year: number;
    month: number;
    day: number;
  };
  dsmUrl: string;
  rgbUrl: string;
  maskUrl: string;
  annualFluxUrl: string;
  monthlyFluxUrl: string;
  hourlyShadeUrls: string[];
  imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SolarData {
  location: LatLng;
  annualFlux: number; // kWh/kW/year
  monthlyFlux: number[]; // 12 months
  elevation: number; // meters above sea level
  isRooftop: boolean;
  shadeData?: ShadeInfo;
}

export interface ShadeInfo {
  month: number;
  hourlyShade: boolean[][]; // [day][hour]
  sunHours: number;
}

export interface RoofAnalysis {
  area: number; // square meters
  orientation: number; // degrees
  tilt: number; // degrees
  solarPotential: number; // kWh/year
  optimalPanelCount: number;
  estimatedOutput: number; // kW
}

export interface MapViewType {
  id: string;
  name: string;
  description: string;
  layerType: 'rgb' | 'dsm' | 'flux' | 'shade' | 'mask';
}

export interface SolarMapConfig {
  center: LatLng;
  zoom: number;
  radius: number; // meters
  quality: 'HIGH' | 'MEDIUM' | 'LOW';
  selectedLayers: string[];
}

export interface PinLocation {
  id: string;
  position: LatLng;
  roofData?: RoofAnalysis;
  solarData?: SolarData;
  isActive: boolean;
}