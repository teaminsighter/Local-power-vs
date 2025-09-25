# Step 4 Implementation Plan - Interactive Solar Map

## Overview
Implement a comprehensive solar mapping solution with real-time data visualization and interactive roof analysis capabilities.

## Implementation Strategy

### Phase 1: Foundation Setup ✅
- [x] Create folder structure for solar API integration
- [x] Define TypeScript interfaces and types
- [x] Document Google Solar API capabilities
- [ ] Install required dependencies
- [ ] Set up API service architecture

### Phase 2: API Integration Services
**File: `/src/solar-api/services/`**

1. **DataLayersService** - Core API communication
   - Fetch data layers from Google Solar API
   - Handle authentication and error management
   - Implement caching for 1-hour URL validity

2. **GeoTIFFProcessor** - Data processing
   - Download and parse GeoTIFF files
   - Extract pixel data and coordinate reprojection
   - Handle different layer types (DSM, RGB, flux, shade)

3. **SolarCalculator** - Real-time calculations
   - Calculate solar potential based on location
   - Analyze roof characteristics (area, orientation, tilt)
   - Generate savings estimates and system recommendations

### Phase 3: Map Components
**File: `/src/solar-api/components/`**

1. **InteractiveSolarMap** - Main map container
   - Google Maps integration with satellite view
   - Layer switching controls (RGB, DSM, flux, shade)
   - Zoom and pan controls optimized for roof analysis

2. **MovablePinComponent** - Draggable location marker
   - Draggable pin for precise roof selection
   - Real-time coordinate updates
   - Visual feedback during movement

3. **LayerOverlays** - Solar data visualization
   - Render GeoTIFF data as map overlays
   - Color-coded flux visualization
   - Shade pattern overlays
   - Building mask integration

### Phase 4: Data Visualization Panel
**File: Right column of Step 4**

1. **Real-time Solar Metrics**
   - Annual solar flux (kWh/kW/year)
   - Monthly breakdown visualization
   - Daily sun hours calculation
   - Shade analysis by time of day

2. **Roof Analysis Display**
   - Roof area calculation
   - Optimal panel placement suggestions
   - System size recommendations
   - Energy production estimates

3. **Interactive Charts**
   - Monthly solar production graph
   - Hourly shade patterns
   - Seasonal variations
   - ROI calculations

## Technical Architecture

### Data Flow
```
User moves pin → Get coordinates → Fetch Solar API data → Process GeoTIFF → Extract pixel data → Calculate solar metrics → Update UI
```

### API Integration Points
1. **Google Maps API** (Already integrated)
   - Satellite imagery base layer
   - Coordinate system and projection
   - User interaction handling

2. **Google Solar API** (New)
   - Data layers endpoint
   - GeoTIFF file downloads
   - Real solar irradiance data

### Required Dependencies
```bash
npm install geotiff geotiff-geokeys-to-proj4 proj4
```

## Map View Types Implementation

### 1. RGB View (Default)
- High-resolution aerial imagery
- Clear roof visualization
- User-friendly for initial exploration

### 2. DSM (Digital Surface Model)
- Elevation-based visualization
- 3D surface representation
- Roof angle and tilt analysis

### 3. Solar Flux View
- Annual solar potential heatmap
- Color-coded energy zones
- Optimal placement identification

### 4. Shade Analysis View
- Time-based shade patterns
- Hourly/seasonal variations
- Interactive time slider

## Real-time Data Features

### Location-Based Calculations
- Precise latitude/longitude analysis
- Address-to-coordinate conversion
- Multiple roof section analysis

### Live Solar Metrics
- Current weather integration
- Real-time irradiance levels
- Seasonal adjustment factors
- Historical weather patterns

### Dynamic Roof Analysis
- Roof area measurement
- Orientation detection (degrees from south)
- Tilt angle calculation
- Shading obstacle identification

## User Experience Flow

### 1. Initial Load
- Display satellite view of user's address
- Show movable pin at center
- Load default RGB layer

### 2. Pin Movement
- User drags pin to specific roof location
- Real-time coordinate updates
- Immediate data refresh for new location

### 3. Layer Exploration
- Toggle between different view types
- Compare solar potential across roof areas
- Analyze shade patterns by time/season

### 4. Data Analysis
- Display comprehensive solar metrics
- Show optimal system configuration
- Generate savings projections

## Performance Considerations

### Caching Strategy
- Cache GeoTIFF downloads (30-day limit)
- Store processed data for revisited locations
- Implement efficient data layer switching

### API Optimization
- Batch requests for multiple data layers
- Use appropriate quality levels (HIGH/MEDIUM/LOW)
- Implement request throttling and error handling

### Rendering Performance
- Efficient canvas rendering for GeoTIFF overlays
- Progressive loading for large datasets
- Optimize for mobile devices

## Error Handling & Edge Cases

### API Limitations
- Handle areas outside coverage
- Manage rate limits and quotas
- Fallback for unavailable data layers

### Data Quality Issues
- Handle invalid data points (-9999 values)
- Manage low-quality imagery areas
- Provide user feedback for data limitations

### User Experience
- Loading states during data processing
- Error messages for failed requests
- Guidance for optimal pin placement

## Success Metrics
- Real-time solar data accuracy
- Smooth pin movement and data updates
- Comprehensive roof analysis
- User-friendly layer switching
- Accurate savings calculations

## Next Steps After Plan Approval
1. Install required dependencies
2. Implement core API services
3. Create interactive map component
4. Build data visualization panel
5. Integrate with Step 4 of calculator modal
6. Test with real Irish addresses
7. Optimize performance and user experience