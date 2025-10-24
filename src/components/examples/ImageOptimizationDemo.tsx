'use client';

import React from 'react';
import { 
  OptimizedImage, 
  HeroImage, 
  ProductImage, 
  ThumbnailImage, 
  BackgroundImage,
  GalleryImage,
  ResponsiveImage
} from '@/components/ui/optimized-image-advanced';

/**
 * Demonstration component showing different image optimization scenarios
 * This showcases the WebP/AVIF optimization, responsive loading, and various use cases
 */
export function ImageOptimizationDemo() {
  const demoImages = {
    hero: 'https://firebasestorage.googleapis.com/v0/b/localpower-vfcz6.firebasestorage.app/o/LocalPower%2Flocalpower-hero-fmaily.webp?alt=media&token=fb696a49-effa-4c81-b25c-040ed52bb262',
    product: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    gallery: [
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600',
      'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600',
    ]
  };

  const responsiveSources = [
    { src: demoImages.product + '&w=400', breakpoint: 0, width: 400, height: 300 },
    { src: demoImages.product + '&w=600', breakpoint: 640, width: 600, height: 450 },
    { src: demoImages.product + '&w=800', breakpoint: 1024, width: 800, height: 600 },
  ];

  return (
    <div className="space-y-12 p-8">
      {/* Hero Image Demo */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Hero Image Optimization</h2>
        <div className="relative h-96 rounded-lg overflow-hidden">
          <HeroImage
            src={demoImages.hero}
            alt="Optimized hero image with priority loading and high quality"
            className="rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <h3 className="text-3xl font-bold">Priority: High Quality (90%)</h3>
              <p className="text-lg">WebP/AVIF with blur placeholder</p>
            </div>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <strong>Features:</strong> Priority loading, 90% quality, WebP/AVIF formats, blur placeholder
        </div>
      </section>

      {/* Product Image Demo */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Product Image Optimization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ProductImage
              src={demoImages.product}
              alt="Optimized product image with lazy loading"
              width={400}
              height={300}
              className="w-full"
            />
            <p className="mt-2 text-sm text-gray-600">
              <strong>Standard Product:</strong> 80% quality, lazy loading, responsive
            </p>
          </div>
          <div>
            <ThumbnailImage
              src={demoImages.product}
              alt="Thumbnail with lower quality for faster loading"
              width={200}
              height={150}
              className="w-full"
            />
            <p className="mt-2 text-sm text-gray-600">
              <strong>Thumbnail:</strong> 70% quality, optimized for small sizes
            </p>
          </div>
        </div>
      </section>

      {/* Responsive Image Demo */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Responsive Image Sources</h2>
        <ResponsiveImage
          sources={responsiveSources}
          fallbackSrc={demoImages.product}
          fallbackWidth={400}
          fallbackHeight={300}
          alt="Responsive image that adapts to viewport size"
          className="w-full max-w-2xl mx-auto rounded-lg"
        />
        <div className="mt-2 text-sm text-gray-600 text-center">
          <strong>Responsive:</strong> Different image sources for mobile (400w), tablet (600w), desktop (800w)
        </div>
      </section>

      {/* Gallery Demo */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Image Gallery with Lazy Loading</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {demoImages.gallery.map((src, index) => (
            <div key={index} className="space-y-2">
              <GalleryImage
                src={src}
                alt={`Gallery image ${index + 1}`}
                width={300}
                height={200}
                index={index}
                total={demoImages.gallery.length}
                className="w-full aspect-[3/2]"
              />
              <p className="text-xs text-gray-500 text-center">
                Priority: {index < 3 ? 'High' : 'Low'} | Quality: {index < 6 ? '80%' : '70%'}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <strong>Gallery Features:</strong> First 3 images prioritized, quality decreases for later images, intersection observer lazy loading
        </div>
      </section>

      {/* Background Image Demo */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Background Image with Overlay</h2>
        <BackgroundImage
          src={demoImages.hero}
          alt="Background image with overlay"
          className="h-64 rounded-lg"
          overlay={true}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center">
              <h3 className="text-2xl font-bold">Background Image</h3>
              <p>High quality with dark overlay for text readability</p>
            </div>
          </div>
        </BackgroundImage>
        <div className="mt-2 text-sm text-gray-600">
          <strong>Background:</strong> Priority loading, 85% quality, automatic overlay for text readability
        </div>
      </section>

      {/* Format Comparison */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Format Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <OptimizedImage
              src={demoImages.product + '&fm=avif'}
              alt="AVIF format (best compression)"
              width={200}
              height={150}
              className="w-full rounded"
            />
            <p className="mt-2 text-sm">
              <strong>AVIF</strong><br />
              Best compression (~50% smaller)
            </p>
          </div>
          <div className="text-center">
            <OptimizedImage
              src={demoImages.product + '&fm=webp'}
              alt="WebP format (good compression)"
              width={200}
              height={150}
              className="w-full rounded"
            />
            <p className="mt-2 text-sm">
              <strong>WebP</strong><br />
              Good compression (~30% smaller)
            </p>
          </div>
          <div className="text-center">
            <OptimizedImage
              src={demoImages.product + '&fm=jpg'}
              alt="JPEG format (fallback)"
              width={200}
              height={150}
              className="w-full rounded"
            />
            <p className="mt-2 text-sm">
              <strong>JPEG</strong><br />
              Fallback format (baseline)
            </p>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Optimization Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">40-60%</div>
            <p className="text-sm text-gray-600">File Size Reduction</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">2-3x</div>
            <p className="text-sm text-gray-600">Faster Loading</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">95+</div>
            <p className="text-sm text-gray-600">Lighthouse Score</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">99%</div>
            <p className="text-sm text-gray-600">Browser Support</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ImageOptimizationDemo;