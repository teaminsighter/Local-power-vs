# Hostinger Deployment Guide for Solar Calculator Platform

## Overview
This guide covers deploying your Next.js solar calculator platform to Hostinger with database integration.

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

Your solar calculator platform is now ready for production on Hostinger!