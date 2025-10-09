import { BuildingInsightsResponse, ProcessedBuildingData, LivePanelCalculation } from '../types/building-insights';

export class BuildingInsightsService {
  private apiKey: string;
  private baseUrl = 'https://solar.googleapis.com/v1/buildingInsights:findClosest';

  constructor() {
    this.apiKey = process.env.GOOGLE_SOLAR_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Solar API key not found in environment variables');
    }
  }

  /**
   * Fetch building insights for a specific location
   */
  async fetchBuildingInsights(
    latitude: number, 
    longitude: number,
    quality: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH'
  ): Promise<BuildingInsightsResponse> {
    const params = new URLSearchParams({
      'location.latitude': latitude.toFixed(6),
      'location.longitude': longitude.toFixed(6),
      'requiredQuality': quality,
      'key': this.apiKey
    });

    const url = `${this.baseUrl}?${params}`;
    
    try {
      console.log('Fetching building insights:', { latitude, longitude });
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`BUILDING_NOT_FOUND: Building data not available for this location`);
        }
        const error = await response.json();
        console.error('Building insights API error:', error);
        throw new Error(`API Error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Building insights response:', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch building insights:', error);
      throw error;
    }
  }

  /**
   * Process raw API response into UI-friendly format
   */
  processBuildingData(response: BuildingInsightsResponse): ProcessedBuildingData {
    const { solarPotential } = response;
    
    // Generate colors for roof segments
    const segmentColors = this.generateSegmentColors(solarPotential.roofSegmentStats.length);
    
    const processedSegments = solarPotential.roofSegmentStats.map((segment, index) => ({
      index,
      area: segment.stats.areaMeters2,
      pitch: segment.pitchDegrees,
      azimuth: segment.azimuthDegrees,
      center: segment.center,
      bounds: segment.boundingBox,
      sunshineHours: segment.stats.sunshineQuantiles,
      color: segmentColors[index]
    }));

    return {
      buildingId: response.name,
      center: response.center,
      maxPanels: solarPotential.maxArrayPanelsCount,
      totalRoofArea: solarPotential.wholeRoofStats.areaMeters2,
      roofSegments: processedSegments,
      panelConfigs: solarPotential.solarPanelConfigs,
      optimalPanelLocations: solarPotential.solarPanels,
      panelDimensions: {
        width: solarPotential.panelWidthMeters,
        height: solarPotential.panelHeightMeters,
        capacity: solarPotential.panelCapacityWatts
      },
      financialData: solarPotential.financialAnalyses,
      imageryQuality: response.imageryQuality
    };
  }

  /**
   * Calculate live panel metrics based on panel count
   */
  calculateLivePanelData(
    buildingData: ProcessedBuildingData, 
    panelCount: number
  ): LivePanelCalculation {
    // Find the closest panel configuration
    const config = this.findClosestPanelConfig(buildingData.panelConfigs, panelCount);
    
    if (!config) {
      return {
        panelCount: 0,
        annualEnergyKwh: 0,
        monthlySavingsEur: 0,
        systemSizeKw: 0,
        roofCoveragePercent: 0,
        co2OffsetKgPerYear: 0
      };
    }

    // Calculate energy per panel average
    const energyPerPanel = config.yearlyEnergyDcKwh / config.panelsCount;
    const annualEnergyKwh = energyPerPanel * panelCount;
    
    // Calculate system size (panels * capacity)
    const systemSizeKw = (panelCount * buildingData.panelDimensions.capacity) / 1000;
    
    // Calculate roof coverage
    const panelArea = buildingData.panelDimensions.width * buildingData.panelDimensions.height;
    const totalPanelArea = panelArea * panelCount;
    const roofCoveragePercent = (totalPanelArea / buildingData.totalRoofArea) * 100;
    
    // Estimate monthly savings (€0.25 per kWh average Irish rate)
    const monthlyEnergyKwh = annualEnergyKwh / 12;
    const monthlySavingsEur = monthlyEnergyKwh * 0.25;
    
    // CO2 offset (average 0.295 kg CO2 per kWh in Ireland)
    const co2OffsetKgPerYear = annualEnergyKwh * 0.295;
    
    return {
      panelCount,
      annualEnergyKwh: Math.round(annualEnergyKwh),
      monthlySavingsEur: Math.round(monthlySavingsEur),
      systemSizeKw: Math.round(systemSizeKw * 10) / 10, // Round to 1 decimal
      roofCoveragePercent: Math.round(roofCoveragePercent),
      co2OffsetKgPerYear: Math.round(co2OffsetKgPerYear)
    };
  }

  /**
   * Get panels to display for a given panel count
   */
  getPanelsToDisplay(
    buildingData: ProcessedBuildingData, 
    panelCount: number
  ): Array<{ lat: number; lng: number; segmentIndex: number }> {
    const panels = buildingData.optimalPanelLocations;
    
    if (panelCount >= panels.length) {
      return panels.map(panel => ({
        lat: panel.center.latitude,
        lng: panel.center.longitude,
        segmentIndex: panel.segmentIndex
      }));
    }
    
    // Return the first N panels (they're ordered by efficiency)
    return panels.slice(0, panelCount).map(panel => ({
      lat: panel.center.latitude,
      lng: panel.center.longitude,
      segmentIndex: panel.segmentIndex
    }));
  }

  /**
   * Find the closest panel configuration for a given panel count
   */
  private findClosestPanelConfig(configs: any[], targetPanelCount: number) {
    if (!configs || configs.length === 0) return null;
    
    let closest = configs[0];
    let closestDiff = Math.abs(configs[0].panelsCount - targetPanelCount);
    
    for (const config of configs) {
      const diff = Math.abs(config.panelsCount - targetPanelCount);
      if (diff < closestDiff) {
        closest = config;
        closestDiff = diff;
      }
    }
    
    return closest;
  }

  /**
   * Generate distinct colors for roof segments
   */
  private generateSegmentColors(count: number): string[] {
    const colors = [
      '#3B82F6', // Blue
      '#EF4444', // Red  
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#8B5CF6', // Purple
      '#F97316', // Orange
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#EC4899', // Pink
      '#6B7280'  // Gray
    ];
    
    return Array(count).fill(0).map((_, i) => colors[i % colors.length]);
  }
}