# Google Solar API Integration Guide

## Overview
The Google Solar API provides detailed solar information through the dataLayers endpoint, returning 17 downloadable TIFF files with comprehensive solar data.

## Data Layers Available

### Core Layers
1. **Digital Surface Model (DSM)** - 32-bit float, 0.1 m/pixel
   - Elevation data with natural and built features
   - Values in meters above sea level
   - Invalid locations stored as -9999

2. **RGB Composite Layer** - 8-bit, 0.1-1 m/pixel
   - Aerial imagery with red, green, blue bands
   - Default resolution: 0.1 m/pixel

3. **Building Mask** - 1-bit, 0.1 m/pixel
   - Identifies rooftop boundaries
   - Binary data indicating rooftop pixels

### Solar Data Layers
4. **Annual Solar Flux** - 32-bit float, 0.1 m/pixel
   - Annual sunlight yield: kWh/kW/year
   - Unmasked flux for all locations
   - Invalid areas: -9999

5. **Monthly Solar Flux** - 32-bit float, 0.5 m/pixel
   - Monthly breakdown (12 bands: Jan-Dec)
   - Values in kWh/kW/year

6. **Hourly Shade** - 32-bit integer, 1 m/pixel
   - 12 URLs for monthly shade maps
   - 24 bands per file (24 hours)
   - 32 bits per pixel (31 days max)

## API Request Structure

```typescript
const args = {
  'location.latitude': location.latitude.toFixed(5),
  'location.longitude': location.longitude.toFixed(5),
  radius_meters: radiusMeters.toString(),
  required_quality: 'LOW', // HIGH, MEDIUM, LOW
};

const params = new URLSearchParams({ ...args, key: apiKey });
const url = `https://solar.googleapis.com/v1/dataLayers:get?${params}`;
```

## Response Format
```json
{
  "imageryDate": { "year": 2022, "month": 4, "day": 6 },
  "imageryProcessedDate": { "year": 2023, "month": 8, "day": 4 },
  "dsmUrl": "https://solar.googleapis.com/v1/geoTiff:get?id=...",
  "rgbUrl": "https://solar.googleapis.com/v1/geoTiff:get?id=...",
  "maskUrl": "https://solar.googleapis.com/v1/geoTiff:get?id=...",
  "annualFluxUrl": "https://solar.googleapis.com/v1/geoTiff:get?id=...",
  "monthlyFluxUrl": "https://solar.googleapis.com/v1/geoTiff:get?id=...",
  "hourlyShadeUrls": ["https://solar.googleapis.com/v1/geoTiff:get?id=...", ...],
  "imageryQuality": "HIGH"
}
```

## Key Features for Implementation

### Hourly Shade Decoding
To check if location (x,y) saw sun at 4:00 PM on June 22:
```typescript
(hourly_shade[month - 1])(x, y)[hour] & (1 << (day - 1))
```
- Month: June = 6th URL (index 5)
- Hour: 4 PM = 16:00 = band 16
- Day: 22nd = bit 21 (0-indexed)

### GeoTIFF Processing
- URLs valid for 1 hour after generation
- Files can be stored for 30 days
- Require authentication (API key or OAuth)
- Cannot be used directly as Maps overlay images

## Required Dependencies
```bash
npm install geotiff geotiff-geokeys-to-proj4 proj4
```

## Implementation Notes
- All data is real and live, no dummy values
- Invalid locations marked as -9999
- RGB layer displays correctly, others need processing
- Coordinate reprojection required for lat/lng bounds
- Type safety with TypeScript interfaces recommended