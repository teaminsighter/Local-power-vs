/**
 * Static Asset Optimization and CDN Utilities
 * Provides optimized asset loading and CDN integration
 */

interface AssetConfig {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  width?: number;
  height?: number;
  priority?: boolean;
}

interface CDNConfig {
  enabled: boolean;
  baseUrl: string;
  imageCDN: string;
  staticCDN: string;
  version: string;
}

/**
 * CDN Configuration Manager
 */
export class CDNManager {
  private static config: CDNConfig = {
    enabled: process.env.NODE_ENV === 'production',
    baseUrl: process.env.CDN_URL || '',
    imageCDN: process.env.IMAGE_CDN_URL || '',
    staticCDN: process.env.STATIC_CDN_URL || '',
    version: process.env.ASSET_VERSION || '1.0.0'
  };

  /**
   * Get optimized asset URL
   */
  static getAssetUrl(path: string, type: 'image' | 'static' | 'font' = 'static'): string {
    if (!this.config.enabled || !this.config.baseUrl) {
      return path;
    }

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    switch (type) {
      case 'image':
        return this.config.imageCDN 
          ? `${this.config.imageCDN}/${cleanPath}`
          : `${this.config.baseUrl}/${cleanPath}`;
      
      case 'font':
        return `${this.config.baseUrl}/fonts/${cleanPath}?v=${this.config.version}`;
      
      default:
        return `${this.config.baseUrl}/${cleanPath}?v=${this.config.version}`;
    }
  }

  /**
   * Get optimized image URL with Next.js Image API
   */
  static getOptimizedImageUrl(
    src: string, 
    config: AssetConfig = {}
  ): string {
    if (!src) return '';
    
    // If it's already an external URL, return as-is
    if (src.startsWith('http')) {
      return src;
    }

    // For local images, ensure they start with /
    const imagePath = src.startsWith('/') ? src : `/${src}`;
    
    // In development or if CDN is disabled, return local path
    if (!this.config.enabled) {
      return imagePath;
    }

    return this.getAssetUrl(imagePath, 'image');
  }

  /**
   * Generate responsive image srcSet
   */
  static generateSrcSet(
    src: string, 
    sizes: number[] = [640, 768, 1024, 1280, 1536]
  ): string {
    const baseSrc = this.getOptimizedImageUrl(src);
    
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=75 ${size}w`)
      .join(', ');
  }

  /**
   * Preload critical assets
   */
  static preloadAssets(assets: Array<{
    href: string;
    as: 'image' | 'font' | 'script' | 'style';
    type?: string;
    crossorigin?: boolean;
  }>): string {
    return assets
      .map(asset => {
        const href = asset.as === 'image' 
          ? this.getOptimizedImageUrl(asset.href)
          : this.getAssetUrl(asset.href, asset.as === 'font' ? 'font' : 'static');
        
        const attrs = [
          `rel="preload"`,
          `href="${href}"`,
          `as="${asset.as}"`,
          asset.type ? `type="${asset.type}"` : '',
          asset.crossorigin ? 'crossorigin' : ''
        ].filter(Boolean).join(' ');
        
        return `<link ${attrs}>`;
      })
      .join('\n');
  }
}

/**
 * Image Optimization Utilities
 */
export class ImageOptimizer {
  /**
   * Get optimized image props for Next.js Image component
   */
  static getImageProps(
    src: string,
    alt: string,
    config: AssetConfig = {}
  ) {
    const optimizedSrc = CDNManager.getOptimizedImageUrl(src, config);
    
    return {
      src: optimizedSrc,
      alt,
      quality: config.quality || 85,
      width: config.width,
      height: config.height,
      priority: config.priority || false,
      placeholder: 'blur' as const,
      blurDataURL: this.generateBlurDataURL(config.width || 400, config.height || 300),
      sizes: this.generateSizes(config.width),
    };
  }

  /**
   * Generate blur placeholder
   */
  private static generateBlurDataURL(width: number, height: number): string {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  /**
   * Generate responsive sizes attribute
   */
  private static generateSizes(width?: number): string {
    if (width && width <= 400) {
      return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw';
    }
    
    if (width && width <= 800) {
      return '(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 50vw';
    }
    
    return '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw';
  }

  /**
   * Lazy load images with intersection observer
   */
  static setupLazyLoading(): string {
    return `
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
          imageObserver.observe(img);
        });
      }
    `;
  }
}

/**
 * Font Optimization Manager
 */
export class FontOptimizer {
  /**
   * Generate font preload links
   */
  static generateFontPreloads(fonts: Array<{
    family: string;
    weight?: string;
    style?: string;
    display?: 'swap' | 'block' | 'fallback' | 'optional';
  }>): string {
    return fonts
      .map(font => {
        const fontUrl = CDNManager.getAssetUrl(
          `${font.family.toLowerCase().replace(/\s+/g, '-')}.woff2`,
          'font'
        );
        
        return `<link rel="preload" href="${fontUrl}" as="font" type="font/woff2" crossorigin>`;
      })
      .join('\n');
  }

  /**
   * Generate font-display CSS
   */
  static generateFontCSS(fonts: Array<{
    family: string;
    weight?: string;
    style?: string;
    display?: 'swap' | 'block' | 'fallback' | 'optional';
  }>): string {
    return fonts
      .map(font => {
        const fontUrl = CDNManager.getAssetUrl(
          `${font.family.toLowerCase().replace(/\s+/g, '-')}.woff2`,
          'font'
        );
        
        return `
          @font-face {
            font-family: '${font.family}';
            src: url('${fontUrl}') format('woff2');
            font-weight: ${font.weight || 'normal'};
            font-style: ${font.style || 'normal'};
            font-display: ${font.display || 'swap'};
          }
        `;
      })
      .join('\n');
  }
}

/**
 * Resource Hints Manager
 */
export class ResourceHints {
  /**
   * Generate DNS prefetch links
   */
  static generateDNSPrefetch(domains: string[]): string {
    return domains
      .map(domain => `<link rel="dns-prefetch" href="//${domain}">`)
      .join('\n');
  }

  /**
   * Generate preconnect links
   */
  static generatePreconnect(origins: Array<{
    href: string;
    crossorigin?: boolean;
  }>): string {
    return origins
      .map(origin => {
        const crossorigin = origin.crossorigin ? ' crossorigin' : '';
        return `<link rel="preconnect" href="${origin.href}"${crossorigin}>`;
      })
      .join('\n');
  }

  /**
   * Generate critical resource hints for head
   */
  static generateCriticalHints(): string {
    const hints = [];

    // DNS prefetch for external domains
    hints.push(this.generateDNSPrefetch([
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'firebasestorage.googleapis.com',
      'maps.googleapis.com'
    ]));

    // Preconnect to critical origins
    hints.push(this.generatePreconnect([
      { href: 'https://fonts.googleapis.com' },
      { href: 'https://fonts.gstatic.com', crossorigin: true }
    ]));

    // Critical asset preloads
    hints.push(CDNManager.preloadAssets([
      {
        href: '/fonts/GeistVF.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: true
      },
      {
        href: '/fonts/GeistMonoVF.woff2', 
        as: 'font',
        type: 'font/woff2',
        crossorigin: true
      }
    ]));

    return hints.filter(Boolean).join('\n');
  }
}

/**
 * Performance Monitoring for Assets
 */
export class AssetPerformanceMonitor {
  /**
   * Monitor largest contentful paint
   */
  static monitorLCP(): string {
    return `
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('LCP candidate:', entry.startTime, entry.element);
          
          // Track to analytics if available
          if (typeof gtag !== 'undefined') {
            gtag('event', 'LCP', {
              custom_parameter_1: entry.startTime,
              custom_parameter_2: entry.element?.tagName
            });
          }
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    `;
  }

  /**
   * Monitor cumulative layout shift
   */
  static monitorCLS(): string {
    return `
      let cumulativeLayoutShiftScore = 0;
      
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            cumulativeLayoutShiftScore += entry.value;
          }
        }
        
        console.log('Current CLS score:', cumulativeLayoutShiftScore);
        
        // Track to analytics if available
        if (typeof gtag !== 'undefined') {
          gtag('event', 'CLS', {
            custom_parameter_1: cumulativeLayoutShiftScore
          });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    `;
  }

  /**
   * Monitor first input delay
   */
  static monitorFID(): string {
    return `
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('FID:', entry.processingStart - entry.startTime);
          
          // Track to analytics if available
          if (typeof gtag !== 'undefined') {
            gtag('event', 'FID', {
              custom_parameter_1: entry.processingStart - entry.startTime
            });
          }
        }
      }).observe({ type: 'first-input', buffered: true });
    `;
  }
}

// Export main utilities
export {
  type AssetConfig,
  type CDNConfig
};