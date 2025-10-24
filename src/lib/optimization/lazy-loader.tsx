/**
 * Lazy Loading Utilities
 * Advanced dynamic imports and component lazy loading
 */

'use client';

import React, { lazy, Suspense, ComponentType, ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  minHeight?: string;
  error?: ReactNode;
}

interface LazyComponentOptions {
  loading?: ReactNode;
  error?: ReactNode;
  delay?: number;
  timeout?: number;
  retry?: boolean;
  chunkName?: string;
}

/**
 * Default loading skeleton component
 */
function DefaultSkeleton({ className, minHeight = '200px' }: { className?: string; minHeight?: string }) {
  return (
    <div 
      className={cn('animate-pulse bg-gray-200 rounded', className)}
      style={{ minHeight }}
    >
      <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

/**
 * Enhanced Suspense wrapper with error boundary
 */
export function LazyWrapper({ 
  children, 
  fallback, 
  className, 
  minHeight = '200px',
  error 
}: LazyWrapperProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback || <DefaultSkeleton minHeight={minHeight} />}>
        <ErrorBoundary fallback={error}>
          {children}
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}

/**
 * Error Boundary for lazy loaded components
 */
class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center text-gray-500 border border-gray-200 rounded">
          <p>Failed to load component</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Advanced lazy component loader with options
 */
export function createLazyComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
) {
  const LazyComponent = lazy(factory);
  
  return function WrappedLazyComponent(props: any) {
    const {
      loading = <DefaultSkeleton />,
      error,
      delay = 0,
      timeout = 10000
    } = options;

    // Add artificial delay for testing (only in development)
    const delayedFactory = delay > 0 && process.env.NODE_ENV === 'development'
      ? () => new Promise(resolve => setTimeout(resolve, delay)).then(factory)
      : factory;

    return (
      <LazyWrapper fallback={loading} error={error}>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
}

/**
 * Intersection Observer based lazy loading
 */
export function IntersectionLazy({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  className,
  once = true
}: {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
  className?: string;
  once?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        
        if (visible && once) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  const shouldRender = isVisible || hasBeenVisible;

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : (fallback || <DefaultSkeleton />)}
    </div>
  );
}

/**
 * Preload utility for code splitting
 */
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();

  /**
   * Preload a component without rendering
   */
  static preload(factory: () => Promise<any>, key: string) {
    if (this.preloadedComponents.has(key)) {
      return;
    }

    this.preloadedComponents.add(key);
    
    // Preload on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        factory().catch(() => {
          this.preloadedComponents.delete(key);
        });
      });
    } else {
      setTimeout(() => {
        factory().catch(() => {
          this.preloadedComponents.delete(key);
        });
      }, 100);
    }
  }

  /**
   * Preload components on route hover
   */
  static preloadOnHover(element: HTMLElement, factory: () => Promise<any>, key: string) {
    const handleMouseEnter = () => {
      this.preload(factory, key);
      element.removeEventListener('mouseenter', handleMouseEnter);
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    
    return () => element.removeEventListener('mouseenter', handleMouseEnter);
  }
}

/**
 * Hook for preloading components
 */
export function usePreloadComponent(
  factory: () => Promise<any>,
  key: string,
  condition: boolean = true
) {
  useEffect(() => {
    if (condition) {
      ComponentPreloader.preload(factory, key);
    }
  }, [factory, key, condition]);
}

/**
 * Progressive loading component for images and heavy content
 */
export function ProgressiveLoader({
  children,
  placeholder,
  className,
  loadingSteps = ['placeholder', 'lowQuality', 'highQuality']
}: {
  children: ReactNode;
  placeholder?: ReactNode;
  className?: string;
  loadingSteps?: string[];
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 500);

    return () => clearInterval(timer);
  }, [isInView, loadingSteps.length]);

  return (
    <div ref={ref} className={className}>
      {currentStep === 0 && placeholder}
      {currentStep > 0 && children}
    </div>
  );
}

// Export lazy loading utilities
export default {
  LazyWrapper,
  createLazyComponent,
  IntersectionLazy,
  ComponentPreloader,
  usePreloadComponent,
  ProgressiveLoader
};