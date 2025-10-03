/**
 * Statistical Analysis Service for A/B Testing
 * Production-ready statistical calculations with confidence intervals
 */

export interface StatisticalResult {
  conversionRateA: number;
  conversionRateB: number;
  conversionRateDifference: number;
  relativeLift: number;
  confidenceLevel: number;
  pValue: number;
  zScore: number;
  isStatisticallySignificant: boolean;
  requiredSampleSize: number;
  powerAnalysis: {
    power: number;
    betaError: number;
    alphaError: number;
  };
  recommendation: 'continue' | 'stop_winner_A' | 'stop_winner_B' | 'inconclusive';
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface ABTestData {
  visitorsA: number;
  conversionsA: number;
  visitorsB: number;
  conversionsB: number;
  confidenceLevel?: number; // Default 95%
  minimumDetectableEffect?: number; // Default 10%
  statisticalPower?: number; // Default 80%
}

export class StatisticsService {
  
  /**
   * Calculate comprehensive statistical analysis for A/B test
   */
  calculateStatistics(data: ABTestData): StatisticalResult {
    const {
      visitorsA,
      conversionsA,
      visitorsB,
      conversionsB,
      confidenceLevel = 95,
      minimumDetectableEffect = 0.1,
      statisticalPower = 0.8
    } = data;

    // Basic conversion rates
    const conversionRateA = visitorsA > 0 ? conversionsA / visitorsA : 0;
    const conversionRateB = visitorsB > 0 ? conversionsB / visitorsB : 0;
    const conversionRateDifference = conversionRateB - conversionRateA;
    const relativeLift = conversionRateA > 0 ? (conversionRateDifference / conversionRateA) * 100 : 0;

    // Z-test for two proportions
    const { zScore, pValue } = this.calculateZTest(
      conversionRateA, visitorsA,
      conversionRateB, visitorsB
    );

    // Statistical significance
    const alphaLevel = (100 - confidenceLevel) / 100;
    const isStatisticallySignificant = pValue < alphaLevel;

    // Confidence interval for the difference
    const confidenceInterval = this.calculateConfidenceInterval(
      conversionRateA, visitorsA,
      conversionRateB, visitorsB,
      confidenceLevel
    );

    // Sample size calculation
    const requiredSampleSize = this.calculateRequiredSampleSize(
      conversionRateA,
      minimumDetectableEffect,
      alphaLevel,
      statisticalPower
    );

    // Power analysis
    const powerAnalysis = this.calculatePowerAnalysis(
      conversionRateA, visitorsA,
      conversionRateB, visitorsB,
      alphaLevel
    );

    // Recommendation based on statistical analysis
    const recommendation = this.getRecommendation(
      conversionRateA,
      conversionRateB,
      isStatisticallySignificant,
      Math.min(visitorsA, visitorsB),
      requiredSampleSize,
      confidenceInterval
    );

    return {
      conversionRateA,
      conversionRateB,
      conversionRateDifference,
      relativeLift,
      confidenceLevel,
      pValue,
      zScore,
      isStatisticallySignificant,
      requiredSampleSize,
      powerAnalysis,
      recommendation,
      confidenceInterval
    };
  }

  /**
   * Calculate Z-test for two proportions
   */
  private calculateZTest(p1: number, n1: number, p2: number, n2: number): { zScore: number; pValue: number } {
    if (n1 === 0 || n2 === 0) {
      return { zScore: 0, pValue: 1 };
    }

    // Pooled proportion
    const pooledP = (p1 * n1 + p2 * n2) / (n1 + n2);
    
    // Standard error
    const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
    
    if (standardError === 0) {
      return { zScore: 0, pValue: 1 };
    }

    // Z-score
    const zScore = (p2 - p1) / standardError;
    
    // Two-tailed p-value
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

    return { zScore, pValue };
  }

  /**
   * Calculate confidence interval for difference in proportions
   */
  private calculateConfidenceInterval(
    p1: number, n1: number,
    p2: number, n2: number,
    confidenceLevel: number
  ): { lower: number; upper: number } {
    if (n1 === 0 || n2 === 0) {
      return { lower: 0, upper: 0 };
    }

    const difference = p2 - p1;
    
    // Standard error for difference
    const se1 = p1 * (1 - p1) / n1;
    const se2 = p2 * (1 - p2) / n2;
    const standardError = Math.sqrt(se1 + se2);
    
    // Critical value (z-score for confidence level)
    const zCritical = this.getZCritical(confidenceLevel);
    
    // Margin of error
    const marginOfError = zCritical * standardError;
    
    return {
      lower: difference - marginOfError,
      upper: difference + marginOfError
    };
  }

  /**
   * Calculate required sample size per variation
   */
  private calculateRequiredSampleSize(
    baselineConversionRate: number,
    minimumDetectableEffect: number,
    alpha: number,
    power: number
  ): number {
    if (baselineConversionRate === 0) {
      return 1000; // Default minimum
    }

    // Effect size (new conversion rate)
    const newConversionRate = baselineConversionRate * (1 + minimumDetectableEffect);
    
    // Z-scores for alpha and beta
    const zAlpha = this.getZScore(alpha / 2); // Two-tailed
    const zBeta = this.getZScore(1 - power);
    
    // Pooled proportion
    const pooledP = (baselineConversionRate + newConversionRate) / 2;
    
    // Sample size calculation (per group)
    const numerator = Math.pow(zAlpha + zBeta, 2) * 2 * pooledP * (1 - pooledP);
    const denominator = Math.pow(newConversionRate - baselineConversionRate, 2);
    
    return Math.ceil(numerator / denominator);
  }

  /**
   * Calculate power analysis
   */
  private calculatePowerAnalysis(
    p1: number, n1: number,
    p2: number, n2: number,
    alpha: number
  ): { power: number; betaError: number; alphaError: number } {
    if (n1 === 0 || n2 === 0) {
      return { power: 0, betaError: 1, alphaError: alpha };
    }

    // Effect size
    const effectSize = Math.abs(p2 - p1);
    
    // Pooled standard deviation
    const pooledP = (p1 * n1 + p2 * n2) / (n1 + n2);
    const pooledSD = Math.sqrt(pooledP * (1 - pooledP));
    
    // Standard error
    const standardError = pooledSD * Math.sqrt(1/n1 + 1/n2);
    
    // Non-centrality parameter
    const delta = effectSize / standardError;
    
    // Critical value
    const zCritical = this.getZScore(alpha / 2);
    
    // Power calculation (approximation)
    const power = 1 - this.normalCDF(zCritical - delta);
    
    return {
      power: Math.max(0, Math.min(1, power)),
      betaError: 1 - power,
      alphaError: alpha
    };
  }

  /**
   * Get recommendation based on statistical analysis
   */
  private getRecommendation(
    conversionRateA: number,
    conversionRateB: number,
    isSignificant: boolean,
    currentSampleSize: number,
    requiredSampleSize: number,
    confidenceInterval: { lower: number; upper: number }
  ): 'continue' | 'stop_winner_A' | 'stop_winner_B' | 'inconclusive' {
    // Not enough data yet
    if (currentSampleSize < requiredSampleSize * 0.8) {
      return 'continue';
    }

    // Statistically significant result
    if (isSignificant) {
      if (conversionRateB > conversionRateA) {
        return 'stop_winner_B';
      } else {
        return 'stop_winner_A';
      }
    }

    // Check if we can rule out meaningful difference
    const meaningfulDifference = 0.02; // 2% minimum meaningful difference
    if (Math.abs(confidenceInterval.upper) < meaningfulDifference && 
        Math.abs(confidenceInterval.lower) < meaningfulDifference) {
      return 'inconclusive';
    }

    // Need more data
    return 'continue';
  }

  /**
   * Normal cumulative distribution function approximation
   */
  private normalCDF(x: number): number {
    // Abramowitz and Stegun approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    
    return x > 0 ? 1 - prob : prob;
  }

  /**
   * Get Z-critical value for confidence level
   */
  private getZCritical(confidenceLevel: number): number {
    const alpha = (100 - confidenceLevel) / 100;
    return this.getZScore(alpha / 2);
  }

  /**
   * Get Z-score for given probability
   */
  private getZScore(probability: number): number {
    // Approximation for common values
    const zTable: { [key: string]: number } = {
      '0.005': 2.576,  // 99% confidence
      '0.01': 2.326,   // 98% confidence
      '0.025': 1.96,   // 95% confidence
      '0.05': 1.645,   // 90% confidence
      '0.1': 1.282,    // 80% confidence
      '0.2': 0.842     // 60% confidence
    };

    const key = probability.toFixed(3);
    if (zTable[key]) {
      return zTable[key];
    }

    // Linear interpolation for other values
    if (probability <= 0.005) return 2.576;
    if (probability >= 0.2) return 0.842;

    // Simple approximation
    return -1 * this.normalInverse(probability);
  }

  /**
   * Inverse normal distribution approximation
   */
  private normalInverse(p: number): number {
    // Beasley-Springer-Moro algorithm approximation
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 
               1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 
               6.680131188771972e+01, -1.328068155288572e+01];
    
    if (p <= 0.5) {
      const r = Math.sqrt(-2 * Math.log(p));
      return (((((a[5] * r + a[4]) * r + a[3]) * r + a[2]) * r + a[1]) * r + a[0]) /
             ((((b[4] * r + b[3]) * r + b[2]) * r + b[1]) * r + 1);
    } else {
      const r = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((a[5] * r + a[4]) * r + a[3]) * r + a[2]) * r + a[1]) * r + a[0]) /
              ((((b[4] * r + b[3]) * r + b[2]) * r + b[1]) * r + 1);
    }
  }

  /**
   * Format statistical results for display
   */
  formatResults(results: StatisticalResult): {
    summary: string;
    details: { [key: string]: string };
    charts: { [key: string]: any };
  } {
    const summary = this.generateSummary(results);
    const details = this.formatDetails(results);
    const charts = this.generateChartData(results);

    return { summary, details, charts };
  }

  private generateSummary(results: StatisticalResult): string {
    const { conversionRateA, conversionRateB, relativeLift, isStatisticallySignificant, recommendation } = results;
    
    const winnerText = conversionRateB > conversionRateA ? 'Variant B' : 'Variant A';
    const liftText = Math.abs(relativeLift).toFixed(1);
    
    if (isStatisticallySignificant) {
      return `${winnerText} is winning with a ${liftText}% lift (statistically significant)`;
    } else {
      return `Test is ongoing. Current leader: ${winnerText} (+${liftText}%). More data needed for significance.`;
    }
  }

  private formatDetails(results: StatisticalResult): { [key: string]: string } {
    return {
      'Conversion Rate A': `${(results.conversionRateA * 100).toFixed(2)}%`,
      'Conversion Rate B': `${(results.conversionRateB * 100).toFixed(2)}%`,
      'Relative Lift': `${results.relativeLift.toFixed(2)}%`,
      'Confidence Level': `${results.confidenceLevel}%`,
      'P-Value': results.pValue.toFixed(4),
      'Z-Score': results.zScore.toFixed(3),
      'Statistical Significance': results.isStatisticallySignificant ? 'Yes' : 'No',
      'Required Sample Size': results.requiredSampleSize.toLocaleString(),
      'Statistical Power': `${(results.powerAnalysis.power * 100).toFixed(1)}%`,
      'Confidence Interval': `[${(results.confidenceInterval.lower * 100).toFixed(2)}%, ${(results.confidenceInterval.upper * 100).toFixed(2)}%]`,
      'Recommendation': results.recommendation.replace('_', ' ').toUpperCase()
    };
  }

  private generateChartData(results: StatisticalResult): { [key: string]: any } {
    return {
      conversionRates: {
        labels: ['Variant A', 'Variant B'],
        data: [results.conversionRateA * 100, results.conversionRateB * 100],
        type: 'bar'
      },
      confidenceInterval: {
        center: results.conversionRateDifference * 100,
        lower: results.confidenceInterval.lower * 100,
        upper: results.confidenceInterval.upper * 100,
        type: 'interval'
      },
      powerAnalysis: {
        current: results.powerAnalysis.power * 100,
        target: 80,
        type: 'gauge'
      }
    };
  }
}

export const statisticsService = new StatisticsService();