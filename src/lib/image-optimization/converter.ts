/**
 * Image Format Conversion and Optimization Utilities
 * Handles WebP, AVIF conversion and quality optimization
 */

export interface ImageConversionOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface OptimizedImageUrls {
  webp?: string;
  avif?: string;
  jpeg?: string;
  original?: string;
  fallback: string;
}

/**
 * Browser capability detection
 */
export class BrowserCapabilities {
  private static webpSupport: boolean | null = null;
  private static avifSupport: boolean | null = null;

  static async supportsWebP(): Promise<boolean> {
    if (this.webpSupport !== null) return this.webpSupport;
    
    if (typeof window === 'undefined') return false;

    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        this.webpSupport = webP.height === 2;
        resolve(this.webpSupport);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  static async supportsAVIF(): Promise<boolean> {
    if (this.avifSupport !== null) return this.avifSupport;
    
    if (typeof window === 'undefined') return false;

    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        this.avifSupport = avif.height === 2;
        resolve(this.avifSupport);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }

  static async getBestSupportedFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
    if (await this.supportsAVIF()) return 'avif';
    if (await this.supportsWebP()) return 'webp';
    return 'jpeg';
  }
}

/**
 * Image URL generator for different formats and optimizations
 */
export class ImageUrlGenerator {
  /**
   * Generate optimized URLs for multiple formats
   */
  static generateOptimizedUrls(
    src: string,
    options: ImageConversionOptions = {}
  ): OptimizedImageUrls {
    const {
      quality = 75,
      width,
      height,
      fit = 'cover'
    } = options;

    const baseParams = new URLSearchParams();
    if (width) baseParams.set('w', width.toString());
    if (height) baseParams.set('h', height.toString());
    if (quality) baseParams.set('q', quality.toString());
    if (fit) baseParams.set('fit', fit);

    const urls: OptimizedImageUrls = {
      fallback: src
    };

    // Generate Next.js optimized URLs for each format
    if (this.isOptimizable(src)) {
      // WebP version
      const webpParams = new URLSearchParams(baseParams);
      webpParams.set('f', 'webp');
      urls.webp = `/_next/image?url=${encodeURIComponent(src)}&${webpParams.toString()}`;

      // AVIF version (if supported by Next.js config)
      const avifParams = new URLSearchParams(baseParams);
      avifParams.set('f', 'avif');
      urls.avif = `/_next/image?url=${encodeURIComponent(src)}&${avifParams.toString()}`;

      // JPEG fallback
      const jpegParams = new URLSearchParams(baseParams);
      jpegParams.set('f', 'jpeg');
      urls.jpeg = `/_next/image?url=${encodeURIComponent(src)}&${jpegParams.toString()}`;

      urls.fallback = urls.jpeg || src;
    }

    return urls;
  }

  /**
   * Get the best format URL based on browser capabilities
   */
  static async getBestFormatUrl(
    src: string,
    options: ImageConversionOptions = {}
  ): Promise<string> {
    const urls = this.generateOptimizedUrls(src, options);
    const bestFormat = await BrowserCapabilities.getBestSupportedFormat();

    switch (bestFormat) {
      case 'avif':
        return urls.avif || urls.webp || urls.fallback;
      case 'webp':
        return urls.webp || urls.fallback;
      default:
        return urls.fallback;
    }
  }

  /**
   * Check if image can be optimized by Next.js
   */
  private static isOptimizable(src: string): boolean {
    // External URLs and relative paths can be optimized
    return !src.startsWith('data:') && !src.includes('/_next/image');
  }

  /**
   * Generate responsive srcSet for multiple formats
   */
  static generateResponsiveSrcSet(
    src: string,
    sizes: number[] = [640, 750, 828, 1080, 1200, 1920],
    options: Omit<ImageConversionOptions, 'width'> = {}
  ): { webp: string; avif: string; jpeg: string } {
    const generateSrcSet = (format: 'webp' | 'avif' | 'jpeg') => {
      return sizes
        .map(size => {
          const urls = this.generateOptimizedUrls(src, { ...options, width: size });
          const url = urls[format] || urls.fallback;
          return `${url} ${size}w`;
        })
        .join(', ');
    };

    return {
      webp: generateSrcSet('webp'),
      avif: generateSrcSet('avif'),
      jpeg: generateSrcSet('jpeg')
    };
  }
}

/**
 * Client-side image optimization utilities
 */
export class ClientImageOptimizer {
  /**
   * Convert canvas to optimized blob
   */
  static async canvasToOptimizedBlob(
    canvas: HTMLCanvasElement,
    format: 'webp' | 'jpeg' | 'png' = 'webp',
    quality: number = 0.8
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        `image/${format}`,
        quality
      );
    });
  }

  /**
   * Resize image on client side
   */
  static async resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.8
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(null);
          return;
        }

        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and convert
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => resolve(blob),
          'image/webp',
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate progressive JPEG data URL for blur placeholders
   */
  static generateBlurDataUrl(
    width: number = 10,
    height: number = 10,
    color: string = '#f3f4f6'
  ): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Create blur effect
    ctx.filter = 'blur(5px)';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL('image/jpeg', 0.1);
  }
}

/**
 * Image preloading utilities
 */
export class ImagePreloader {
  private static cache = new Map<string, Promise<void>>();

  /**
   * Preload an image
   */
  static async preload(src: string): Promise<void> {
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });

    this.cache.set(src, promise);
    return promise;
  }

  /**
   * Preload multiple images with priority
   */
  static async preloadBatch(
    urls: string[],
    options: { priority?: boolean; delay?: number } = {}
  ): Promise<void> {
    const { priority = false, delay = 0 } = options;

    const preloadWithDelay = (url: string, index: number) => {
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          this.preload(url).then(resolve).catch(reject);
        }, delay * index);
      });
    };

    if (priority) {
      // Preload all immediately
      await Promise.all(urls.map(url => this.preload(url)));
    } else {
      // Preload with delay between each
      await Promise.all(
        urls.map((url, index) => preloadWithDelay(url, index))
      );
    }
  }

  /**
   * Preload critical images on page load
   */
  static preloadCritical(urls: string[]): void {
    // Use requestIdleCallback for non-blocking preload
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadBatch(urls, { priority: true });
      });
    } else {
      setTimeout(() => {
        this.preloadBatch(urls, { priority: true });
      }, 100);
    }
  }
}

/**
 * Performance monitoring for images
 */
export class ImagePerformanceMonitor {
  private static metrics = new Map<string, number>();

  /**
   * Measure image load time
   */
  static measureLoadTime(src: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      this.metrics.set(src, loadTime);
      
      // Log slow loading images
      if (loadTime > 2000) {
        console.warn(`Slow image load: ${src} took ${loadTime.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Get performance metrics
   */
  static getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  /**
   * Report Core Web Vitals for images
   */
  static reportCLSForImage(element: HTMLImageElement): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            console.log('Image CLS detected:', entry.value, element.src);
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }
}

export {
  BrowserCapabilities,
  ImageUrlGenerator,
  ClientImageOptimizer,
  ImagePreloader,
  ImagePerformanceMonitor
};