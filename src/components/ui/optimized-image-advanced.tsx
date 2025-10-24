'use client';

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  loading?: 'eager' | 'lazy';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

interface ResponsiveImageConfig {
  src: string;
  breakpoint: number;
  width: number;
  height: number;
}

interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'src' | 'width' | 'height'> {
  sources: ResponsiveImageConfig[];
  fallbackSrc: string;
  fallbackWidth: number;
  fallbackHeight: number;
}

// WebP detection and conversion utilities (client-side only)
const supportsWebP = typeof window !== 'undefined' ? (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})() : false;

export function getOptimizedImageUrl(
  src: string,
  width: number,
  quality: number = 75,
  format: 'webp' | 'avif' | 'auto' = 'auto'
): string {
  // If it's already an optimized URL, return as-is
  if (src.includes('/_next/image') || src.includes('f_auto') || src.includes('w_')) {
    return src;
  }

  // For external images, use Next.js Image Optimization API
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString(),
  });

  return `/_next/image?${params.toString()}`;
}

export function generateSrcSet(
  src: string,
  sizes: number[] = [640, 750, 828, 1080, 1200, 1920],
  quality: number = 75
): string {
  return sizes
    .map(size => `${getOptimizedImageUrl(src, size, quality)} ${size}w`)
    .join(', ');
}

// Generate blur placeholder data URL (client-side only)
export function generateBlurDataURL(width: number = 8, height: number = 8): string {
  if (typeof window === 'undefined') {
    // Return a simple data URL for server-side rendering
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Create a simple gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

// Enhanced Optimized Image Component
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  loading = 'lazy',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = !blurDataURL && placeholder === 'blur' 
    ? generateBlurDataURL(width, height) 
    : blurDataURL;

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (
    width 
      ? `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`
      : '100vw'
  );

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-200 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={!fill ? { width, height } : undefined}
    >
      {(isInView || priority) && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          sizes={responsiveSizes}
          quality={quality}
          priority={priority}
          loading={loading}
          placeholder={placeholder}
          blurDataURL={defaultBlurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            fill ? 'object-cover' : ''
          )}
          {...props}
        />
      )}
      
      {!isLoaded && (isInView || priority) && (
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse',
          fill ? 'w-full h-full' : ''
        )} />
      )}
    </div>
  );
}

// Responsive Image Component with Multiple Sources
export function ResponsiveImage({
  sources,
  fallbackSrc,
  fallbackWidth,
  fallbackHeight,
  alt,
  className,
  priority = false,
  quality = 75,
  ...props
}: ResponsiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(fallbackSrc);
  const [currentWidth, setCurrentWidth] = useState(fallbackWidth);
  const [currentHeight, setCurrentHeight] = useState(fallbackHeight);

  React.useEffect(() => {
    const updateImageSource = () => {
      const windowWidth = window.innerWidth;
      
      // Find the appropriate source based on current viewport
      const appropriateSource = sources
        .sort((a, b) => a.breakpoint - b.breakpoint)
        .find(source => windowWidth >= source.breakpoint) 
        || sources[sources.length - 1];

      if (appropriateSource) {
        setCurrentSrc(appropriateSource.src);
        setCurrentWidth(appropriateSource.width);
        setCurrentHeight(appropriateSource.height);
      }
    };

    updateImageSource();
    window.addEventListener('resize', updateImageSource);
    
    return () => window.removeEventListener('resize', updateImageSource);
  }, [sources]);

  return (
    <OptimizedImage
      src={currentSrc}
      width={currentWidth}
      height={currentHeight}
      alt={alt}
      className={className}
      priority={priority}
      quality={quality}
      {...props}
    />
  );
}

// Specialized Image Components
export function HeroImage({ src, alt, className, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn('w-full h-full object-cover', className)}
      priority={true}
      quality={85}
      sizes="100vw"
      fill={true}
      {...props}
    />
  );
}

export function ProductImage({ src, alt, className, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn('rounded-lg shadow-md', className)}
      quality={80}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      {...props}
    />
  );
}

export function ThumbnailImage({ src, alt, className, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn('rounded object-cover', className)}
      quality={70}
      sizes="(max-width: 768px) 25vw, 150px"
      {...props}
    />
  );
}

export function BackgroundImage({ 
  src, 
  alt, 
  children, 
  className,
  overlay = true,
  ...props 
}: OptimizedImageProps & { 
  children?: React.ReactNode;
  overlay?: boolean;
}) {
  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill={true}
        className="object-cover"
        priority={true}
        quality={85}
        sizes="100vw"
        {...props}
      />
      {overlay && (
        <div className="absolute inset-0 bg-black/30" />
      )}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}

// Image Gallery Component with Lazy Loading
interface GalleryImageProps extends OptimizedImageProps {
  index: number;
  total: number;
}

export function GalleryImage({ index, total, className, ...props }: GalleryImageProps) {
  // Prioritize first few images
  const priority = index < 3;
  
  return (
    <OptimizedImage
      className={cn('rounded-lg transition-transform hover:scale-105', className)}
      priority={priority}
      quality={index < 6 ? 80 : 70} // Higher quality for visible images
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      {...props}
    />
  );
}

export default OptimizedImage;