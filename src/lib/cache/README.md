# Redis Caching System

A comprehensive caching system with Redis and in-memory fallback for the Local Power application.

## Features

- **Redis Primary Cache**: High-performance Redis caching with connection pooling
- **In-Memory Fallback**: Automatic fallback to in-memory cache when Redis is unavailable
- **Tag-Based Invalidation**: Efficient cache invalidation using tags
- **Cache Middleware**: Easy-to-use middleware for API routes
- **Performance Monitoring**: Built-in metrics and health monitoring
- **Batch Operations**: Support for batch get/set operations
- **Automatic Cleanup**: TTL-based expiration and cleanup

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Routes    │    │  Cache Layer    │    │ Redis Server    │
│                 │────│                 │────│                 │
│ • Leads         │    │ • Middleware    │    │ • Primary       │
│ • Pricing       │    │ • Wrapper       │    │ • Connection    │
│ • Analytics     │    │ • Invalidation  │    │ • Clustering    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │ Fallback Cache  │
                       │                 │
                       │ • In-Memory     │
                       │ • Automatic     │
                       │ • TTL-based     │
                       └─────────────────┘
```

## Configuration

### Environment Variables

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_KEY_PREFIX=localpower:
CACHE_DEFAULT_TTL=3600

# Performance Settings
SKIP_CACHE_DEV=false
CACHE_WARM_ON_START=true
```

### Cache Keys

The system uses structured cache keys:

```typescript
// Examples
CacheKeys.lead('123')                    // "lead:123"
CacheKeys.leadList('status=NEW&page=1')  // "leads:list:c3RhdHVzPU5FVyZwYWdlPTE="
CacheKeys.pricing('california')          // "pricing:california"
CacheKeys.analytics('overview', 'today') // "analytics:overview:today"
```

### Cache Tags

Tags enable efficient invalidation:

```typescript
CacheTags.LEADS         // "leads"
CacheTags.USERS         // "users" 
CacheTags.ANALYTICS     // "analytics"
CacheTags.PRICING       // "pricing"
```

## Usage

### 1. Using Cache Wrapper

```typescript
import { cacheWrapper, CacheKeys, CacheTags } from '@/lib/cache/middleware';

export async function GET(request: NextRequest) {
  const { data, context } = await cacheWrapper(
    CacheKeys.leadList('all'),
    async () => {
      return await prisma.lead.findMany();
    },
    {
      ttl: 300,     // 5 minutes
      tags: [CacheTags.LEADS]
    }
  );
  
  return NextResponse.json(data);
}
```

### 2. Using Cache Decorator

```typescript
import { withCache } from '@/lib/cache/middleware';

class LeadsController {
  @withCache({ ttl: 300, tags: [CacheTags.LEADS] })
  async getLeads(req: NextRequest) {
    // Method automatically cached
    return await prisma.lead.findMany();
  }
}
```

### 3. Direct Cache Access

```typescript
import { Cache } from '@/lib/cache/redis';

// Set cache
await Cache.set('my-key', data, 3600, ['tag1', 'tag2']);

// Get cache
const data = await Cache.get('my-key');

// Remember pattern
const data = await Cache.remember(
  'expensive-computation',
  async () => expensiveOperation(),
  3600,
  ['computation']
);
```

### 4. Cache Invalidation

```typescript
import { CacheInvalidator } from '@/lib/cache/middleware';

// Invalidate by tags
await CacheInvalidator.invalidateByTags([CacheTags.LEADS]);

// Invalidate by pattern
await CacheInvalidator.invalidateByPattern('*leads*');

// Specific invalidations
await CacheInvalidator.invalidateLeads();
await CacheInvalidator.invalidateAnalytics();
```

## Monitoring

### Health Check

```bash
curl http://localhost:3002/api/cache-status
```

### Cache Statistics

```typescript
import { CacheMonitor } from '@/lib/cache/middleware';

const stats = await CacheMonitor.getStats();
console.log(stats);
// {
//   hits: 1543,
//   misses: 127,
//   hitRate: "92.41%",
//   isConnected: true,
//   fallbackCacheSize: 0,
//   redisConnected: true
// }
```

### Performance Monitoring

```typescript
const health = await CacheMonitor.healthCheck();
console.log(health);
// {
//   status: "healthy",
//   redis: true,
//   fallback: false,
//   latency: 23
// }
```

## Cache Warming

The system supports automatic cache warming:

```typescript
import { CacheWarmer } from '@/lib/cache/middleware';

// Warm frequently accessed data
await CacheWarmer.warmCache();
```

Warming is automatically triggered:
- On application startup (if `CACHE_WARM_ON_START=true`)
- Every 30 minutes in production
- Can be manually triggered via API

## Best Practices

### 1. TTL Selection

- **Static Data** (pricing, configs): 2-24 hours
- **Dynamic Data** (leads, analytics): 5-30 minutes
- **User Sessions**: 1-4 hours
- **Search Results**: 15-60 minutes

### 2. Cache Key Design

```typescript
// Good: Hierarchical and descriptive
'leads:list:status=NEW&page=1'
'user:profile:123'
'analytics:dashboard:user-456:today'

// Bad: Generic or unclear
'data123'
'cache_key_1'
'temp'
```

### 3. Tag Strategy

```typescript
// Tag related data for efficient invalidation
await Cache.set('lead:123', leadData, 3600, [
  CacheTags.LEADS,
  `lead:${leadId}`,
  `user:${userId}`
]);
```

### 4. Error Handling

```typescript
try {
  const cached = await Cache.get(key);
  if (cached) return cached;
} catch (error) {
  console.warn('Cache error, falling back to database:', error);
  // Continue with database query
}
```

## Production Deployment

### Redis Setup

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}
```

### Environment Configuration

```env
# Production
REDIS_HOST=redis.yourcompany.com
REDIS_PORT=6379
REDIS_PASSWORD=secure_password_here
REDIS_KEY_PREFIX=localpower:prod:
CACHE_DEFAULT_TTL=7200
CACHE_WARM_ON_START=true
```

### Monitoring Setup

Add alerts for:
- Cache hit ratio < 80%
- Redis connection failures
- High cache latency (> 100ms)
- Memory usage > 80%

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis server status
   - Verify connection credentials
   - Check network connectivity
   - Review firewall settings

2. **Low Hit Rate**
   - Review TTL settings
   - Check cache invalidation patterns
   - Analyze cache key distribution
   - Monitor cache size limits

3. **High Latency**
   - Check Redis server performance
   - Review network latency
   - Consider Redis clustering
   - Optimize cache key complexity

### Debug Mode

Enable detailed logging:

```env
DB_LOG_LEVEL=query
NODE_ENV=development
```

### Cache Inspection

```bash
# Connect to Redis CLI
redis-cli -h localhost -p 6379

# List all keys
KEYS localpower:*

# Get cache statistics
INFO stats

# Monitor cache operations
MONITOR
```

## Performance Metrics

Expected performance improvements:

- **API Response Time**: 60-80% reduction for cached responses
- **Database Load**: 70-90% reduction in query volume
- **User Experience**: Sub-100ms response times for cached data
- **Scalability**: 10x improvement in concurrent user capacity

## Version History

- **v1.0**: Initial Redis implementation with fallback
- **v1.1**: Added tag-based invalidation
- **v1.2**: Implemented batch operations
- **v1.3**: Added performance monitoring
- **v1.4**: Cache warming and health checks