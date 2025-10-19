// Improved Panel Placement Algorithm
// Organized grid-based panel layout with realistic spacing

import { ProcessedBuildingData, SolarPanel } from '../types/building-insights';

// Standard panel dimensions and spacing (in meters) - REDUCED for small roofs
const PANEL_DIMENSIONS = {
  width: 1.6,   // Reduced panel width for small roofs
  height: 0.8,  // Reduced panel height for small roofs
  spacing: 0.3  // Much smaller spacing to fit in small roof segments
};

// Convert meters to latitude/longitude degrees (approximate)
const METERS_TO_LAT = 1 / 111000; // 1 meter = ~9e-6 degrees latitude
const METERS_TO_LNG = 1 / (111000 * Math.cos(53.3498 * Math.PI / 180)); // Adjusted for Dublin latitude

interface OrganizedPanelLayout {
  panels: SolarPanel[];
  totalCount: number;
  efficiency: number;
  layout: {
    rows: number;
    cols: number;
    segmentDistribution: { [segmentId: number]: number };
  };
}

interface PanelGrid {
  segmentId: number;
  rows: number;
  cols: number;
  maxPanels: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  orientation: number; // azimuth in degrees
  priority: number; // placement priority (1-5, 5 = highest)
}

// Priority-based panel placement: Place RED panels first in best solar areas
export function getDistributedPanelLocations(
  buildingData: ProcessedBuildingData, 
  panelCount: number
): SolarPanel[] {
  if (panelCount === 0) return [];
  
  console.log(`🌟 SOLAR-OPTIMIZED PANEL LAYOUT: Requested ${panelCount} panels`);
  
  // Step 1: Generate ALL possible panel positions with solar calculations
  const allPossiblePanels = generateAllPossiblePanelPositions(buildingData);
  
  // Step 2: Sort by solar irradiance (highest first - RED zones)
  const sortedPanels = sortPanelsBySolarQuality(allPossiblePanels);
  
  // Step 3: Select top N panels (best solar exposure first)
  const selectedPanels = sortedPanels.slice(0, panelCount);
  
  // Step 4: Remove any overlapping panels (safety check)
  const finalPanels = removeOverlappingPanels(selectedPanels);
  
  console.log(`✅ SOLAR-OPTIMIZED PLACEMENT: ${finalPanels.length} panels placed by irradiance priority`);
  console.log(`🔴 Excellent (RED): ${finalPanels.filter(p => p.yearlyEnergyDcKwh >= 1200).length} panels`);
  console.log(`🟠 Good (ORANGE): ${finalPanels.filter(p => p.yearlyEnergyDcKwh >= 1100 && p.yearlyEnergyDcKwh < 1200).length} panels`);
  console.log(`🟢 Moderate (GREEN): ${finalPanels.filter(p => p.yearlyEnergyDcKwh >= 1000 && p.yearlyEnergyDcKwh < 1100).length} panels`);
  console.log(`🔵 Lower (BLUE): ${finalPanels.filter(p => p.yearlyEnergyDcKwh < 1000).length} panels`);
  
  return finalPanels;
}

// Create organized panel layout with grid-based placement
function createOrganizedPanelLayout(
  buildingData: ProcessedBuildingData,
  requestedPanels: number
): OrganizedPanelLayout {
  
  // Step 1: Create grid analysis for each roof segment
  const segmentGrids = createSegmentGrids(buildingData.roofSegments);
  
  // Step 2: Sort segments by priority (south-facing first)
  const prioritizedSegments = segmentGrids.sort((a, b) => b.priority - a.priority);
  
  // Step 3: Distribute panels across segments
  const panelDistribution = distributeByPriority(prioritizedSegments, requestedPanels);
  
  // Step 4: Create organized rows within each segment
  const organizedPanels: SolarPanel[] = [];
  const segmentDistribution: { [segmentId: number]: number } = {};
  let totalRows = 0;
  
  for (const distribution of panelDistribution) {
    const segmentPanels = createPanelRows(
      buildingData.roofSegments[distribution.segmentId],
      distribution.panelCount,
      buildingData.optimalPanelLocations
    );
    
    organizedPanels.push(...segmentPanels);
    segmentDistribution[distribution.segmentId] = segmentPanels.length;
    totalRows += Math.ceil(distribution.panelCount / distribution.cols);
  }
  
  // Step 5: Validate no overlaps and optimize spacing
  const validatedPanels = removeOverlappingPanels(organizedPanels);
  
  return {
    panels: validatedPanels,
    totalCount: validatedPanels.length,
    efficiency: calculateLayoutEfficiency(validatedPanels, buildingData),
    layout: {
      rows: totalRows,
      cols: Math.max(...panelDistribution.map(d => d.cols)),
      segmentDistribution
    }
  };
}

// Create grid analysis for roof segments
function createSegmentGrids(roofSegments: any[]): PanelGrid[] {
  return roofSegments.map((segment, index) => {
    const segmentWidth = getSegmentWidth(segment.bounds);
    const segmentHeight = getSegmentHeight(segment.bounds);
    
    // Calculate how many panels can fit in each direction
    const panelsPerRow = Math.floor(segmentWidth / (PANEL_DIMENSIONS.width + PANEL_DIMENSIONS.spacing));
    const maxRows = Math.floor(segmentHeight / (PANEL_DIMENSIONS.height + PANEL_DIMENSIONS.spacing));
    
    return {
      segmentId: index,
      rows: maxRows,
      cols: panelsPerRow,
      maxPanels: panelsPerRow * maxRows,
      bounds: {
        north: segment.bounds.ne.latitude,
        south: segment.bounds.sw.latitude,
        east: segment.bounds.ne.longitude,
        west: segment.bounds.sw.longitude
      },
      orientation: segment.azimuth,
      priority: calculateSegmentPriority(segment.azimuth)
    };
  });
}

// Calculate segment priority based on orientation (south = highest)
function calculateSegmentPriority(azimuth: number): number {
  // Normalize azimuth to 0-360
  const normalizedAzimuth = ((azimuth % 360) + 360) % 360;
  
  // South-facing (150-210°) = Priority 5
  if (normalizedAzimuth >= 150 && normalizedAzimuth <= 210) return 5;
  
  // Southeast/Southwest (120-150° or 210-240°) = Priority 4
  if ((normalizedAzimuth >= 120 && normalizedAzimuth < 150) || 
      (normalizedAzimuth > 210 && normalizedAzimuth <= 240)) return 4;
  
  // East/West (60-120° or 240-300°) = Priority 3
  if ((normalizedAzimuth >= 60 && normalizedAzimuth < 120) || 
      (normalizedAzimuth > 240 && normalizedAzimuth <= 300)) return 3;
  
  // Northeast/Northwest (30-60° or 300-330°) = Priority 2
  if ((normalizedAzimuth >= 30 && normalizedAzimuth < 60) || 
      (normalizedAzimuth > 300 && normalizedAzimuth <= 330)) return 2;
  
  // North-facing (330-30°) = Priority 1
  return 1;
}

// Distribute panels across segments by priority
function distributeByPriority(
  segments: PanelGrid[], 
  totalPanels: number
): Array<{ segmentId: number; panelCount: number; cols: number }> {
  const distribution: Array<{ segmentId: number; panelCount: number; cols: number }> = [];
  let remainingPanels = totalPanels;
  
  // Calculate total capacity
  const totalCapacity = segments.reduce((sum, seg) => sum + seg.maxPanels, 0);
  
  for (const segment of segments) {
    if (remainingPanels <= 0) break;
    
    // Allocate panels proportionally, but prioritize high-priority segments
    const segmentRatio = segment.maxPanels / totalCapacity;
    const priorityMultiplier = segment.priority / 5; // Scale priority 0.2-1.0
    const adjustedRatio = segmentRatio * (0.5 + priorityMultiplier * 0.5);
    
    const allocatedPanels = Math.min(
      Math.round(totalPanels * adjustedRatio),
      segment.maxPanels,
      remainingPanels
    );
    
    if (allocatedPanels > 0) {
      distribution.push({
        segmentId: segment.segmentId,
        panelCount: allocatedPanels,
        cols: segment.cols
      });
      remainingPanels -= allocatedPanels;
    }
  }
  
  // Distribute any remaining panels to highest priority segments
  while (remainingPanels > 0) {
    const availableSegments = distribution.filter(d => {
      const segment = segments.find(s => s.segmentId === d.segmentId);
      return segment && d.panelCount < segment.maxPanels;
    });
    
    if (availableSegments.length === 0) break;
    
    // Add to highest priority segment with space
    const highestPriority = availableSegments.reduce((max, current) => {
      const currentSegment = segments.find(s => s.segmentId === current.segmentId);
      const maxSegment = segments.find(s => s.segmentId === max.segmentId);
      return (currentSegment?.priority || 0) > (maxSegment?.priority || 0) ? current : max;
    });
    
    highestPriority.panelCount++;
    remainingPanels--;
  }
  
  return distribution;
}

// Create organized panel rows within a segment
function createPanelRows(
  segment: any,
  panelCount: number,
  optimalLocations: SolarPanel[]
): SolarPanel[] {
  const panels: SolarPanel[] = [];
  
  // Get segment boundaries
  const bounds = {
    north: segment.bounds.ne.latitude,
    south: segment.bounds.sw.latitude,
    east: segment.bounds.ne.longitude,
    west: segment.bounds.sw.longitude
  };
  
  // Calculate panel spacing in lat/lng with extra safety margin
  const panelSpacingLat = (PANEL_DIMENSIONS.height + PANEL_DIMENSIONS.spacing) * METERS_TO_LAT;
  const panelSpacingLng = (PANEL_DIMENSIONS.width + PANEL_DIMENSIONS.spacing) * METERS_TO_LNG;
  
  console.log(`📐 Panel spacing: ${panelSpacingLat.toFixed(8)}° lat (${(panelSpacingLat * 111000).toFixed(2)}m), ${panelSpacingLng.toFixed(8)}° lng (${(panelSpacingLng * 111000).toFixed(2)}m)`);
  
  // Calculate panels per row
  const segmentWidth = bounds.east - bounds.west;
  const panelsPerRow = Math.floor(segmentWidth / panelSpacingLng);
  
  if (panelsPerRow <= 0) return panels;
  
  const numberOfRows = Math.ceil(panelCount / panelsPerRow);
  
  // Add margin from edges (10% of segment size)
  const marginLat = (bounds.north - bounds.south) * 0.1;
  const marginLng = (bounds.east - bounds.west) * 0.1;
  
  let panelIndex = 0;
  
  for (let row = 0; row < numberOfRows && panelIndex < panelCount; row++) {
    for (let col = 0; col < panelsPerRow && panelIndex < panelCount; col++) {
      // Calculate panel position with margins
      const lat = bounds.south + marginLat + (row * panelSpacingLat);
      const lng = bounds.west + marginLng + (col * panelSpacingLng);
      
      // Ensure panel is within segment bounds
      if (lat <= bounds.north - marginLat && lng <= bounds.east - marginLng) {
        // Find closest optimal location for energy calculation
        const closestOptimal = findClosestOptimalLocation(lat, lng, optimalLocations);
        
        // Calculate energy based on segment orientation and position
        const baseEnergy = closestOptimal?.yearlyEnergyDcKwh || 400;
        const orientationMultiplier = calculateOrientationMultiplier(segment.azimuth);
        const positionMultiplier = calculatePositionMultiplier(lat, lng, segment.bounds);
        const adjustedEnergy = Math.round(baseEnergy * orientationMultiplier * positionMultiplier);
        
        panels.push({
          center: { latitude: lat, longitude: lng },
          orientation: 'LANDSCAPE', // Standard orientation for organized layout
          segmentIndex: segment.index,
          yearlyEnergyDcKwh: adjustedEnergy, // More accurate energy calculation
          rowIndex: row,
          colIndex: col
        } as SolarPanel);
        
        panelIndex++;
      }
    }
  }
  
  console.log(`📐 Segment ${segment.index}: Created ${panels.length} panels in ${numberOfRows} rows × ${panelsPerRow} cols`);
  
  return panels;
}

// Find closest optimal location for energy calculation
function findClosestOptimalLocation(
  targetLat: number, 
  targetLng: number, 
  optimalLocations: SolarPanel[]
): SolarPanel | null {
  if (optimalLocations.length === 0) return null;
  
  let closest = optimalLocations[0];
  let minDistance = calculateDistance(targetLat, targetLng, closest.center.latitude, closest.center.longitude);
  
  for (const location of optimalLocations.slice(1)) {
    const distance = calculateDistance(targetLat, targetLng, location.center.latitude, location.center.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      closest = location;
    }
  }
  
  return closest;
}

// Calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const latDiff = lat1 - lat2;
  const lngDiff = lng1 - lng2;
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}

// Remove overlapping panels with improved collision detection
function removeOverlappingPanels(panels: SolarPanel[]): SolarPanel[] {
  const validPanels: SolarPanel[] = [];
  
  // Calculate minimum distances required for no overlap
  const minDistanceLat = (PANEL_DIMENSIONS.height + PANEL_DIMENSIONS.spacing) * METERS_TO_LAT;
  const minDistanceLng = (PANEL_DIMENSIONS.width + PANEL_DIMENSIONS.spacing) * METERS_TO_LNG;
  
  // Use the larger distance for overall minimum separation
  const minDistance = Math.max(minDistanceLat, minDistanceLng);
  
  console.log(`🔧 Collision detection: minDistance = ${minDistance.toFixed(8)} degrees (${(minDistance * 111000).toFixed(2)}m)`);
  
  for (const panel of panels) {
    const hasOverlap = validPanels.some(existing => {
      const latDiff = Math.abs(panel.center.latitude - existing.center.latitude);
      const lngDiff = Math.abs(panel.center.longitude - existing.center.longitude);
      
      // Check both directional distances (rectangular collision)
      const tooCloseInLat = latDiff < minDistanceLat;
      const tooCloseInLng = lngDiff < minDistanceLng;
      
      // Also check euclidean distance for additional safety
      const euclideanDistance = calculateDistance(
        panel.center.latitude, panel.center.longitude,
        existing.center.latitude, existing.center.longitude
      );
      
      const tooCloseOverall = euclideanDistance < minDistance;
      
      return (tooCloseInLat && tooCloseInLng) || tooCloseOverall;
    });
    
    if (!hasOverlap) {
      validPanels.push(panel);
    } else {
      console.log(`🚫 Rejected overlapping panel at ${panel.center.latitude.toFixed(6)}, ${panel.center.longitude.toFixed(6)}`);
    }
  }
  
  if (validPanels.length < panels.length) {
    console.log(`🔧 Removed ${panels.length - validPanels.length} overlapping panels, kept ${validPanels.length} valid panels`);
  }
  
  return validPanels;
}

// Calculate layout efficiency
function calculateLayoutEfficiency(panels: SolarPanel[], buildingData: ProcessedBuildingData): number {
  if (panels.length === 0) return 0;
  
  const totalPanelArea = panels.length * (PANEL_DIMENSIONS.width * PANEL_DIMENSIONS.height);
  const utilizationRatio = totalPanelArea / buildingData.totalRoofArea;
  
  // Consider panel spacing efficiency (closer to ideal = higher efficiency)
  const idealSpacing = PANEL_DIMENSIONS.spacing;
  const actualAverageSpacing = calculateAverageSpacing(panels);
  const spacingEfficiency = Math.max(0, 1 - Math.abs(actualAverageSpacing - idealSpacing) / idealSpacing);
  
  return Math.min(utilizationRatio * spacingEfficiency, 1.0);
}

// Calculate average spacing between panels
function calculateAverageSpacing(panels: SolarPanel[]): number {
  if (panels.length < 2) return PANEL_DIMENSIONS.spacing;
  
  let totalDistance = 0;
  let pairCount = 0;
  
  for (let i = 0; i < panels.length; i++) {
    for (let j = i + 1; j < panels.length; j++) {
      const distance = calculateDistance(
        panels[i].center.latitude, panels[i].center.longitude,
        panels[j].center.latitude, panels[j].center.longitude
      ) * 111000; // Convert to meters
      
      totalDistance += distance;
      pairCount++;
    }
  }
  
  return pairCount > 0 ? totalDistance / pairCount : PANEL_DIMENSIONS.spacing;
}

// Helper function to get segment width in meters
function getSegmentWidth(bounds: any): number {
  const lngDiff = bounds.ne.longitude - bounds.sw.longitude;
  return lngDiff / METERS_TO_LNG;
}

// Helper function to get segment height in meters
function getSegmentHeight(bounds: any): number {
  const latDiff = bounds.ne.latitude - bounds.sw.latitude;
  return latDiff / METERS_TO_LAT;
}

// Calculate energy multiplier based on roof orientation/azimuth
function calculateOrientationMultiplier(azimuth: number): number {
  // Normalize azimuth to 0-360
  const normalizedAzimuth = ((azimuth % 360) + 360) % 360;
  
  // South-facing (150-210°) = Maximum energy production (1.0)
  if (normalizedAzimuth >= 150 && normalizedAzimuth <= 210) return 1.0;
  
  // Southeast/Southwest (120-150° or 210-240°) = Good production (0.95)
  if ((normalizedAzimuth >= 120 && normalizedAzimuth < 150) || 
      (normalizedAzimuth > 210 && normalizedAzimuth <= 240)) return 0.95;
  
  // East/West (90-120° or 240-270°) = Moderate production (0.85)
  if ((normalizedAzimuth >= 90 && normalizedAzimuth < 120) || 
      (normalizedAzimuth > 240 && normalizedAzimuth <= 270)) return 0.85;
  
  // Northeast/Northwest (60-90° or 270-300°) = Lower production (0.70)
  if ((normalizedAzimuth >= 60 && normalizedAzimuth < 90) || 
      (normalizedAzimuth > 270 && normalizedAzimuth <= 300)) return 0.70;
  
  // North-facing = Minimal production (0.55)
  return 0.55;
}

// Calculate energy multiplier based on panel position within segment
function calculatePositionMultiplier(lat: number, lng: number, bounds: any): number {
  // Calculate panel position within segment (0-1 scale)
  const latPosition = (lat - bounds.sw.latitude) / (bounds.ne.latitude - bounds.sw.latitude);
  const lngPosition = (lng - bounds.sw.longitude) / (bounds.ne.longitude - bounds.sw.longitude);
  
  // Center positions typically get better sun exposure
  const distanceFromCenter = Math.sqrt(
    Math.pow(latPosition - 0.5, 2) + Math.pow(lngPosition - 0.5, 2)
  );
  
  // Convert to multiplier: center = 1.0, edges = 0.90
  return Math.max(0.90, 1.0 - (distanceFromCenter * 0.10));
}

// Generate all possible panel positions across all roof segments
function generateAllPossiblePanelPositions(buildingData: ProcessedBuildingData): SolarPanel[] {
  const allPanels: SolarPanel[] = [];
  
  console.log(`🔍 GENERATING ALL POSSIBLE PANEL POSITIONS across ${buildingData.roofSegments.length} roof segments`);
  
  for (const segment of buildingData.roofSegments) {
    // Calculate segment bounds
    const bounds = {
      north: segment.bounds.ne.latitude,
      south: segment.bounds.sw.latitude,
      east: segment.bounds.ne.longitude,
      west: segment.bounds.sw.longitude
    };
    
    // Calculate panel spacing
    const panelSpacingLat = (PANEL_DIMENSIONS.height + PANEL_DIMENSIONS.spacing) * METERS_TO_LAT;
    const panelSpacingLng = (PANEL_DIMENSIONS.width + PANEL_DIMENSIONS.spacing) * METERS_TO_LNG;
    
    // Calculate how many panels can fit
    const segmentWidth = bounds.east - bounds.west;
    const segmentHeight = bounds.north - bounds.south;
    const panelsPerRow = Math.floor(segmentWidth / panelSpacingLng);
    const maxRows = Math.floor(segmentHeight / panelSpacingLat);
    
    // Add smaller margins for small roofs
    const marginLat = (bounds.north - bounds.south) * 0.05; // Reduced from 10% to 5%
    const marginLng = (bounds.east - bounds.west) * 0.05; // Reduced from 10% to 5%
    
    console.log(`📐 Segment ${segment.index}: ${panelsPerRow} panels/row × ${maxRows} rows (${panelsPerRow * maxRows} total)`);
    
    // Generate all possible positions in this segment
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < panelsPerRow; col++) {
        const lat = bounds.south + marginLat + (row * panelSpacingLat);
        const lng = bounds.west + marginLng + (col * panelSpacingLng);
        
        // Ensure within bounds
        if (lat <= bounds.north - marginLat && lng <= bounds.east - marginLng) {
          // Calculate solar performance for this position
          const baseEnergy = 400; // Base energy production
          const orientationMultiplier = calculateOrientationMultiplier(segment.azimuth);
          const positionMultiplier = calculatePositionMultiplier(lat, lng, segment.bounds);
          
          // Enhanced energy calculation based on real solar data principles
          const solarQualityMultiplier = calculateSolarQualityMultiplier(lat, lng, segment);
          const adjustedEnergy = Math.round(baseEnergy * orientationMultiplier * positionMultiplier * solarQualityMultiplier);
          
          // Log detailed energy calculation for first few panels
          if (allPanels.length < 5) {
            console.log(`⚡ ENERGY CALC Panel ${allPanels.length + 1}:`);
            console.log(`   Base: ${baseEnergy} kWh/year`);
            console.log(`   Orientation: ${orientationMultiplier.toFixed(2)}x`);
            console.log(`   Position: ${positionMultiplier.toFixed(2)}x`);
            console.log(`   Solar Quality: ${solarQualityMultiplier.toFixed(2)}x`);
            console.log(`   🎯 FINAL ENERGY: ${adjustedEnergy} kWh/year`);
            
            // Determine expected color
            let expectedColor = "UNKNOWN";
            if (adjustedEnergy >= 1200) expectedColor = "🔴 RED (Excellent)";
            else if (adjustedEnergy >= 1100) expectedColor = "🟠 ORANGE (Good)";
            else if (adjustedEnergy >= 1000) expectedColor = "🟢 GREEN (Moderate)";
            else expectedColor = "🔵 BLUE (Low)";
            console.log(`   Expected Color: ${expectedColor}`);
          }
          
          allPanels.push({
            center: { latitude: lat, longitude: lng },
            orientation: 'LANDSCAPE',
            segmentIndex: segment.index,
            yearlyEnergyDcKwh: adjustedEnergy,
            rowIndex: row,
            colIndex: col
          } as SolarPanel);
        }
      }
    }
  }
  
  console.log(`🏠 Generated ${allPanels.length} possible panel positions across roof`);
  return allPanels;
}

// Sort panels by solar quality (highest energy production first)
function sortPanelsBySolarQuality(panels: SolarPanel[]): SolarPanel[] {
  const sortedPanels = [...panels].sort((a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh);
  
  console.log(`🌟 PANEL SORTING BY SOLAR QUALITY:`);
  console.log(`📊 Highest energy panel: ${sortedPanels[0]?.yearlyEnergyDcKwh} kWh/year`);
  console.log(`📉 Lowest energy panel: ${sortedPanels[sortedPanels.length - 1]?.yearlyEnergyDcKwh} kWh/year`);
  
  // Count panels by color category
  const redPanels = sortedPanels.filter(p => p.yearlyEnergyDcKwh >= 1200);
  const orangePanels = sortedPanels.filter(p => p.yearlyEnergyDcKwh >= 1100 && p.yearlyEnergyDcKwh < 1200);
  const greenPanels = sortedPanels.filter(p => p.yearlyEnergyDcKwh >= 1000 && p.yearlyEnergyDcKwh < 1100);
  const bluePanels = sortedPanels.filter(p => p.yearlyEnergyDcKwh < 1000);
  
  console.log(`🎨 AVAILABLE PANEL COLORS:`);
  console.log(`   🔴 RED (≥1200): ${redPanels.length} panels`);
  console.log(`   🟠 ORANGE (1100-1199): ${orangePanels.length} panels`);
  console.log(`   🟢 GREEN (1000-1099): ${greenPanels.length} panels`);
  console.log(`   🔵 BLUE (<1000): ${bluePanels.length} panels`);
  
  // Show first 3 highest energy panels
  console.log(`🏆 TOP 3 PANELS BY ENERGY:`);
  sortedPanels.slice(0, 3).forEach((panel, index) => {
    let color = "🔵 BLUE";
    if (panel.yearlyEnergyDcKwh >= 1200) color = "🔴 RED";
    else if (panel.yearlyEnergyDcKwh >= 1100) color = "🟠 ORANGE";
    else if (panel.yearlyEnergyDcKwh >= 1000) color = "🟢 GREEN";
    console.log(`   ${index + 1}. ${panel.yearlyEnergyDcKwh} kWh/year - ${color}`);
  });
  
  return sortedPanels;
}

// Calculate solar quality multiplier based on position and sun exposure
function calculateSolarQualityMultiplier(lat: number, lng: number, segment: any): number {
  // Base multiplier starts at 1.0
  let multiplier = 1.0;
  
  // Check if segment has azimuth data
  const azimuth = segment.azimuth || segment.azimuthDegrees || 180; // Default to south if missing
  
  console.log(`🧮 SOLAR CALC DEBUG: Segment ${segment.index}, azimuth: ${azimuth}°`);
  
  // South-facing segments get premium multiplier
  if (azimuth >= 150 && azimuth <= 210) {
    multiplier *= 2.0; // INCREASED: Premium south-facing bonus for RED panels
    console.log(`🔴 RED ZONE: South-facing segment (${azimuth}°) - 2.0x multiplier`);
  } else if ((azimuth >= 120 && azimuth < 150) || (azimuth > 210 && azimuth <= 240)) {
    multiplier *= 1.6; // INCREASED: Good SE/SW bonus for ORANGE panels
    console.log(`🟠 ORANGE ZONE: SE/SW-facing segment (${azimuth}°) - 1.6x multiplier`);
  } else if ((azimuth >= 90 && azimuth < 120) || (azimuth > 240 && azimuth <= 270)) {
    multiplier *= 1.2; // INCREASED: E/W for GREEN panels
    console.log(`🟢 GREEN ZONE: E/W-facing segment (${azimuth}°) - 1.2x multiplier`);
  } else {
    multiplier *= 0.8; // Reduced for north-facing areas (BLUE panels)
    console.log(`🔵 BLUE ZONE: North/other-facing segment (${azimuth}°) - 0.8x multiplier`);
  }
  
  // Add some variation based on position (simulate real irradiance patterns)
  const positionVariation = 0.95 + (Math.random() * 0.1); // Reduced variation: 0.95-1.05
  multiplier *= positionVariation;
  
  console.log(`🎯 Final solar multiplier: ${multiplier.toFixed(2)}x`);
  
  return multiplier;
}