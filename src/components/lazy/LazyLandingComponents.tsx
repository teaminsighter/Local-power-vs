/**
 * Lazy-Loaded Landing Page Components
 * Heavy landing page components for better initial load performance
 */

import { createLazyComponent, IntersectionLazy } from '@/lib/optimization/lazy-loader';

// Hero section - loaded immediately (above the fold)
export const LazyHero = createLazyComponent(
  () => import('../landing/hero'),
  {
    loading: <HeroSkeleton />,
    chunkName: 'hero'
  }
);

// Below the fold components - lazy loaded on scroll
export const LazyPainAndBenefits = createLazyComponent(
  () => import('../landing/pain-and-benefits'),
  {
    loading: <SectionSkeleton />,
    chunkName: 'pain-benefits'
  }
);

export const LazyProductDetails = createLazyComponent(
  () => import('../landing/product-details'),
  {
    loading: <SectionSkeleton />,
    chunkName: 'product-details'
  }
);

export const LazyDurabilityVideo = createLazyComponent(
  () => import('../landing/durability-video'),
  {
    loading: <VideoSkeleton />,
    chunkName: 'durability-video'
  }
);

export const LazyProcess = createLazyComponent(
  () => import('../landing/process'),
  {
    loading: <SectionSkeleton />,
    chunkName: 'process'
  }
);

export const LazyProcessCta = createLazyComponent(
  () => import('../landing/process-cta'),
  {
    loading: <SectionSkeleton />,
    chunkName: 'process-cta'
  }
);

export const LazyTestimonials = createLazyComponent(
  () => import('../landing/testimonials'),
  {
    loading: <TestimonialsSkeleton />,
    chunkName: 'testimonials'
  }
);

export const LazyConsultation = createLazyComponent(
  () => import('../landing/consultation'),
  {
    loading: <SectionSkeleton />,
    chunkName: 'consultation'
  }
);

export const LazyFinalCta = createLazyComponent(
  () => import('../landing/final-cta'),
  {
    loading: <CtaSkeleton />,
    chunkName: 'final-cta'
  }
);

export const LazyFaq = createLazyComponent(
  () => import('../landing/faq'),
  {
    loading: <FaqSkeleton />,
    chunkName: 'faq'
  }
);

// Calculator Modal - critical component, preload on hover
export const LazyCalculatorModal = createLazyComponent(
  () => import('../CalculatorModal'),
  {
    loading: <CalculatorSkeleton />,
    chunkName: 'calculator-modal'
  }
);

// Solar Assessment Tool - heavy component with maps
export const LazySolarAssessmentTool = createLazyComponent(
  () => import('../landing/solar-assessment-tool'),
  {
    loading: <MapSkeleton />,
    chunkName: 'solar-assessment'
  }
);

// Solar Calculator - complex calculation component
export const LazySolarCalculator = createLazyComponent(
  () => import('../landing/solar-calculator'),
  {
    loading: <CalculatorSkeleton />,
    chunkName: 'solar-calculator'
  }
);

// Intersection-based lazy loading wrappers
export function LazySection({ 
  children, 
  className = "min-h-[400px]" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <IntersectionLazy
      threshold={0.1}
      rootMargin="100px"
      fallback={<SectionSkeleton />}
      className={className}
    >
      {children}
    </IntersectionLazy>
  );
}

export function LazyVideoSection({ 
  children,
  className = "min-h-[500px]"
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <IntersectionLazy
      threshold={0.1}
      rootMargin="200px"
      fallback={<VideoSkeleton />}
      className={className}
    >
      {children}
    </IntersectionLazy>
  );
}

// Skeleton Components
function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Title skeleton */}
          <div className="space-y-4">
            <div className="h-16 bg-white/20 rounded-lg animate-pulse mx-auto w-3/4" />
            <div className="h-12 bg-white/20 rounded-lg animate-pulse mx-auto w-2/3" />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-6 bg-white/10 rounded animate-pulse mx-auto w-5/6" />
            <div className="h-6 bg-white/10 rounded animate-pulse mx-auto w-4/5" />
          </div>
          
          {/* CTA buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <div className="h-14 bg-white/20 rounded-lg animate-pulse w-48" />
            <div className="h-14 bg-white/10 rounded-lg animate-pulse w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded animate-pulse mx-auto w-1/2 mb-4" />
          <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-3/4" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto w-1/3 mb-4" />
          <div className="h-5 bg-gray-200 rounded animate-pulse mx-auto w-2/3" />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video bg-gray-200 rounded-lg animate-pulse relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto w-1/3 mb-4" />
          <div className="h-5 bg-gray-200 rounded animate-pulse mx-auto w-1/2" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CtaSkeleton() {
  return (
    <div className="py-16 px-4 bg-blue-600">
      <div className="container mx-auto text-center">
        <div className="space-y-6">
          <div className="h-10 bg-white/20 rounded animate-pulse mx-auto w-1/2" />
          <div className="h-6 bg-white/10 rounded animate-pulse mx-auto w-3/4" />
          <div className="h-14 bg-white/20 rounded-lg animate-pulse mx-auto w-48" />
        </div>
      </div>
    </div>
  );
}

function FaqSkeleton() {
  return (
    <div className="py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto w-1/3 mb-4" />
        </div>
        
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalculatorSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-12 bg-blue-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="p-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3 mb-6" />
      <div className="aspect-[16/9] bg-gray-200 rounded-lg animate-pulse relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400 text-lg">Loading Map...</div>
        </div>
      </div>
    </div>
  );
}