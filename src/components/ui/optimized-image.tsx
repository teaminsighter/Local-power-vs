/**
 * Optimized Image Component
 * Enhanced Next.js Image with CDN integration and performance optimizations
 */

'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { ImageOptimizer, CDNManager } from '@/lib/cdn/asset-optimizer';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  aspectRatio?: number;
  lazy?: boolean;
  fallback?: string;
  onLoadingComplete?: () => void;
  onError?: () => void;
  containerClassName?: string;
  quality?: number;
  responsive?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  aspectRatio,
  lazy = true,
  fallback,
  onLoadingComplete,
  onError,
  containerClassName,
  quality = 85,
  responsive = true,
  className,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority]);

  // Generate optimized image props
  const imageProps = ImageOptimizer.getImageProps(src, alt, {
    quality,
    width: width as number,
    height: height as number,
    priority,
  });

  // Handle loading completion
  const handleLoadingComplete = () => {
    setIsLoading(false);
    onLoadingComplete?.();
  };

  // Handle errors
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  // Calculate container style based on aspect ratio
  const containerStyle = aspectRatio
    ? { aspectRatio: aspectRatio.toString() }
    : {};

  // Don't render image until it's in view (for lazy loading)
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-gray-200 animate-pulse rounded',
          containerClassName
        )}
        style={containerStyle}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  // Render fallback if there's an error
  if (hasError && fallback) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400 rounded',
          containerClassName
        )}
        style={containerStyle}
      >
        <Image
          src={fallback}
          alt={`Fallback for ${alt}`}
          fill={!width && !height}
          width={width}
          height={height}
          className={className}
          {...props}
        />
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', containerClassName)}
      style={containerStyle}
    >
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}

      {/* Optimized image */}
      <Image
        {...imageProps}
        {...props}
        fill={!width && !height}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleLoadingComplete}
        onError={handleError}
        sizes={
          responsive
            ? props.sizes || imageProps.sizes
            : undefined
        }
      />
    </div>
  );
}

/**
 * Hero Image Component - Optimized for LCP
 */
export function HeroImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={true}
      lazy={false}
      quality={90}
      className={cn('object-cover', className)}
      {...props}
    />
  );
}

/**
 * Thumbnail Image Component
 */
export function ThumbnailImage({
  src,
  alt,
  size = 96,
  className,
  ...props
}: OptimizedImageProps & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      quality={75}
      responsive={false}
      className={cn('rounded object-cover', className)}
      {...props}
    />
  );
}

/**
 * Gallery Image Component
 */
export function GalleryImage({
  src,
  alt,
  aspectRatio = 16 / 9,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio={aspectRatio}
      quality={85}
      className={cn('object-cover rounded-lg', className)}
      {...props}
    />
  );
}

/**
 * Background Image Component
 */
export function BackgroundImage({
  src,
  alt,
  children,
  overlay = false,
  overlayColor = 'black',
  overlayOpacity = 0.3,
  className,
  ...props
}: OptimizedImageProps & {
  children?: React.ReactNode;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}) {
  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={true}
        {...props}
      />
      
      {overlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}
      
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Image with loading states and error boundaries
 */
export function SmartImage({
  src,
  alt,
  fallback = '/images/placeholder.jpg',
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fallback={fallback}
      {...props}
    />
  );
}

// Default export
export default OptimizedImage;