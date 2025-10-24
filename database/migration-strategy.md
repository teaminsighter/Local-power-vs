# Database Migration Strategy

## Migration from SQLite to PostgreSQL for Production

### Phase 1: Pre-Migration Assessment ✅

#### Current State Analysis
- **Database**: SQLite (development)
- **Data Volume**: Estimated < 10GB for initial deployment
- **Tables**: 15+ core tables with complex relationships
- **Key Constraints**: A/B testing data, visitor tracking, lead management

#### Target State
- **Database**: PostgreSQL 15+ (production)
- **Features**: ACID compliance, better concurrency, JSON support
- **Performance**: Optimized indexes, connection pooling
- **Scalability**: Horizontal scaling ready

### Phase 2: Migration Planning

#### 2.1 Data Mapping Strategy

```sql
-- Critical data preservation priorities:
1. Users & Authentication (HIGH)
2. Leads & System Details (HIGH)  
3. Visitor Tracking (MEDIUM)
4. A/B Test Data (MEDIUM)
5. Configuration (LOW - can recreate)
```

#### 2.2 Schema Optimization Changes

**Performance Improvements:**
- **Indexes**: 25+ optimized indexes for query performance
- **Data Types**: Proper PostgreSQL types (Decimal, VarChar limits)
- **Constraints**: Enhanced validation and foreign keys
- **Partitioning**: Ready for future table partitioning

**New Features:**
- **Connection Pooling**: Prisma relation mode optimization
- **Geographic Data**: Latitude/longitude for mapping
- **Enhanced Tracking**: Browser versions, screen sizes
- **Analytics Tables**: Pre-aggregated data for dashboards
- **Configuration Management**: Dynamic app settings

#### 2.3 Migration Timeline

```
Week 1: Development Environment Setup
├── Day 1-2: PostgreSQL setup & testing
├── Day 3-4: Schema validation & data migration scripts
└── Day 5-7: Application testing & validation

Week 2: Staging Environment
├── Day 1-3: Staging deployment & migration
├── Day 4-5: Load testing & performance optimization
└── Day 6-7: User acceptance testing

Week 3: Production Migration
├── Day 1-2: Pre-migration backup & validation
├── Day 3: Production migration (low-traffic window)
├── Day 4-5: Monitoring & optimization
└── Day 6-7: Post-migration validation
```

### Phase 3: Migration Execution

#### 3.1 Pre-Migration Checklist

- [ ] PostgreSQL server provisioned and configured
- [ ] Backup of existing SQLite database
- [ ] Migration scripts tested in staging
- [ ] Rollback plan documented
- [ ] Team notifications sent
- [ ] Monitoring tools configured

#### 3.2 Migration Scripts

**Export from SQLite:**
```bash
# Export schema and data
sqlite3 dev.db .dump > sqlite_backup.sql

# Export specific tables with data integrity checks
npm run db:export:leads
npm run db:export:users
npm run db:export:visitors
```

**Import to PostgreSQL:**
```bash
# Create new database with optimized schema
npx prisma migrate deploy

# Import data with transformation
npm run db:import:users
npm run db:import:leads
npm run db:import:visitors

# Validate data integrity
npm run db:validate:migration
```

#### 3.3 Data Transformation Requirements

**User Data:**
- Hash existing passwords with bcrypt
- Validate email formats
- Map old role enums to new structure

**Lead Data:**
- Convert tracking data to JSON format
- Validate phone number formats
- Map old status values to new enum

**Visitor Data:**
- Aggregate session data for performance
- Validate IP address formats
- Clean bot traffic data

### Phase 4: Performance Optimization

#### 4.1 Index Strategy

```sql
-- High-priority indexes for query performance
CREATE INDEX CONCURRENTLY idx_lead_status_priority ON leads(status, priority);
CREATE INDEX CONCURRENTLY idx_visitor_tracking_session ON visitor_tracking(session_id, timestamp);
CREATE INDEX CONCURRENTLY idx_abtest_active ON ab_tests(status, start_date, end_date);

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY idx_leads_active_high_priority 
ON leads(created_at) WHERE status IN ('NEW', 'CONTACTED') AND priority = 'HIGH';
```

#### 4.2 Connection Pooling

```javascript
// Database connection optimization
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'error'],
  pool: {
    connection_limit: 20,
    pool_timeout: 30,
    acquire_timeout: 60000
  }
});
```

#### 4.3 Query Optimization

**Before (SQLite):**
```sql
-- Slow query
SELECT * FROM leads WHERE status = 'NEW' ORDER BY created_at DESC;
```

**After (PostgreSQL Optimized):**
```sql
-- Optimized query with index
SELECT id, first_name, last_name, email, status, priority, created_at 
FROM leads 
WHERE status = 'NEW' 
ORDER BY priority DESC, created_at DESC 
LIMIT 50;
```

### Phase 5: Backup & Recovery Strategy

#### 5.1 Backup Schedule

```bash
# Daily automated backups
0 2 * * * pg_dump localpower_prod > /backups/daily_$(date +\%Y\%m\%d).sql

# Weekly full backups with compression
0 1 * * 0 pg_dump -Fc localpower_prod > /backups/weekly_$(date +\%Y\%m\%d).dump

# Monthly archives
0 0 1 * * pg_dump -Fc localpower_prod > /backups/monthly_$(date +\%Y\%m).dump
```

#### 5.2 Recovery Procedures

**Point-in-Time Recovery:**
```bash
# Restore to specific timestamp
pg_restore -d localpower_prod -t "2024-10-24 14:30:00" backup.dump

# Validate data integrity after restore
npm run db:validate:integrity
```

**Disaster Recovery:**
- **RTO**: 4 hours (Recovery Time Objective)
- **RPO**: 1 hour (Recovery Point Objective)
- **Hot Standby**: Read replica for failover
- **Geographic Backup**: Cross-region backup storage

### Phase 6: Monitoring & Maintenance

#### 6.1 Performance Monitoring

```sql
-- Query performance monitoring
SELECT query, mean_time, calls, total_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Index usage monitoring
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_scan = 0;
```

#### 6.2 Automated Maintenance

```bash
# Weekly maintenance script
#!/bin/bash
# Update table statistics
psql -d localpower_prod -c "ANALYZE;"

# Vacuum and reindex
psql -d localpower_prod -c "VACUUM ANALYZE;"

# Check for unused indexes
npm run db:analyze:indexes

# Performance report
npm run db:report:performance
```

### Phase 7: Rollback Plan

#### 7.1 Rollback Triggers
- Migration failure > 10% data loss
- Performance degradation > 50%
- Application errors > 5% error rate
- User-reported issues > critical threshold

#### 7.2 Rollback Procedure
1. **Immediate**: Switch traffic to backup SQLite instance
2. **Investigation**: Analyze migration logs and errors
3. **Decision**: Fix-forward vs. complete rollback
4. **Communication**: Update stakeholders and users
5. **Post-mortem**: Document lessons learned

### Phase 8: Validation & Testing

#### 8.1 Data Integrity Checks

```javascript
// Automated validation script
async function validateMigration() {
  // Record counts match
  const sqliteCount = await getSQLiteRecordCount();
  const postgresCount = await getPostgresRecordCount();
  
  // Data sampling verification
  const sampleUsers = await validateUserData();
  const sampleLeads = await validateLeadData();
  
  // Relationship integrity
  const relationshipCheck = await validateRelationships();
  
  return {
    recordCounts: sqliteCount === postgresCount,
    dataIntegrity: sampleUsers && sampleLeads,
    relationships: relationshipCheck
  };
}
```

#### 8.2 Performance Benchmarks

**Target Metrics:**
- Lead queries: < 100ms (95th percentile)
- Visitor tracking inserts: < 50ms average
- A/B test assignments: < 25ms average
- Dashboard analytics: < 500ms average

### Migration Execution Commands

```bash
# 1. Backup current data
npm run db:backup:full

# 2. Deploy new schema
npx prisma migrate deploy

# 3. Migrate data
npm run migrate:users
npm run migrate:leads  
npm run migrate:visitors
npm run migrate:abtests

# 4. Validate migration
npm run validate:migration

# 5. Update connection strings
npm run deploy:production

# 6. Monitor performance
npm run monitor:database
```

This migration strategy ensures zero-downtime deployment with comprehensive data protection and performance optimization.