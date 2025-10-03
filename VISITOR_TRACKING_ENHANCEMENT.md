# Visitor Tracking Enhancement Plan

## Current State
- Visitor IDs: Generated as CUIDs in VisitorTracking table
- Session IDs: Random strings generated client-side per session
- Location: Admin > Analytics > Visitor Tracking Dashboard

## Proposed Enhancements for Frequent Visitor Tracking

### 1. Add Persistent Visitor Fingerprinting
```sql
-- Add to VisitorTracking table
fingerprint VARCHAR(255),
firstVisit DATETIME,
lastVisit DATETIME,
visitCount INT DEFAULT 1,
isFrequentVisitor BOOLEAN DEFAULT FALSE
```

### 2. Enhanced Visitor Identification Strategy
- **Browser Fingerprinting**: Screen resolution, timezone, language, plugins
- **Behavioral Fingerprinting**: Mouse patterns, scroll behavior, interaction timing  
- **Cookie-based**: Persistent visitor UUID stored in localStorage/cookies
- **IP + User Agent**: Combined for basic identification

### 3. Frequent Visitor Detection Logic
- Mark as frequent visitor after 3+ visits within 30 days
- Track visit patterns: time of day, pages visited, session duration
- Store visitor journey and conversion funnel progress

### 4. Implementation Components

#### A. Enhanced Tracking Service
```typescript
class EnhancedVisitorService {
  generateFingerprint(): string
  identifyFrequentVisitor(fingerprint: string): Promise<boolean>
  updateVisitorProfile(visitorId: string, data: VisitorData): Promise<void>
  getVisitorJourney(visitorId: string): Promise<VisitorJourney[]>
}
```

#### B. Visitor Profile Dashboard
- Show visitor timeline and interaction history
- Display frequent visitor metrics and behavior patterns
- Export visitor data for marketing insights

#### C. Database Schema Updates
```sql
CREATE TABLE visitor_profiles (
  id VARCHAR(255) PRIMARY KEY,
  fingerprint VARCHAR(255) UNIQUE,
  first_visit DATETIME,
  last_visit DATETIME,
  visit_count INT DEFAULT 1,
  is_frequent BOOLEAN DEFAULT FALSE,
  total_session_time INT DEFAULT 0,
  pages_viewed INT DEFAULT 0,
  conversion_score FLOAT DEFAULT 0,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE visitor_sessions (
  id VARCHAR(255) PRIMARY KEY,
  visitor_id VARCHAR(255),
  session_start DATETIME,
  session_end DATETIME,
  pages_visited JSON,
  actions_taken JSON,
  referrer VARCHAR(500),
  exit_page VARCHAR(500),
  FOREIGN KEY (visitor_id) REFERENCES visitor_profiles(id)
);
```

## Benefits
1. **Marketing Intelligence**: Identify high-intent prospects who visit frequently
2. **Personalization**: Customize experience for returning visitors
3. **Lead Scoring**: Higher scores for frequent visitors
4. **Conversion Optimization**: Track visitor journey to conversion
5. **Customer Insights**: Understand visitor behavior patterns

## Privacy Considerations
- GDPR compliant fingerprinting (no PII)
- Cookie consent for persistent tracking
- Data retention policies (auto-delete after X days)
- Anonymization options for privacy-conscious users