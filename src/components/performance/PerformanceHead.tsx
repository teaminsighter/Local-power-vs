/**
 * Performance Head Component
 * Injects critical resource hints and optimization tags
 */

import Head from 'next/head';
import { ResourceHints, FontOptimizer } from '@/lib/cdn/asset-optimizer';

interface PerformanceHeadProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  fonts?: Array<{
    family: string;
    weight?: string;
    style?: string;
    display?: 'swap' | 'block' | 'fallback' | 'optional';
  }>;
  criticalAssets?: Array<{
    href: string;
    as: 'image' | 'font' | 'script' | 'style';
    type?: string;
  }>;
}

export function PerformanceHead({
  title = 'Local Power - Solar + Battery Solutions',
  description = 'Professional solar panel and battery storage installation. Get your free quote today and start saving with clean energy.',
  image = '/images/solar-hero.jpg',
  canonical,
  fonts = [
    { family: 'Geist Sans', weight: '100 900', display: 'swap' },
    { family: 'Geist Mono', weight: '100 900', display: 'swap' }
  ],
  criticalAssets = []
}: PerformanceHeadProps) {
  
  // Generate critical resource hints
  const resourceHints = ResourceHints.generateCriticalHints();
  
  // Generate font preloads and CSS
  const fontPreloads = FontOptimizer.generateFontPreloads(fonts);
  const fontCSS = FontOptimizer.generateFontCSS(fonts);

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Performance Critical Resource Hints */}
      <div dangerouslySetInnerHTML={{ __html: resourceHints }} />
      
      {/* Font Optimization */}
      <div dangerouslySetInnerHTML={{ __html: fontPreloads }} />
      <style dangerouslySetInnerHTML={{ __html: fontCSS }} />
      
      {/* Critical CSS for font loading */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Font loading optimization */
          .font-loading {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          
          /* Critical above-the-fold styles */
          body {
            font-display: swap;
            text-rendering: optimizeSpeed;
          }
          
          /* Prevent layout shift during font load */
          .geist-sans {
            font-family: 'Geist Sans', system-ui, sans-serif;
            font-feature-settings: 'kern' 1, 'liga' 1;
          }
          
          .geist-mono {
            font-family: 'Geist Mono', 'SF Mono', Monaco, monospace;
            font-feature-settings: 'kern' 1;
          }
          
          /* Image loading optimization */
          img {
            content-visibility: auto;
          }
          
          /* Lazy loading placeholder */
          .img-placeholder {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
          }
          
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `
      }} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Performance and Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Theme and Mobile Optimization */}
      <meta name="theme-color" content="#059669" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Manifest for PWA */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    </Head>
  );
}

/**
 * Critical CSS Injection Component
 * For above-the-fold styles that must load immediately
 */
export function CriticalCSS() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* Critical above-the-fold styles */
        * {
          box-sizing: border-box;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        body {
          margin: 0;
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        
        /* Hero section critical styles */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #059669 0%, #065f46 100%);
        }
        
        /* Button critical styles */
        .btn-primary {
          background: #059669;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .btn-primary:hover {
          background: #047857;
        }
        
        /* Navigation critical styles */
        .nav {
          position: fixed;
          top: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          z-index: 50;
        }
        
        /* Loading states */
        .loading {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
        
        /* Responsive typography */
        h1 {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 700;
          line-height: 1.2;
        }
        
        h2 {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 600;
          line-height: 1.3;
        }
        
        /* Optimize for mobile */
        @media (max-width: 768px) {
          .hero {
            padding: 2rem 1rem;
          }
          
          .btn-primary {
            width: 100%;
            padding: 1rem;
          }
        }
      `
    }} />
  );
}

export default PerformanceHead;