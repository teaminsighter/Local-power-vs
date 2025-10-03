# Hostinger Deployment Guide for A/B Testing Solar Platform

## Overview
This guide covers deploying your Next.js solar platform with production-ready A/B testing system to Hostinger.

## Prerequisites
- Hostinger Premium or Business hosting plan
- Access to Hostinger hPanel
- Your project files ready for deployment

## Database Setup Options

### Option 1: MySQL Database (Recommended for Hostinger)

1. **Create MySQL Database in hPanel:**
   ```
   - Go to Databases → MySQL Databases
   - Create new database: yoursite_solardb
   - Create database user with full permissions
   - Note: username, password, database name, hostname
   ```

2. **Update Environment Variables:**
   ```env
   # Replace Supabase config with MySQL
   DATABASE_URL=mysql://username:password@hostname:3306/yoursite_solardb
   MYSQL_HOST=hostname
   MYSQL_USER=username
   MYSQL_PASSWORD=password
   MYSQL_DATABASE=yoursite_solardb
   ```

### Option 2: External Supabase (Keep existing setup)
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

## Deployment Steps

### 1. Prepare Your Project

```bash
# Install dependencies and build
npm install
npm run build

# Test production build locally
npm run start
```

### 2. Create Production Environment File

Create `.env.production` in your project root:

```env
# Database Configuration
DATABASE_URL=mysql://your_mysql_connection_string

# API Keys
GOOGLE_ADS_CLIENT_ID=your_google_ads_client_id
GOOGLE_ADS_CLIENT_SECRET=your_google_ads_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_google_ads_developer_token

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

GA4_MEASUREMENT_ID=your_ga4_measurement_id
GA4_API_SECRET=your_ga4_api_secret

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@yourcompany.com

# Solar API Keys
WEATHER_API_KEY=your_weather_api_key
SOLAR_IRRADIANCE_API=your_solar_api_endpoint
ELECTRICITY_PRICES_API=your_electricity_api_endpoint

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com

# Production URLs
PRODUCTION_URL=https://yourdomain.com
```

### 3. Upload to Hostinger

**Method 1: File Manager Upload**
1. Go to hPanel → File Manager
2. Navigate to public_html
3. Upload your built project files
4. Extract if uploaded as zip

**Method 2: Git Deployment (if available)**
1. Connect your GitHub repository
2. Set up automatic deployments
3. Configure build commands

### 4. Configure Node.js Application

1. **In hPanel:**
   - Go to Advanced → Node.js
   - Create new Node.js app
   - Set Node.js version: 18 or higher
   - Set startup file: server.js or next start
   - Set app root: /public_html/your-app

2. **Package.json scripts:**
   ```json
   {
     "scripts": {
       "build": "next build",
       "start": "next start -p 3000",
       "migrate": "node scripts/migrate-database.js"
     }
   }
   ```

### 5. Database Migration

Create `scripts/migrate-database.js`:

```javascript
const mysql = require('mysql2/promise');

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  // Run your database schema
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      email VARCHAR(255) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role ENUM('super_admin', 'admin', 'viewer') DEFAULT 'viewer',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      contact_preference ENUM('phone', 'email', 'both') DEFAULT 'email',
      best_time_to_call VARCHAR(50),
      status ENUM('new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'not_interested') DEFAULT 'new',
      source VARCHAR(100) DEFAULT 'website',
      score INT DEFAULT 0,
      tags JSON,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_details (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      lead_id VARCHAR(36) NOT NULL,
      system_size DECIMAL(8,2) NOT NULL,
      estimated_cost DECIMAL(12,2) NOT NULL,
      annual_savings DECIMAL(12,2) NOT NULL,
      payback_period DECIMAL(4,1) NOT NULL,
      panel_count INT NOT NULL,
      roof_area DECIMAL(8,2) NOT NULL,
      monthly_bill DECIMAL(8,2) NOT NULL,
      usage_kwh DECIMAL(8,2) NOT NULL,
      address TEXT NOT NULL,
      property_type VARCHAR(50) NOT NULL,
      roof_type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );
  `;

  await connection.execute(schema);
  await connection.end();
  console.log('Database migration completed');
}

runMigrations().catch(console.error);
```

### 6. SSL Certificate

1. **In hPanel:**
   - Go to Security → SSL/TLS
   - Enable SSL certificate for your domain
   - Force HTTPS redirects

### 7. Performance Optimization

1. **Enable Compression:**
   ```apache
   # .htaccess file
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/plain
     AddOutputFilterByType DEFLATE text/html
     AddOutputFilterByType DEFLATE text/xml
     AddOutputFilterByType DEFLATE text/css
     AddOutputFilterByType DEFLATE application/xml
     AddOutputFilterByType DEFLATE application/xhtml+xml
     AddOutputFilterByType DEFLATE application/rss+xml
     AddOutputFilterByType DEFLATE application/javascript
     AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>
   ```

2. **Caching Headers:**
   ```apache
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType image/jpg "access plus 1 month"
     ExpiresByType image/jpeg "access plus 1 month"
     ExpiresByType image/gif "access plus 1 month"
     ExpiresByType image/png "access plus 1 month"
     ExpiresByType text/css "access plus 1 month"
     ExpiresByType application/pdf "access plus 1 month"
     ExpiresByType text/javascript "access plus 1 month"
     ExpiresByType application/javascript "access plus 1 month"
   </IfModule>
   ```

## Testing Deployment

1. **Check Application:**
   - Visit your domain
   - Test calculator functionality
   - Verify admin panel access

2. **Check Database Connection:**
   - Test lead capture
   - Verify data persistence
   - Check admin analytics

3. **Monitor Performance:**
   - Check page load times
   - Monitor error logs
   - Test mobile responsiveness

## Troubleshooting

### Common Issues:

1. **Database Connection Errors:**
   ```
   - Verify MySQL credentials
   - Check database host (usually localhost on Hostinger)
   - Ensure database user has proper permissions
   ```

2. **Environment Variables:**
   ```
   - Check .env file location
   - Verify all required variables are set
   - Use production values, not development
   ```

3. **Node.js Application Issues:**
   ```
   - Check Node.js version compatibility
   - Verify startup script in package.json
   - Check application logs in hPanel
   ```

4. **SSL/Domain Issues:**
   ```
   - Ensure SSL certificate is active
   - Update NEXTAUTH_URL to https://
   - Check DNS propagation
   ```

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Database connection working
- [ ] Lead capture functionality works
- [ ] Admin panel accessible
- [ ] Authentication system working
- [ ] Email notifications functional
- [ ] Google/Facebook integrations active
- [ ] SSL certificate installed
- [ ] Performance optimized
- [ ] Error monitoring set up

## Maintenance

1. **Regular Backups:**
   - Set up automated database backups
   - Keep application file backups
   - Document backup recovery procedures

2. **Updates:**
   - Monitor for security updates
   - Test updates in staging environment
   - Update dependencies regularly

3. **Monitoring:**
   - Set up uptime monitoring
   - Monitor error logs
   - Track performance metrics

## A/B Testing Campaign Setup

### 1. Create Your First Campaign

**Via Admin Panel:**
1. Go to `/admin` and login
2. Navigate to A/B Testing section
3. Click "Create New Campaign"
4. Fill in campaign details:
   - Campaign Name: "Solar Calculator CTA Test"
   - UTM Campaign: "solar_cta_q4_2024"
   - Target URL: "/"

### 2. Create A/B Test Variants

**Variant A (Control):**
```json
{
  "name": "Original Homepage",
  "content": {
    "text": {
      ".hero-title": "Get Your Free Solar Quote Today",
      ".cta-button": "Calculate My Savings"
    },
    "attributes": {
      ".cta-button": {
        "style": "background-color: #3b82f6; color: white;"
      }
    }
  }
}
```

**Variant B (Test):**
```json
{
  "name": "Urgency-Focused Homepage",
  "content": {
    "text": {
      ".hero-title": "Lock in 30% Tax Credits - Ending Soon!",
      ".cta-button": "Claim My Tax Credit"
    },
    "attributes": {
      ".cta-button": {
        "style": "background-color: #dc2626; color: white; animation: pulse 2s infinite;"
      }
    },
    "classes": {
      ".hero-section": ["urgency-theme", "highlight-border"]
    }
  }
}
```

### 3. Implement Client-Side Tracking

**Add to your main layout or homepage:**
```jsx
import ABTestTracker, { useABTest } from '@/components/ABTestTracker';

export default function HomePage() {
  const { isVariantB, trackConversion } = useABTest();
  
  const handleFormSubmit = async () => {
    // Track conversion when form is submitted
    await trackConversion('lead_generation', 100, {
      source: 'homepage_form',
      variant: isVariantB ? 'B' : 'A'
    });
  };

  return (
    <ABTestTracker>
      <div className="hero-section">
        <h1 className="hero-title">Get Your Free Solar Quote Today</h1>
        <button 
          className="cta-button"
          onClick={handleFormSubmit}
        >
          Calculate My Savings
        </button>
      </div>
    </ABTestTracker>
  );
}
```

### 4. Launch Campaign

**Start A/B Test:**
1. Set minimum sample size (recommend 1000+ visitors)
2. Set confidence level (95% recommended)
3. Click "Start Test"
4. Monitor real-time results in admin dashboard

## Campaign URLs for Traffic Sources

### Google Ads URLs
```
https://yourdomain.com/?utm_source=google&utm_medium=cpc&utm_campaign=solar_cta_q4_2024&utm_content=ad_variant_1
```

### Facebook Ads URLs
```
https://yourdomain.com/?utm_source=facebook&utm_medium=social&utm_campaign=solar_cta_q4_2024&utm_content=ad_variant_1
```

### Email Campaign URLs
```
https://yourdomain.com/?utm_source=email&utm_medium=newsletter&utm_campaign=solar_cta_q4_2024&utm_content=header_cta
```

## Monitoring & Analytics

### Real-Time Dashboard
- Access at `/admin/analytics`
- Monitor conversion rates by variant
- Track statistical significance
- View visitor demographics

### Key Metrics to Monitor
- **Conversion Rate:** Percentage of visitors who complete desired action
- **Statistical Significance:** Confidence in results (wait for 95%+)
- **Sample Size:** Ensure minimum 1000 visitors per variant
- **Test Duration:** Run for at least 1-2 weeks for reliable data

### Auto-Optimization
The system will automatically:
- Stop tests when statistical significance is reached
- Declare winning variants
- Archive completed tests
- Send notifications for important events

## Campaign Types You Can Run

### 1. Homepage Hero Tests
- Headlines and value propositions
- CTA button text and colors
- Hero images and videos
- Form layouts

### 2. Landing Page Tests
- Page layouts and designs
- Content length and structure
- Social proof placement
- Pricing displays

### 3. Form Optimization
- Number of fields
- Field labels and placeholders
- Submit button text
- Progress indicators

### 4. Email Campaigns
- Subject lines
- Email content and layout
- CTA placement and text
- Send times and frequency

## Best Practices

### 1. Test Planning
- One primary goal per test
- Significant changes between variants
- Clear hypothesis before starting
- Predetermined success metrics

### 2. Traffic Requirements
- Minimum 1000 visitors per variant
- Run for at least 1-2 weeks
- Account for traffic patterns (weekends, holidays)
- Consider seasonal variations

### 3. Statistical Validity
- Wait for 95%+ confidence before calling winners
- Don't peek at results too early
- Account for multiple testing if running several tests
- Document all test results

### 4. Implementation
- Test thoroughly before launch
- Ensure tracking is working correctly
- Monitor for technical issues
- Have rollback plan ready

Your A/B testing solar platform is now ready for production campaigns on Hostinger!