# 🚀 Production Deployment Guide for Hostinger

This guide will walk you through deploying the Local Power application to production on Hostinger.

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Copy `.env.production.example` to `.env.production.local`
- [ ] Fill in all production environment variables
- [ ] Set up production database (PostgreSQL recommended)
- [ ] Configure external services (Google APIs, email, etc.)
- [ ] Set up monitoring and error tracking
- [ ] Configure CDN and static asset delivery

### 2. Security Checklist
- [ ] Generate secure NEXTAUTH_SECRET (minimum 32 characters)
- [ ] Set up SSL certificate for domain
- [ ] Configure CORS origins
- [ ] Set up Content Security Policy
- [ ] Enable rate limiting
- [ ] Configure database SSL connections

### 3. Performance Checklist
- [ ] Enable Redis caching
- [ ] Configure CDN for static assets
- [ ] Set up image optimization
- [ ] Enable compression and caching headers
- [ ] Configure database connection pooling

## 🏗️ Hostinger Deployment Steps

### Step 1: Domain and Hosting Setup

1. **Purchase/Configure Domain**
   ```bash
   # Point your domain to Hostinger nameservers
   # Configure A records and CNAME as needed
   ```

2. **Set up Hostinger VPS/Cloud Hosting**
   - Recommended: VPS 2 or higher for production
   - Minimum: 2GB RAM, 2 CPU cores, 40GB SSD

### Step 2: Server Configuration

1. **Connect to your server via SSH**
   ```bash
   ssh root@your-server-ip
   ```

2. **Update system packages**
   ```bash
   apt update && apt upgrade -y
   ```

3. **Install Node.js 18+ and npm**
   ```bash
   # Install Node.js via NodeSource
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   
   # Verify installation
   node --version
   npm --version
   ```

4. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   ```

5. **Install and configure Nginx**
   ```bash
   apt install nginx -y
   systemctl start nginx
   systemctl enable nginx
   ```

6. **Install PostgreSQL**
   ```bash
   apt install postgresql postgresql-contrib -y
   systemctl start postgresql
   systemctl enable postgresql
   ```

### Step 3: Database Setup

1. **Create production database**
   ```bash
   sudo -u postgres psql
   
   CREATE DATABASE localpower_prod;
   CREATE USER localpower_user WITH ENCRYPTED PASSWORD 'your-secure-password';
   GRANT ALL PRIVILEGES ON DATABASE localpower_prod TO localpower_user;
   \q
   ```

2. **Configure PostgreSQL for production**
   ```bash
   # Edit postgresql.conf
   nano /etc/postgresql/14/main/postgresql.conf
   
   # Key settings:
   listen_addresses = 'localhost'
   max_connections = 100
   shared_buffers = 256MB
   effective_cache_size = 1GB
   ```

3. **Configure pg_hba.conf for authentication**
   ```bash
   nano /etc/postgresql/14/main/pg_hba.conf
   
   # Add line for local app connection:
   local   localpower_prod   localpower_user   md5
   ```

### Step 4: Application Deployment

1. **Create application directory**
   ```bash
   mkdir -p /var/www/localpower
   cd /var/www/localpower
   ```

2. **Clone repository (or upload files)**
   ```bash
   # If using Git
   git clone https://github.com/yourusername/local-power.git .
   
   # Or upload via SCP/SFTP
   ```

3. **Install dependencies and build**
   ```bash
   npm ci --only=production
   npm run build
   ```

4. **Set up environment variables**
   ```bash
   cp .env.production.example .env.production.local
   nano .env.production.local
   # Fill in all production values
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

6. **Set up PM2 configuration**
   ```bash
   # Create ecosystem.config.js
   nano ecosystem.config.js
   ```

### Step 5: PM2 Process Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'localpower-prod',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/localpower',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/localpower/error.log',
    out_file: '/var/log/localpower/out.log',
    log_file: '/var/log/localpower/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### Step 6: Nginx Configuration

Create `/etc/nginx/sites-available/localpower`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # Static files caching
    location /_next/static {
        alias /var/www/localpower/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /images {
        alias /var/www/localpower/public/images;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

### Step 7: SSL Certificate Setup

1. **Install Certbot**
   ```bash
   apt install certbot python3-certbot-nginx -y
   ```

2. **Obtain SSL certificate**
   ```bash
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Set up auto-renewal**
   ```bash
   crontab -e
   # Add line:
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Step 8: Launch Application

1. **Start the application**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

2. **Enable Nginx site**
   ```bash
   ln -s /etc/nginx/sites-available/localpower /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

## 🔧 Post-Deployment Configuration

### 1. Monitoring Setup

1. **Set up log rotation**
   ```bash
   nano /etc/logrotate.d/localpower
   ```

2. **Configure monitoring alerts**
   ```bash
   # Set up Uptime Robot or similar service
   # Configure email alerts for downtime
   ```

### 2. Backup Configuration

1. **Database backups**
   ```bash
   # Create backup script
   nano /usr/local/bin/backup-db.sh
   chmod +x /usr/local/bin/backup-db.sh
   
   # Schedule with cron
   crontab -e
   # Add: 0 2 * * * /usr/local/bin/backup-db.sh
   ```

2. **File system backups**
   ```bash
   # Set up automated backups to cloud storage
   ```

### 3. Security Hardening

1. **Configure firewall**
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

2. **Set up fail2ban**
   ```bash
   apt install fail2ban -y
   systemctl enable fail2ban
   systemctl start fail2ban
   ```

### 4. Performance Optimization

1. **Install Redis for caching**
   ```bash
   apt install redis-server -y
   systemctl enable redis-server
   systemctl start redis-server
   ```

2. **Configure Redis**
   ```bash
   nano /etc/redis/redis.conf
   # Set maxmemory and eviction policy
   ```

## 🚀 Going Live Checklist

### Final Pre-Launch Steps
- [ ] Test all forms and functionality
- [ ] Verify SSL certificate is working
- [ ] Check Google Analytics tracking
- [ ] Test email notifications
- [ ] Verify database connections
- [ ] Test payment processing (if applicable)
- [ ] Check mobile responsiveness
- [ ] Verify SEO meta tags
- [ ] Test Core Web Vitals performance
- [ ] Set up monitoring and alerts

### DNS Configuration
- [ ] Point domain A records to server IP
- [ ] Set up www CNAME record
- [ ] Configure MX records for email
- [ ] Set up SPF, DKIM, DMARC records

### Marketing Setup
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google My Business
- [ ] Configure social media integrations
- [ ] Set up conversion tracking
- [ ] Configure retargeting pixels

## 📊 Ongoing Maintenance

### Daily
- [ ] Check application logs
- [ ] Monitor server resources
- [ ] Review error tracking dashboard

### Weekly
- [ ] Review performance metrics
- [ ] Check backup integrity
- [ ] Update dependencies (security patches)
- [ ] Review user feedback

### Monthly
- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Database maintenance
- [ ] Backup restore testing

## 🆘 Troubleshooting

### Common Issues
1. **Application won't start**
   - Check PM2 logs: `pm2 logs`
   - Verify environment variables
   - Check database connectivity

2. **502 Bad Gateway**
   - Check if Node.js app is running
   - Verify Nginx proxy configuration
   - Check firewall settings

3. **SSL Certificate Issues**
   - Renew certificate: `certbot renew`
   - Check certificate expiry: `certbot certificates`

### Emergency Contacts
- Server Provider: Hostinger Support
- Domain Registrar: [Your registrar]
- SSL Provider: Let's Encrypt
- Database Issues: Check logs in `/var/log/postgresql/`

## 📞 Support Resources

- Hostinger Documentation: https://support.hostinger.com/
- Next.js Deployment: https://nextjs.org/docs/deployment
- PM2 Documentation: https://pm2.keymetrics.io/docs/
- Nginx Documentation: https://nginx.org/en/docs/

---

*This deployment guide ensures a production-ready setup with security, performance, and monitoring best practices.*