/**
 * Production SEO Configuration
 * Comprehensive SEO setup for Local Power solar business
 */

import { Metadata } from 'next';

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  keywords: string[];
  author: string;
  twitterHandle: string;
  facebookAppId: string;
  locale: string;
  alternateLocales: string[];
}

export const productionSEOConfig: SEOConfig = {
  siteName: 'Local Power',
  siteUrl: 'https://yourdomain.com',
  defaultTitle: 'Local Power - Solar + Battery Solutions | Get Your Free Quote',
  defaultDescription: 'Discover how much you can save with Local Power\'s solar panels and battery storage. Professional installation, government rebates, and complete energy solutions for your home in Ireland.',
  keywords: [
    'solar panels Ireland',
    'solar installation Dublin',
    'SEAI grant solar',
    'solar battery storage',
    'renewable energy Ireland',
    'solar power systems',
    'energy savings calculator',
    'sustainable energy solutions',
    'solar panel cost Ireland',
    'green energy Ireland'
  ],
  author: 'Local Power',
  twitterHandle: '@localpower_ie',
  facebookAppId: 'your-facebook-app-id',
  locale: 'en_IE',
  alternateLocales: ['en_US', 'en_GB']
};

/**
 * Generate comprehensive metadata for pages
 */
export function generateMetadata({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  noIndex = false,
  articleMeta
}: {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
  articleMeta?: {
    publishedTime: string;
    modifiedTime?: string;
    author: string;
    section: string;
  };
}): Metadata {
  const config = productionSEOConfig;
  
  const fullTitle = title 
    ? `${title} | ${config.siteName}`
    : config.defaultTitle;
  
  const metaDescription = description || config.defaultDescription;
  const metaKeywords = keywords 
    ? [...config.keywords, ...keywords]
    : config.keywords;
  
  const canonicalUrl = canonical 
    ? `${config.siteUrl}${canonical}`
    : config.siteUrl;
  
  const imageUrl = ogImage 
    ? `${config.siteUrl}${ogImage}`
    : `${config.siteUrl}/images/og-default.jpg`;

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: metaKeywords.join(', '),
    authors: [{ name: config.author }],
    creator: config.author,
    publisher: config.siteName,
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    
    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-IE': canonicalUrl,
        'en-US': canonicalUrl,
        'en-GB': canonicalUrl
      }
    },
    
    // Open Graph
    openGraph: {
      type: articleMeta ? 'article' : 'website',
      locale: config.locale,
      alternateLocale: config.alternateLocales,
      siteName: config.siteName,
      title: fullTitle,
      description: metaDescription,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || config.defaultTitle,
          type: 'image/jpeg'
        }
      ],
      ...(articleMeta && {
        publishedTime: articleMeta.publishedTime,
        modifiedTime: articleMeta.modifiedTime,
        authors: [articleMeta.author],
        section: articleMeta.section
      })
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: config.twitterHandle,
      creator: config.twitterHandle,
      title: fullTitle,
      description: metaDescription,
      images: [imageUrl]
    },
    
    // Facebook
    other: {
      'fb:app_id': config.facebookAppId
    },
    
    // Verification tags
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
      other: {
        'msvalidate.01': process.env.BING_VERIFICATION || '',
        'facebook-domain-verification': process.env.FACEBOOK_DOMAIN_VERIFICATION || ''
      }
    }
  };
}

/**
 * JSON-LD structured data generators
 */
export class StructuredData {
  static generateOrganization() {
    const config = productionSEOConfig;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: config.siteName,
      url: config.siteUrl,
      logo: `${config.siteUrl}/images/logo.png`,
      description: config.defaultDescription,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IE',
        addressLocality: 'Dublin',
        addressRegion: 'Dublin'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+353-1-xxx-xxxx',
        contactType: 'customer service',
        availableLanguage: 'English'
      },
      sameAs: [
        'https://www.facebook.com/localpower',
        'https://www.linkedin.com/company/localpower',
        'https://twitter.com/localpower_ie'
      ]
    };
  }

  static generateWebSite() {
    const config = productionSEOConfig;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: config.siteName,
      url: config.siteUrl,
      description: config.defaultDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${config.siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  static generateService() {
    const config = productionSEOConfig;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Solar Panel Installation',
      provider: {
        '@type': 'Organization',
        name: config.siteName,
        url: config.siteUrl
      },
      description: 'Professional solar panel installation services with SEAI grant support',
      areaServed: {
        '@type': 'Country',
        name: 'Ireland'
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Solar Solutions',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Solar Panel Installation'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Battery Storage Installation'
            }
          }
        ]
      }
    };
  }

  static generateFAQPage(faqs: Array<{ question: string; answer: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  }

  static generateBreadcrumbList(items: Array<{ name: string; url: string }>) {
    const config = productionSEOConfig;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${config.siteUrl}${item.url}`
      }))
    };
  }

  static generateLocalBusiness() {
    const config = productionSEOConfig;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${config.siteUrl}#business`,
      name: config.siteName,
      image: `${config.siteUrl}/images/logo.png`,
      url: config.siteUrl,
      telephone: '+353-1-xxx-xxxx',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Your Street Address',
        addressLocality: 'Dublin',
        postalCode: 'D01 XXXX',
        addressCountry: 'IE'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '53.3498',
        longitude: '-6.2603'
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '17:00'
        }
      ],
      priceRange: '€€€',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '127'
      }
    };
  }
}

/**
 * SEO Analytics and tracking
 */
export class SEOAnalytics {
  static initializeGoogleAnalytics(measurementId: string) {
    if (typeof window === 'undefined') return;
    
    // Google Analytics 4
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        page_title: document.title,
        page_location: window.location.href
      });
    `;
    document.head.appendChild(script2);
  }

  static trackPageView(path: string, title: string) {
    if (typeof window === 'undefined' || !('gtag' in window)) return;
    
    (window as any).gtag('config', process.env.GOOGLE_ANALYTICS_ID, {
      page_path: path,
      page_title: title
    });
  }

  static trackEvent(action: string, category: string, label?: string, value?: number) {
    if (typeof window === 'undefined' || !('gtag' in window)) return;
    
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }

  static trackConversion(conversionId: string, value?: number, currency = 'EUR') {
    if (typeof window === 'undefined' || !('gtag' in window)) return;
    
    (window as any).gtag('event', 'conversion', {
      send_to: conversionId,
      value: value,
      currency: currency
    });
  }
}

/**
 * Sitemap generation utilities
 */
export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  static generateSitemap(entries: SitemapEntry[]): string {
    const config = productionSEOConfig;
    
    const urls = entries.map(entry => `
  <url>
    <loc>${config.siteUrl}${entry.url}</loc>
    ${entry.lastModified ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>` : ''}
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  static getDefaultSitemapEntries(): SitemapEntry[] {
    return [
      { url: '/', changeFrequency: 'weekly', priority: 1.0 },
      { url: '/about', changeFrequency: 'monthly', priority: 0.8 },
      { url: '/services', changeFrequency: 'monthly', priority: 0.9 },
      { url: '/contact', changeFrequency: 'monthly', priority: 0.7 },
      { url: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
      { url: '/terms', changeFrequency: 'yearly', priority: 0.3 }
    ];
  }
}

export default {
  config: productionSEOConfig,
  generateMetadata,
  StructuredData,
  SEOAnalytics,
  SitemapGenerator
};