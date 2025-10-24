# 🚀 Local Power - Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- Your Local Power project ready

## 🌐 Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## 🔐 Step 2: Login to Vercel
```bash
vercel login
```

## 🗄️ Step 3: Set Up Database (Choose ONE option)

### Option A: Vercel Postgres (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database" → "Postgres"
3. Name it: `local-power-db`
4. Copy the connection strings

### Option B: PlanetScale (Alternative)
1. Sign up at [PlanetScale](https://planetscale.com)
2. Create database: `local-power`
3. Get connection string from dashboard

### Option C: Neon (Alternative)
1. Sign up at [Neon](https://neon.tech)
2. Create database: `local-power`
3. Copy connection string

## 🔧 Step 4: Environment Variables
After creating your database, you'll get these variables:

```env
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NO_SSL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="local_power"
```

## 🚀 Step 5: Deploy to Vercel

### Option A: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables in the "Environment Variables" section
6. Click "Deploy"

### Option B: Direct CLI Deployment
```bash
# In your project directory
vercel

# Follow the prompts:
# - Set up and deploy? [Y/n] y
# - Which scope? (select your account)
# - Link to existing project? [y/N] n
# - Project name: local-power
# - Directory: ./
# - Override settings? [y/N] n
```

## 🔧 Step 6: Configure Environment Variables
After deployment, add environment variables:

```bash
# Database
vercel env add POSTGRES_PRISMA_URL
vercel env add POSTGRES_URL_NON_POOLING

# Security
vercel env add NEXTAUTH_SECRET
vercel env add JWT_SECRET

# App URL (replace with your Vercel URL)
vercel env add NEXTAUTH_URL
```

## 🗄️ Step 7: Database Migration
After first deployment:

```bash
# Redeploy to run migrations
vercel --prod
```

## ✅ Step 8: Verify Deployment
Your app will be available at: `https://your-project-name.vercel.app`

Test these endpoints:
- `https://your-app.vercel.app` - Homepage
- `https://your-app.vercel.app/v2` - Landing page  
- `https://your-app.vercel.app/api/database/health` - Database health
- `https://your-app.vercel.app/admin` - Admin panel

## 🔧 Custom Domain (Optional)
1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `localpower.ie`
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain

## 🚨 Troubleshooting

### Build Errors
```bash
# Check logs
vercel logs

# Redeploy
vercel --prod
```

### Database Connection Issues
1. Verify environment variables are set
2. Check database connection strings
3. Ensure database is accessible

### SSL Certificate Issues
- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct

## 📊 Post-Deployment Checklist
- [ ] Homepage loads correctly
- [ ] Calculator functionality works
- [ ] Lead capture saves to database
- [ ] Admin panel accessible
- [ ] Analytics tracking functional
- [ ] Custom domain configured (if applicable)

## 🎯 Production Optimizations Already Included
✅ PostgreSQL database configuration  
✅ Prisma optimization for serverless  
✅ Next.js production build configuration  
✅ Bundle optimization and code splitting  
✅ Image optimization with CDN  
✅ Security headers and CORS  
✅ Performance monitoring ready  

Your Local Power application is now production-ready on Vercel! 🌟