/**
 * Production Security Configuration
 * Implements security best practices for production environment
 */

import { NextRequest } from 'next/server';

interface SecurityConfig {
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  cors: {
    origins: string[];
    credentials: boolean;
  };
  csp: {
    directives: Record<string, string[]>;
  };
  headers: Record<string, string>;
}

export const productionSecurityConfig: SecurityConfig = {
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    skipSuccessfulRequests: true
  },
  
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['https://yourdomain.com'],
    credentials: true
  },
  
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Next.js
        "'unsafe-eval'", // Required for Next.js development
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://connect.facebook.net',
        'https://www.facebook.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS
        'https://fonts.googleapis.com'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://firebasestorage.googleapis.com',
        'https://images.unsplash.com',
        'https://www.google-analytics.com',
        'https://www.facebook.com'
      ],
      'connect-src': [
        "'self'",
        'https://www.google-analytics.com',
        'https://vitals.vercel-insights.com',
        'https://api.openai.com',
        'https://api.anthropic.com'
      ],
      'frame-src': [
        "'self'",
        'https://www.google.com',
        'https://www.facebook.com'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': []
    }
  },
  
  headers: {
    // Security headers
    'X-DNS-Prefetch-Control': 'off',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    
    // Performance headers
    'X-Powered-By': '', // Remove to hide technology stack
    'Server': '', // Remove server information
  }
};

/**
 * Rate limiting implementation
 */
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  isAllowed(identifier: string, config = productionSecurityConfig.rateLimiting): boolean {
    const now = Date.now();
    const windowMs = config.windowMs;
    const maxRequests = config.maxRequests;

    const userRequests = this.requests.get(identifier);
    
    if (!userRequests || now > userRequests.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (userRequests.count >= maxRequests) {
      return false;
    }

    userRequests.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const userRequests = this.requests.get(identifier);
    if (!userRequests) return productionSecurityConfig.rateLimiting.maxRequests;
    
    return Math.max(0, productionSecurityConfig.rateLimiting.maxRequests - userRequests.count);
  }

  getResetTime(identifier: string): number {
    const userRequests = this.requests.get(identifier);
    return userRequests?.resetTime || Date.now();
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Clean up rate limiter every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

/**
 * Input validation and sanitization
 */
export class InputValidator {
  static sanitizeString(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.+/g, '.')
      .substring(0, 255);
  }
}

/**
 * Security middleware functions
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

export function generateCSPHeader(): string {
  const { directives } = productionSecurityConfig.csp;
  
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

export function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  const allowedOrigins = productionSecurityConfig.cors.origins;
  return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
}

/**
 * Security audit logging
 */
export class SecurityLogger {
  static logSecurityEvent(event: {
    type: 'rate_limit' | 'invalid_origin' | 'suspicious_activity' | 'authentication_failure';
    ip: string;
    userAgent?: string;
    details?: any;
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'SECURITY',
      ...event
    };

    console.log('🔒 SECURITY EVENT:', JSON.stringify(logEntry));

    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external security service
      // await sendToSecurityService(logEntry);
    }
  }

  static logFailedAuthentication(ip: string, email?: string): void {
    this.logSecurityEvent({
      type: 'authentication_failure',
      ip,
      details: { email: email ? '***@' + email.split('@')[1] : 'unknown' }
    });
  }

  static logSuspiciousActivity(ip: string, activity: string, details?: any): void {
    this.logSecurityEvent({
      type: 'suspicious_activity',
      ip,
      details: { activity, ...details }
    });
  }
}

/**
 * Data encryption utilities
 */
export class DataEncryption {
  private static algorithm = 'aes-256-gcm';

  static encrypt(text: string, key: string): string {
    if (typeof window !== 'undefined') {
      throw new Error('Encryption should only be used server-side');
    }

    const crypto = require('crypto');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  static decrypt(encryptedData: string, key: string): string {
    if (typeof window !== 'undefined') {
      throw new Error('Decryption should only be used server-side');
    }

    const crypto = require('crypto');
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static hash(data: string): string {
    if (typeof window !== 'undefined') {
      throw new Error('Hashing should only be used server-side');
    }

    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

export default {
  config: productionSecurityConfig,
  rateLimiter,
  InputValidator,
  SecurityLogger,
  DataEncryption,
  getClientIP,
  generateCSPHeader,
  validateOrigin
};