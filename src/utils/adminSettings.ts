// Utility functions to connect admin panel settings with the calculator

interface PricingTier {
  id: string;
  name: string;
  min_kw: number;
  max_kw: number;
  price_per_watt: number;
  installation_cost: number;
  inverter_cost: number;
  battery_cost_per_kwh?: number;
  maintenance_yearly: number;
  warranty_years: number;
  efficiency_rating: number;
}

interface RegionalPricing {
  region: string;
  electricity_rate: number;
  feed_in_tariff: number;
  installation_rebate: number;
  sales_tax: number;
}

interface CalculatorSettings {
  default_system_size: number;
  average_daily_usage: number;
  roof_efficiency_factor: number;
  degradation_rate: number;
  financing_apr: number;
  loan_term_years: number;
  inflation_rate: number;
}

interface APISettings {
  google_ads?: {
    client_id: string;
    client_secret: string;
    developer_token: string;
    refresh_token: string;
    customer_id: string;
  };
  facebook?: {
    app_id: string;
    app_secret: string;
    access_token: string;
    pixel_id: string;
  };
  ga4?: {
    measurement_id: string;
    api_secret: string;
    property_id: string;
  };
  solar_api?: {
    weather_api_key: string;
    solar_irradiance_api: string;
    electricity_prices_api: string;
  };
}

// Get pricing tier based on system size
export const getPricingTier = (systemSizeKw: number): PricingTier | null => {
  const settings = getSolarPricingSettings();
  if (!settings || !settings.pricingTiers) return null;

  return settings.pricingTiers.find((tier: PricingTier) => 
    systemSizeKw >= tier.min_kw && systemSizeKw <= tier.max_kw
  ) || null;
};

// Get regional pricing for a specific region
export const getRegionalPricing = (region?: string): RegionalPricing | null => {
  const settings = getSolarPricingSettings();
  if (!settings || !settings.regionalPricing) return null;

  const targetRegion = region || 'Central Region'; // Default region
  return settings.regionalPricing.find((r: RegionalPricing) => 
    r.region === targetRegion
  ) || settings.regionalPricing[0] || null;
};

// Get calculator settings
export const getCalculatorSettings = (): CalculatorSettings => {
  const settings = getSolarPricingSettings();
  
  // Default settings if not configured
  const defaults: CalculatorSettings = {
    default_system_size: 6.5,
    average_daily_usage: 25,
    roof_efficiency_factor: 0.85,
    degradation_rate: 0.005,
    financing_apr: 0.045,
    loan_term_years: 15,
    inflation_rate: 0.025
  };

  return settings?.calculatorSettings || defaults;
};

// Get API settings
export const getAPISettings = (): APISettings => {
  try {
    const saved = localStorage.getItem('admin_api_settings');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Get solar pricing settings from localStorage
export const getSolarPricingSettings = () => {
  try {
    const saved = localStorage.getItem('solar_pricing_settings');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// Calculate total system cost based on admin settings
export const calculateSystemCost = (systemSizeKw: number, includeBattery: boolean = false, batteryCapacityKwh: number = 0, region?: string) => {
  const pricingTier = getPricingTier(systemSizeKw);
  const regionalPricing = getRegionalPricing(region);
  
  if (!pricingTier) {
    // Fallback calculation if no pricing tier found
    return {
      panelCost: systemSizeKw * 1000 * 2.50, // €2.50 per watt fallback
      installationCost: 2500,
      inverterCost: 1500,
      batteryCost: includeBattery ? batteryCapacityKwh * 700 : 0,
      subtotal: 0,
      rebate: 0,
      tax: 0,
      total: 0
    };
  }

  const panelCost = systemSizeKw * 1000 * pricingTier.price_per_watt;
  const installationCost = pricingTier.installation_cost;
  const inverterCost = pricingTier.inverter_cost;
  const batteryCost = includeBattery && pricingTier.battery_cost_per_kwh 
    ? batteryCapacityKwh * pricingTier.battery_cost_per_kwh 
    : 0;

  const subtotal = panelCost + installationCost + inverterCost + batteryCost;
  const rebate = regionalPricing?.installation_rebate || 0;
  const tax = (subtotal - rebate) * (regionalPricing?.sales_tax || 0.21);
  const total = subtotal - rebate + tax;

  return {
    panelCost,
    installationCost,
    inverterCost,
    batteryCost,
    subtotal,
    rebate,
    tax,
    total: Math.max(0, total) // Ensure non-negative
  };
};

// Calculate energy production based on admin settings
export const calculateEnergyProduction = (systemSizeKw: number, region?: string) => {
  const settings = getCalculatorSettings();
  const regionalPricing = getRegionalPricing(region);
  const pricingTier = getPricingTier(systemSizeKw);

  // Default solar irradiance for Ireland/Europe (kWh/m²/day)
  const dailySolarIrradiance = 2.8; // Average for Ireland
  const panelEfficiency = pricingTier?.efficiency_rating || 20.1; // Default 20.1%
  
  // Calculate daily production
  const systemArea = (systemSizeKw * 1000) / (panelEfficiency * 10); // Rough panel area calculation
  const dailyProduction = systemArea * dailySolarIrradiance * (panelEfficiency / 100) * settings.roof_efficiency_factor;
  const annualProduction = dailyProduction * 365;

  return {
    dailyProduction,
    annualProduction,
    monthlyProduction: annualProduction / 12,
    systemEfficiency: panelEfficiency,
    roofEfficiencyFactor: settings.roof_efficiency_factor
  };
};

// Calculate savings based on admin settings
export const calculateSavings = (annualProductionKwh: number, dailyUsageKwh: number, region?: string) => {
  const regionalPricing = getRegionalPricing(region);
  const settings = getCalculatorSettings();
  
  if (!regionalPricing) return null;

  const annualUsageKwh = dailyUsageKwh * 365;
  const usedOnsite = Math.min(annualProductionKwh, annualUsageKwh);
  const exportedToGrid = Math.max(0, annualProductionKwh - annualUsageKwh);
  const stillNeedFromGrid = Math.max(0, annualUsageKwh - annualProductionKwh);

  const savingsFromUsage = usedOnsite * regionalPricing.electricity_rate;
  const incomeFromExport = exportedToGrid * regionalPricing.feed_in_tariff;
  const remainingElectricityCost = stillNeedFromGrid * regionalPricing.electricity_rate;

  const totalAnnualSavings = savingsFromUsage + incomeFromExport;

  return {
    usedOnsite,
    exportedToGrid,
    stillNeedFromGrid,
    savingsFromUsage,
    incomeFromExport,
    remainingElectricityCost,
    totalAnnualSavings,
    monthlySavings: totalAnnualSavings / 12
  };
};

// Calculate ROI and payback period
export const calculateROI = (totalSystemCost: number, annualSavings: number, systemSizeKw: number, region?: string) => {
  const pricingTier = getPricingTier(systemSizeKw);
  const settings = getCalculatorSettings();
  
  if (!pricingTier || annualSavings <= 0) return null;

  const annualMaintenanceCost = pricingTier.maintenance_yearly;
  const netAnnualSavings = annualSavings - annualMaintenanceCost;
  
  if (netAnnualSavings <= 0) return null;

  const paybackYears = totalSystemCost / netAnnualSavings;
  const totalLifetimeSavings = netAnnualSavings * pricingTier.warranty_years;
  const totalROI = ((totalLifetimeSavings - totalSystemCost) / totalSystemCost) * 100;

  return {
    paybackYears: Math.round(paybackYears * 10) / 10,
    totalLifetimeSavings,
    totalROI: Math.round(totalROI * 10) / 10,
    netAnnualSavings,
    warrantyYears: pricingTier.warranty_years
  };
};

// Get financing options based on admin settings
export const getFinancingOptions = (totalSystemCost: number) => {
  const settings = getCalculatorSettings();
  
  const loanAmount = totalSystemCost;
  const monthlyRate = settings.financing_apr / 12;
  const totalPayments = settings.loan_term_years * 12;
  
  // Calculate monthly payment using loan formula
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                        (Math.pow(1 + monthlyRate, totalPayments) - 1);
  
  const totalLoanCost = monthlyPayment * totalPayments;
  const totalInterest = totalLoanCost - loanAmount;

  return {
    loanAmount,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalLoanCost: Math.round(totalLoanCost * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    apr: settings.financing_apr * 100,
    termYears: settings.loan_term_years
  };
};

// Track conversion events using admin API settings
export const trackConversionEvent = async (eventName: string, eventData?: any) => {
  const apiSettings = getAPISettings();
  
  // Google Analytics 4 tracking
  if (apiSettings.ga4?.measurement_id && typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      event_category: 'Solar Calculator',
      event_label: 'Lead Generation',
      value: eventData?.systemCost || 0,
      ...eventData
    });
  }

  // Facebook Pixel tracking
  if (apiSettings.facebook?.pixel_id && typeof fbq !== 'undefined') {
    fbq('track', 'Lead', {
      value: eventData?.systemCost || 0,
      currency: 'EUR',
      content_name: 'Solar Calculator Lead',
      ...eventData
    });
  }
};

// Export all utilities as default object
export default {
  getPricingTier,
  getRegionalPricing,
  getCalculatorSettings,
  getAPISettings,
  calculateSystemCost,
  calculateEnergyProduction,
  calculateSavings,
  calculateROI,
  getFinancingOptions,
  trackConversionEvent
};