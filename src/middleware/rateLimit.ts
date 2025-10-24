import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  private getClientId(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               request.ip || 
               'unknown';
    return ip;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  public isAllowed(request: NextRequest): { allowed: boolean; resetTime?: number; remaining?: number } {
    const clientId = this.getClientId(request);
    const now = Date.now();
    
    this.cleanupExpiredEntries();
    
    if (!this.store[clientId] || this.store[clientId].resetTime <= now) {
      this.store[clientId] = {
        count: 1,
        resetTime: now + this.windowMs
      };
      return { 
        allowed: true, 
        resetTime: this.store[clientId].resetTime,
        remaining: this.maxRequests - 1
      };
    }

    this.store[clientId].count++;
    
    if (this.store[clientId].count > this.maxRequests) {
      return { 
        allowed: false, 
        resetTime: this.store[clientId].resetTime,
        remaining: 0
      };
    }

    return { 
      allowed: true, 
      resetTime: this.store[clientId].resetTime,
      remaining: this.maxRequests - this.store[clientId].count
    };
  }
}

const globalRateLimiter = new RateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')   // 100 requests
);

const authRateLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 minutes
  5               // 5 attempts
);

export function rateLimit(request: NextRequest, type: 'general' | 'auth' = 'general') {
  const limiter = type === 'auth' ? authRateLimiter : globalRateLimiter;
  const result = limiter.isAllowed(request);
  
  if (!result.allowed) {
    const response = NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: type === 'auth' 
          ? 'Too many authentication attempts. Please try again later.'
          : 'Too many requests. Please try again later.',
        resetTime: result.resetTime
      }, 
      { status: 429 }
    );
    
    response.headers.set('X-RateLimit-Limit', type === 'auth' ? '5' : process.env.RATE_LIMIT_MAX_REQUESTS || '100');
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', Math.ceil((result.resetTime || 0) / 1000).toString());
    response.headers.set('Retry-After', Math.ceil(((result.resetTime || 0) - Date.now()) / 1000).toString());
    
    return response;
  }
  
  return null; // Allow request to continue
}