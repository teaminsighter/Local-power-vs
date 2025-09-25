// Building Insights API Types

export interface BuildingInsightsRequest {
  location: {
    latitude: number;
    longitude: number;
  };
  requiredQuality: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BuildingInsightsResponse {
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  imageryDate: {
    year: number;
    month: number;
    day: number;
  };
  postalCode: string;
  administrativeArea: string;
  statisticalArea: string;
  regionCode: string;
  solarPotential: SolarPotential;
  imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  imageryProcessedDate: {
    year: number;
    month: number;
    day: number;
  };
}

export interface SolarPotential {
  maxArrayPanelsCount: number;
  maxArrayAreaMeters2: number;
  maxSunshineHoursPerYear: number;
  carbonOffsetFactorKgPerMwh: number;
  wholeRoofStats: RoofStats;
  roofSegmentStats: RoofSegment[];
  solarPanelConfigs: PanelConfiguration[];
  financialAnalyses: FinancialAnalysis[];
  panelCapacityWatts: number;
  panelHeightMeters: number;
  panelWidthMeters: number;
  panelLifetimeYears: number;
  buildingStats: RoofStats;
  solarPanels: SolarPanel[];
}

export interface RoofStats {
  areaMeters2: number;
  sunshineQuantiles: number[];
  groundAreaMeters2: number;
}

export interface RoofSegment {
  pitchDegrees: number;
  azimuthDegrees: number;
  stats: RoofStats;
  center: {
    latitude: number;
    longitude: number;
  };
  boundingBox: {
    sw: {
      latitude: number;
      longitude: number;
    };
    ne: {
      latitude: number;
      longitude: number;
    };
  };
  planeHeightAtCenterMeters: number;
}

export interface PanelConfiguration {
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  roofSegmentSummaries: RoofSegmentSummary[];
}

export interface RoofSegmentSummary {
  pitchDegrees: number;
  azimuthDegrees: number;
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  segmentIndex: number;
}

export interface FinancialAnalysis {
  monthlyBill: {
    currencyCode: string;
    units: string;
  };
  panelConfigIndex: number;
  financialDetails?: FinancialDetails;
  leasingSavings?: LeasingSavings;
  cashPurchaseSavings?: CashPurchaseSavings;
  financedPurchaseSavings?: FinancedPurchaseSavings;
}

export interface FinancialDetails {
  initialAcKwhPerYear: number;
  remainingLifetimeUtilityBill: Money;
  federalIncentive: Money;
  stateIncentive: Money;
  utilityIncentive: Money;
  lifetimeSrecTotal: Money;
  costOfElectricityWithoutSolar: Money;
  netMeteringAllowed: boolean;
  solarPercentage: number;
  percentageExportedToGrid: number;
}

export interface LeasingSavings {
  leasesAllowed: boolean;
  leasesSupported: boolean;
  annualLeasingCost: Money;
  savings: SavingsDetails;
}

export interface CashPurchaseSavings {
  outOfPocketCost: Money;
  upfrontCost: Money;
  rebateValue: Money;
  paybackYears: number;
  savings: SavingsDetails;
}

export interface FinancedPurchaseSavings {
  annualLoanPayment: Money;
  rebateValue: Money;
  loanInterestRate: number;
  savings: SavingsDetails;
}

export interface SavingsDetails {
  savingsYear1: Money;
  savingsYear20: Money;
  presentValueOfSavingsYear20: Money;
  financiallyViable: boolean;
  savingsLifetime: Money;
  presentValueOfSavingsLifetime: Money;
}

export interface Money {
  currencyCode: string;
  units?: string;
  nanos?: number;
}

export interface SolarPanel {
  center: {
    latitude: number;
    longitude: number;
  };
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  yearlyEnergyDcKwh: number;
  segmentIndex: number;
}

// Processed data for UI components
export interface ProcessedBuildingData {
  buildingId: string;
  center: {
    latitude: number;
    longitude: number;
  };
  maxPanels: number;
  totalRoofArea: number;
  roofSegments: ProcessedRoofSegment[];
  panelConfigs: PanelConfiguration[];
  optimalPanelLocations: SolarPanel[];
  panelDimensions: {
    width: number;
    height: number;
    capacity: number;
  };
  financialData: FinancialAnalysis[];
  imageryQuality: string;
}

export interface ProcessedRoofSegment {
  index: number;
  area: number;
  pitch: number;
  azimuth: number;
  center: {
    latitude: number;
    longitude: number;
  };
  bounds: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
  sunshineHours: number[];
  color: string; // For visualization
}

export interface LivePanelCalculation {
  panelCount: number;
  annualEnergyKwh: number;
  monthlySavingsEur: number;
  systemSizeKw: number;
  roofCoveragePercent: number;
  co2OffsetKgPerYear: number;
  paybackYears?: number;
  totalCostEur?: number;
}