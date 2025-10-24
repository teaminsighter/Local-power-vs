/**
 * Centralized Image Optimization Service
 * Provides unified interface for all image optimization needs
 */

import React from 'react';
import { ImageUrlGenerator, BrowserCapabilities, ImagePreloader } from './converter';

export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg';
  sizes?: string;
  priority?: boolean;
  blur?: boolean;
  responsive?: boolean;
}

export interface OptimizedImageData {
  src: string;
  srcSet?: string;
  sizes?: string;
  placeholder?: string;
  priority: boolean;
  quality: number;
  format: string;
}

/**
 * Main Image Optimization Service
 */
export class ImageOptimizationService {
  private static instance: ImageOptimizationService;
  private cache = new Map<string, OptimizedImageData>();
  private preloadQueue = new Set<string>();

  private constructor() {}

  static getInstance(): ImageOptimizationService {
    if (!this.instance) {
      this.instance = new ImageOptimizationService();
    }
    return this.instance;
  }

  /**
   * Get optimized image data for any source
   */
  async optimizeImage(
    src: string,
    config: ImageOptimizationConfig = {}
  ): Promise<OptimizedImageData> {
    const cacheKey = this.generateCacheKey(src, config);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const optimized = await this.generateOptimizedData(src, config);
    this.cache.set(cacheKey, optimized);
    
    return optimized;
  }

  /**
   * Generate optimized image data
   */
  private async generateOptimizedData(
    src: string,
    config: ImageOptimizationConfig
  ): Promise<OptimizedImageData> {
    const {
      quality = 75,
      format = 'auto',
      sizes,
      priority = false,
      blur = true,
      responsive = true
    } = config;

    // Determine best format
    const actualFormat = format === 'auto' 
      ? await BrowserCapabilities.getBestSupportedFormat()
      : format;

    // Generate optimized URL
    const optimizedSrc = await ImageUrlGenerator.getBestFormatUrl(src, {
      quality,
      format: actualFormat === 'jpeg' ? 'jpeg' : actualFormat
    });

    // Generate responsive srcSet if needed
    let srcSet: string | undefined;
    if (responsive) {
      const responsiveSrcSet = ImageUrlGenerator.generateResponsiveSrcSet(src, undefined, {
        quality,
        format: actualFormat === 'jpeg' ? 'jpeg' : actualFormat
      });
      srcSet = responsiveSrcSet[actualFormat] || responsiveSrcSet.jpeg;
    }

    // Generate blur placeholder
    let placeholder: string | undefined;
    if (blur) {
      placeholder = this.generateBlurPlaceholder(src);
    }

    return {
      src: optimizedSrc,
      srcSet,
      sizes: sizes || this.getDefaultSizes(),
      placeholder,
      priority,
      quality,
      format: actualFormat
    };
  }

  /**
   * Preload critical images
   */
  async preloadCriticalImages(urls: string[]): Promise<void> {
    const criticalUrls = urls.filter(url => !this.preloadQueue.has(url));
    
    criticalUrls.forEach(url => this.preloadQueue.add(url));
    
    await ImagePreloader.preloadBatch(criticalUrls, { priority: true });
  }

  /**
   * Lazy preload images on demand
   */
  async lazyPreloadImages(urls: string[]): Promise<void> {
    const lazyUrls = urls.filter(url => !this.preloadQueue.has(url));
    
    lazyUrls.forEach(url => this.preloadQueue.add(url));
    
    await ImagePreloader.preloadBatch(lazyUrls, { priority: false, delay: 100 });
  }

  /**
   * Get image optimization recommendations
   */
  getOptimizationRecommendations(src: string): {
    recommendedQuality: number;
    recommendedFormat: string;
    estimatedSavings: string;
  } {
    const isHero = src.includes('hero') || src.includes('banner');
    const isThumbnail = src.includes('thumb') || src.includes('small');
    
    let recommendedQuality = 75;
    if (isHero) recommendedQuality = 85;
    if (isThumbnail) recommendedQuality = 60;

    return {
      recommendedQuality,
      recommendedFormat: 'webp',
      estimatedSavings: isHero ? '40-60%' : '30-50%'
    };
  }

  /**
   * Generate cache key for optimization configs
   */
  private generateCacheKey(src: string, config: ImageOptimizationConfig): string {
    return `${src}-${JSON.stringify(config)}`;
  }

  /**
   * Generate blur placeholder data URL
   */
  private generateBlurPlaceholder(src: string): string {
    // Simple base64 blur placeholder
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }

  /**
   * Get default responsive sizes
   */
  private getDefaultSizes(): string {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cache.clear();
    this.preloadQueue.clear();
  }
}

/**
 * Convenient hooks and utilities for React components
 */
export class ImageOptimizationHooks {
  private static service = ImageOptimizationService.getInstance();

  /**
   * Hook for optimizing images in React components
   */
  static useOptimizedImage(
    src: string,
    config: ImageOptimizationConfig = {}
  ): OptimizedImageData | null {
    const [optimizedData, setOptimizedData] = React.useState<OptimizedImageData | null>(null);

    React.useEffect(() => {
      this.service.optimizeImage(src, config).then(setOptimizedData);
    }, [src, JSON.stringify(config)]);

    return optimizedData;
  }

  /**
   * Hook for preloading images
   */
  static useImagePreloader(urls: string[], critical: boolean = false): void {
    React.useEffect(() => {
      if (critical) {
        this.service.preloadCriticalImages(urls);
      } else {
        this.service.lazyPreloadImages(urls);
      }
    }, [urls, critical]);
  }
}

/**
 * Image optimization middleware for API routes
 */
export class ImageOptimizationMiddleware {
  /**
   * Express-like middleware for image optimization
   */
  static async optimize(req: any, res: any, next: any) {
    if (req.url?.includes('/api/images/optimize')) {
      const { src, quality, format, width, height } = req.query;
      
      try {
        const service = ImageOptimizationService.getInstance();
        const optimized = await service.optimizeImage(src, {
          quality: parseInt(quality) || 75,
          format: format || 'auto'
        });

        res.json(optimized);
      } catch (error) {
        res.status(500).json({ error: 'Image optimization failed' });
      }
    } else {
      next();
    }
  }
}

/**
 * Performance monitoring for image optimization
 */
export class ImageOptimizationAnalytics {
  private static metrics = {
    optimizationsPerformed: 0,
    cacheHitRate: 0,
    averageOptimizationTime: 0,
    formatUsage: { webp: 0, avif: 0, jpeg: 0 }
  };

  static recordOptimization(format: string, optimizationTime: number): void {
    this.metrics.optimizationsPerformed++;
    this.metrics.averageOptimizationTime = 
      (this.metrics.averageOptimizationTime + optimizationTime) / 2;
    
    if (format in this.metrics.formatUsage) {
      this.metrics.formatUsage[format as keyof typeof this.metrics.formatUsage]++;
    }
  }

  static getMetrics() {
    return { ...this.metrics };
  }

  static reportToAnalytics(): void {
    // Send metrics to analytics service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // Google Analytics
      window.gtag('event', 'image_optimization', {
        optimizations_performed: this.metrics.optimizationsPerformed,
        cache_hit_rate: this.metrics.cacheHitRate
      });
    }
  }
}

// Singleton instance
export const imageOptimization = ImageOptimizationService.getInstance();

export default ImageOptimizationService;