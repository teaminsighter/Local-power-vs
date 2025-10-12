import { NextRequest, NextResponse } from 'next/server';

/**
 * Demo Solar Locations API
 * Returns demo solar panel installation locations for map display
 */

// Demo solar installation locations across Ireland
const DEMO_SOLAR_LOCATIONS = [
  {
    id: 'demo_install_1',
    name: 'Murphy Family - Dublin 4',
    address: '123 Sandymount Road, Dublin 4, D04 ABC1',
    latitude: 53.3342,
    longitude: -6.2267,
    systemSize: 6.5,
    panelCount: 26,
    installDate: '2025-08-15',
    status: 'active',
    monthlyGeneration: 485,
    annualSavings: 2850,
    panelBrand: 'LG Solar',
    inverterType: 'SolarEdge',
    batteryIncluded: true,
    batteryCapacity: 7.7,
    customerSatisfaction: 5,
    notes: 'Excellent south-facing roof orientation'
  },
  {
    id: 'demo_install_2',
    name: 'O\'Connor Residence - Cork',
    address: '45 Patrick Street, Cork, T12 XY89',
    latitude: 51.8985,
    longitude: -8.4756,
    systemSize: 4.2,
    panelCount: 17,
    installDate: '2025-07-22',
    status: 'active',
    monthlyGeneration: 320,
    annualSavings: 1890,
    panelBrand: 'SunPower',
    inverterType: 'Enphase Microinverters',
    batteryIncluded: false,
    batteryCapacity: null,
    customerSatisfaction: 5,
    notes: 'Split array design to avoid chimney shadows'
  },
  {
    id: 'demo_install_3',
    name: 'Walsh Farm - Galway',
    address: 'Moycullen Road, Galway, H91 P2F4',
    latitude: 53.2707,
    longitude: -9.0568,
    systemSize: 12.8,
    panelCount: 51,
    installDate: '2025-06-10',
    status: 'active',
    monthlyGeneration: 965,
    annualSavings: 5420,
    panelBrand: 'Canadian Solar',
    inverterType: 'SMA String Inverter',
    batteryIncluded: true,
    batteryCapacity: 13.5,
    customerSatisfaction: 5,
    notes: 'Large agricultural installation with battery backup'
  },
  {
    id: 'demo_install_4',
    name: 'Kelly Business Center - Limerick',
    address: '88 O\'Connell Street, Limerick, V94 N2X7',
    latitude: 52.6638,
    longitude: -8.6267,
    systemSize: 8.4,
    panelCount: 34,
    installDate: '2025-09-05',
    status: 'commissioned',
    monthlyGeneration: 625,
    annualSavings: 3750,
    panelBrand: 'Jinko Solar',
    inverterType: 'Huawei String Inverter',
    batteryIncluded: false,
    batteryCapacity: null,
    customerSatisfaction: 4,
    notes: 'Commercial installation with high efficiency panels'
  },
  {
    id: 'demo_install_5',
    name: 'Thompson Home - Waterford',
    address: '67 The Quay, Waterford, X91 HK23',
    latitude: 52.2593,
    longitude: -7.1101,
    systemSize: 5.5,
    panelCount: 22,
    installDate: '2025-08-28',
    status: 'active',
    monthlyGeneration: 415,
    annualSavings: 2480,
    panelBrand: 'Trina Solar',
    inverterType: 'SolarEdge Power Optimizers',
    batteryIncluded: true,
    batteryCapacity: 5.2,
    customerSatisfaction: 5,
    notes: 'Coastal location with salt air considerations'
  },
  {
    id: 'demo_install_6',
    name: 'Ryan Cottage - Kilkenny',
    address: '34 High Street, Kilkenny, R95 E4T2',
    latitude: 52.6541,
    longitude: -7.2448,
    systemSize: 3.8,
    panelCount: 15,
    installDate: '2025-07-18',
    status: 'active',
    monthlyGeneration: 285,
    annualSavings: 1650,
    panelBrand: 'LG Solar',
    inverterType: 'Enphase Microinverters',
    batteryIncluded: false,
    batteryCapacity: null,
    customerSatisfaction: 5,
    notes: 'Historic building with careful roof integration'
  },
  {
    id: 'demo_install_7',
    name: 'Brown Farmhouse - Wexford',
    address: 'New Ross Road, Wexford, Y35 AP67',
    latitude: 52.3369,
    longitude: -6.4633,
    systemSize: 9.2,
    panelCount: 37,
    installDate: '2025-06-25',
    status: 'active',
    monthlyGeneration: 695,
    annualSavings: 4150,
    panelBrand: 'SunPower',
    inverterType: 'SMA String Inverter',
    batteryIncluded: true,
    batteryCapacity: 10.24,
    customerSatisfaction: 5,
    notes: 'Rural installation with excellent solar exposure'
  },
  {
    id: 'demo_install_8',
    name: 'Davis Modern Home - Athlone',
    address: '156 Dublin Road, Athlone, N37 XF89',
    latitude: 53.4234,
    longitude: -7.9421,
    systemSize: 7.1,
    panelCount: 28,
    installDate: '2025-09-12',
    status: 'active',
    monthlyGeneration: 535,
    annualSavings: 3200,
    panelBrand: 'Canadian Solar',
    inverterType: 'Fronius String Inverter',
    batteryIncluded: true,
    batteryCapacity: 7.7,
    customerSatisfaction: 4,
    notes: 'New build with integrated solar design'
  },
  {
    id: 'demo_install_9',
    name: 'Wilson Eco House - Sligo',
    address: '29 Wine Street, Sligo, F91 KX45',
    latitude: 54.2766,
    longitude: -8.4761,
    systemSize: 6.0,
    panelCount: 24,
    installDate: '2025-08-08',
    status: 'active',
    monthlyGeneration: 445,
    annualSavings: 2670,
    panelBrand: 'Jinko Solar',
    inverterType: 'SolarEdge Power Optimizers',
    batteryIncluded: false,
    batteryCapacity: null,
    customerSatisfaction: 5,
    notes: 'Eco-conscious customer with energy monitoring'
  },
  {
    id: 'demo_install_10',
    name: 'Quinn Holiday Home - Tralee',
    address: '78 Denny Street, Tralee, V92 CF23',
    latitude: 52.2711,
    longitude: -9.7047,
    systemSize: 4.8,
    panelCount: 19,
    installDate: '2025-07-30',
    status: 'active',
    monthlyGeneration: 360,
    annualSavings: 2160,
    panelBrand: 'Trina Solar',
    inverterType: 'Huawei String Inverter',
    batteryIncluded: true,
    batteryCapacity: 5.2,
    customerSatisfaction: 5,
    notes: 'Holiday home with smart energy management'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bounds = searchParams.get('bounds');
    const includeDetails = searchParams.get('details') === 'true';
    
    let filteredLocations = DEMO_SOLAR_LOCATIONS;
    
    // Filter by map bounds if provided
    if (bounds) {
      try {
        const [swLat, swLng, neLat, neLng] = bounds.split(',').map(Number);
        filteredLocations = DEMO_SOLAR_LOCATIONS.filter(location => 
          location.latitude >= swLat && 
          location.latitude <= neLat &&
          location.longitude >= swLng && 
          location.longitude <= neLng
        );
      } catch (boundsError) {
        console.error('Invalid bounds parameter:', boundsError);
      }
    }
    
    // Return simplified data unless details requested
    const responseData = filteredLocations.map(location => {
      if (includeDetails) {
        return location;
      } else {
        return {
          id: location.id,
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          systemSize: location.systemSize,
          status: location.status,
          monthlyGeneration: location.monthlyGeneration
        };
      }
    });
    
    return NextResponse.json({
      success: true,
      count: responseData.length,
      locations: responseData,
      summary: {
        totalInstallations: DEMO_SOLAR_LOCATIONS.length,
        activeInstallations: DEMO_SOLAR_LOCATIONS.filter(l => l.status === 'active').length,
        totalSystemSize: DEMO_SOLAR_LOCATIONS.reduce((sum, l) => sum + l.systemSize, 0),
        totalPanels: DEMO_SOLAR_LOCATIONS.reduce((sum, l) => sum + l.panelCount, 0),
        totalMonthlyGeneration: DEMO_SOLAR_LOCATIONS.reduce((sum, l) => sum + l.monthlyGeneration, 0),
        averageCustomerSatisfaction: DEMO_SOLAR_LOCATIONS.reduce((sum, l) => sum + l.customerSatisfaction, 0) / DEMO_SOLAR_LOCATIONS.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching solar locations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch solar locations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle POST requests to add new demo locations
export async function POST(request: NextRequest) {
  try {
    const newLocation = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'address', 'latitude', 'longitude', 'systemSize'];
    const missingFields = requiredFields.filter(field => !newLocation[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          missingFields 
        },
        { status: 400 }
      );
    }
    
    // In a real application, this would save to the database
    // For demo purposes, we'll return success
    const demoLocation = {
      id: `demo_install_${Date.now()}`,
      ...newLocation,
      installDate: new Date().toISOString().split('T')[0],
      status: 'active',
      customerSatisfaction: 5,
      notes: 'Demo installation added via API'
    };
    
    return NextResponse.json({
      success: true,
      message: 'Demo location added successfully',
      location: demoLocation
    });
    
  } catch (error) {
    console.error('Error adding solar location:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add solar location',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}