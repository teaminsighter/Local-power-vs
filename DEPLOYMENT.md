# Local Power - Hostinger Deployment Guide

## 🚀 Pre-Deployment Checklist

### ✅ Current Status
- ✅ Database authentication fixed (switched to SQLite)
- ✅ Next.js cross-origin configuration updated
- ✅ Landing pages are responsive for mobile and desktop
- ✅ Admin panel functionality verified
- ✅ Lead generation system working
- ✅ Google Maps and Solar API integrations functional
- ✅ Production build dynamic route issues resolved

## 📋 Deployment Steps for Hostinger

### 1. Environment Setup
```bash
# Copy the production environment file
cp .env.production .env.local

# Update the following variables:
NEXTAUTH_URL="https://yourdomain.com"
LEAD_WEBHOOK_URL="https://yourdomain.com/api/webhooks/leads"
```

### 2. Database Setup
```bash
# Generate production database
npm run db:generate
DATABASE_URL="file:./prod.db" npm run db:push

# Initialize with demo data (optional)
DATABASE_URL="file:./prod.db" npm run demo:setup
```

### 3. Build for Production
```bash
npm run build
npm run start
```

### 4. Hostinger Configuration

#### File Upload
- Upload all files except `node_modules/` and `.next/`
- Include the built `.next/` folder after running `npm run build`

#### Environment Variables in Hostinger Panel
Set these in your Hostinger hosting panel:
```
NODE_ENV=production
DATABASE_URL=file:./prod.db
NEXTAUTH_SECRET=your_production_secret_here
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBCI1D92F4Qn_Kpp5-CaddK9MPoCuBWbLY
```

#### Node.js Version
- Ensure Node.js 18+ is selected in Hostinger panel

## 🔧 Features Verified

### Landing Pages
- ✅ Main landing page (/) - Responsive, Google Maps integration
- ✅ V2 landing page (/v2) - Solarwatt systems focus
- ✅ V3 landing page (/v3) - Enhanced user experience
- ✅ Mobile responsive design
- ✅ Calculator modal with lead capture

### Admin Panel
- ✅ Authentication system (/admin/login)
- ✅ Dashboard with analytics
- ✅ Lead management system
- ✅ User permissions
- ✅ A/B testing capabilities
- ✅ Marketing campaign tracking

### Lead Generation
- ✅ Solar calculator with address search
- ✅ Google Maps integration for roof analysis
- ✅ Lead capture forms
- ✅ Database storage
- ✅ Visitor tracking

### API Endpoints
- ✅ `/api/leads` - Lead management
- ✅ `/api/track-visitor` - Visitor analytics
- ✅ `/api/analytics/*` - Dashboard data
- ✅ `/api/auth/login` - Authentication
- ✅ `/api/admin/*` - Admin functionality

## 🛠 Production Optimizations

### Performance
- Static page generation where possible
- Image optimization enabled
- Responsive design for all screen sizes

### Security
- Environment variables properly configured
- Database connections secured
- Admin authentication required

### Monitoring
- Visitor tracking enabled
- Lead analytics dashboard
- Performance metrics

## 🔍 Testing Checklist

### Before Go-Live
1. Test main landing page responsiveness
2. Verify calculator functionality
3. Test admin login and dashboard
4. Check lead generation flow
5. Verify Google Maps integration
6. Test all forms and submissions

### Login Credentials
- Admin Email: admin@localpower.ie
- Admin Password: LocalPower2025!

## 🚨 Common Issues & Solutions

### Database Issues
- Ensure SQLite database file has proper permissions
- Run database migration if schema changes

### API Issues
- Check environment variables are properly set
- Verify Google Maps API key is valid

### Build Issues
- Ensure all dependencies are installed
- Check Node.js version compatibility

## 📞 Support
For deployment issues, verify all environment variables and ensure the database is properly initialized with the demo data.