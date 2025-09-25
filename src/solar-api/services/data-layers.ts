'use client';

import { fromArrayBuffer } from 'geotiff';
import proj4 from 'proj4';

// Google Solar API Data Layers endpoint
const SOLAR_API_BASE_URL = 'https://solar.googleapis.com/v1/dataLayers:get';
const API_KEY = 'AIzaSyBCI1D92F4Qn_Kpp5-CaddK9MPoCuBWbLY';

export interface SolarDataLayersRequest {
  location: {
    latitude: number;
    longitude: number;
  };
  radiusMeters: number;
  view: 'FULL_LAYERS' | 'IMAGERY_AND_ANNUAL_FLUX' | 'IMAGERY_ONLY';
  requiredQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  pixelSizeMeters?: number;
}

export interface SolarDataLayersResponse {
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
  imageryQuality: string;
}

export interface ProcessedSolarData {
  fluxData: Float32Array;
  shadeData: Float32Array[];
  dsmData: Float32Array;
  rgbData: Uint8Array;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  pixelSizeMeters: number;
  width: number;
  height: number;
}

export class SolarDataLayersService {
  private static instance: SolarDataLayersService;
  private cache = new Map<string, ProcessedSolarData>();

  public static getInstance(): SolarDataLayersService {
    if (!SolarDataLayersService.instance) {
      SolarDataLayersService.instance = new SolarDataLayersService();
    }
    return SolarDataLayersService.instance;
  }

  /**
   * Fetch solar data layers from Google Solar API
   */
  public async fetchDataLayers(request: SolarDataLayersRequest): Promise<SolarDataLayersResponse> {
    const cacheKey = `${request.location.latitude}_${request.location.longitude}_${request.radiusMeters}`;
    
    try {
      const params = new URLSearchParams({
        'location.latitude': request.location.latitude.toString(),
        'location.longitude': request.location.longitude.toString(),
        'radiusMeters': request.radiusMeters.toString(),
        'view': request.view,
        'requiredQuality': request.requiredQuality,
        'key': API_KEY
      });

      if (request.pixelSizeMeters) {
        params.append('pixelSizeMeters', request.pixelSizeMeters.toString());
      }

      const response = await fetch(`${SOLAR_API_BASE_URL}?${params.toString()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`COVERAGE_UNAVAILABLE: Solar data not available for this location`);
        }
        throw new Error(`Solar API Error: ${response.status} ${response.statusText}`);
      }

      const data: SolarDataLayersResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching solar data layers:', error);
      throw error;
    }
  }

  /**
   * Process GeoTIFF data from Solar API URLs
   */
  public async processSolarData(
    dataLayersResponse: SolarDataLayersResponse
  ): Promise<ProcessedSolarData> {
    try {
      // Process annual flux data
      const fluxData = await this.processGeoTIFF(dataLayersResponse.annualFluxUrl);
      
      // Process hourly shade data (first 12 hours as sample)
      const shadeData: Float32Array[] = [];
      const sampleHours = dataLayersResponse.hourlyShadeUrls.slice(0, 12);
      
      for (const shadeUrl of sampleHours) {
        const hourlyShade = await this.processGeoTIFF(shadeUrl);
        shadeData.push(hourlyShade.data);
      }

      // Process DSM data
      const dsmData = await this.processGeoTIFF(dataLayersResponse.dsmUrl);
      
      // Process RGB imagery
      const rgbData = await this.processGeoTIFF(dataLayersResponse.rgbUrl);

      return {
        fluxData: fluxData.data,
        shadeData,
        dsmData: dsmData.data,
        rgbData: rgbData.data as Uint8Array,
        bounds: fluxData.bounds,
        pixelSizeMeters: fluxData.pixelSizeMeters,
        width: fluxData.width,
        height: fluxData.height
      };
    } catch (error) {
      console.error('Error processing solar data:', error);
      throw error;
    }
  }

  /**
   * Process individual GeoTIFF file
   */
  private async processGeoTIFF(url: string) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const tiff = await fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      const rasters = await image.readRasters();

      // Get georeferencing information
      const geoKeys = image.getGeoKeys();
      const bbox = image.getBoundingBox();
      const [width, height] = [image.getWidth(), image.getHeight()];

      // Calculate pixel size
      const pixelSizeMeters = (bbox[2] - bbox[0]) / width;

      return {
        data: rasters[0] as Float32Array | Uint8Array,
        bounds: {
          west: bbox[0],
          south: bbox[1], 
          east: bbox[2],
          north: bbox[3]
        },
        pixelSizeMeters,
        width,
        height,
        geoKeys
      };
    } catch (error) {
      console.error('Error processing GeoTIFF:', error);
      throw error;
    }
  }

  /**
   * Get solar flux value at specific coordinates
   */
  public getSolarFluxAtPoint(
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

  /**
   * Get hourly shade data for specific time
   */
  public getHourlyShadeData(
    solarData: ProcessedSolarData,
    hour: number
  ): Float32Array | null {
    if (hour < 0 || hour >= solarData.shadeData.length) {
      return null;
    }
    return solarData.shadeData[hour];
  }

  /**
   * Create canvas overlay for solar flux visualization
   */
  public createFluxOverlay(
    solarData: ProcessedSolarData,
    opacity: number = 0.6
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = solarData.width;
    canvas.height = solarData.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot create canvas context');

    const imageData = ctx.createImageData(solarData.width, solarData.height);
    const data = imageData.data;

    // Find min/max flux values for normalization
    let minFlux = Infinity;
    let maxFlux = -Infinity;
    
    for (let i = 0; i < solarData.fluxData.length; i++) {
      const flux = solarData.fluxData[i];
      if (flux > 0) {
        minFlux = Math.min(minFlux, flux);
        maxFlux = Math.max(maxFlux, flux);
      }
    }

    // Create color overlay
    for (let i = 0; i < solarData.fluxData.length; i++) {
      const flux = solarData.fluxData[i];
      const dataIndex = i * 4;

      if (flux > 0) {
        // Normalize flux value (0-1)
        const normalized = (flux - minFlux) / (maxFlux - minFlux);
        
        // Create heat map colors (blue -> green -> yellow -> red)
        let r, g, b;
        if (normalized < 0.25) {
          // Blue to cyan
          r = 0;
          g = Math.floor(normalized * 4 * 255);
          b = 255;
        } else if (normalized < 0.5) {
          // Cyan to green
          r = 0;
          g = 255;
          b = Math.floor((0.5 - normalized) * 4 * 255);
        } else if (normalized < 0.75) {
          // Green to yellow
          r = Math.floor((normalized - 0.5) * 4 * 255);
          g = 255;
          b = 0;
        } else {
          // Yellow to red
          r = 255;
          g = Math.floor((1 - normalized) * 4 * 255);
          b = 0;
        }

        data[dataIndex] = r;
        data[dataIndex + 1] = g;
        data[dataIndex + 2] = b;
        data[dataIndex + 3] = Math.floor(opacity * 255);
      } else {
        // Transparent for no data
        data[dataIndex + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }
}

export const solarDataService = SolarDataLayersService.getInstance();