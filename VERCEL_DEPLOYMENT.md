# Vercel Frontend Deployment Guide

This guide will help you deploy your TechBridge Learning frontend to Vercel while keeping your existing Supabase backend.

## 🚀 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code is at `git@github.com:Anmolbaral/Assistive-Technology-with-AI.git`
3. **Supabase Backend**: Already set up and running

## 📋 Step 1: Connect GitHub to Vercel

### 1.1 Import Project
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import from GitHub: `Anmolbaral/Assistive-Technology-with-AI`
4. Click **"Import"**

### 1.2 Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

## 🔐 Step 2: Set Environment Variables

In Vercel dashboard, go to **Settings > Environment Variables** and add:

### Required Variables:
```bash
# Supabase Configuration (get from your Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI API Key
OPENAI_API_KEY=sk-...

# RAG Configuration
RAG_MODEL=gpt-4o-mini
RAG_MAX_TOKENS=2000

# Analytics (optional)
PLAUSIBLE_DOMAIN=your-domain.com
```

### How to Get Supabase Variables:
1. Go to your Supabase dashboard
2. Click **Settings > API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 Step 3: Deploy

### 3.1 Deploy Now
1. Click **"Deploy"** in Vercel
2. Wait for build to complete (2-3 minutes)
3. Get your live URL: `https://your-project-name.vercel.app`

### 3.2 Custom Domain (Optional)
1. Go to **Settings > Domains**
2. Add your custom domain
3. Update DNS records as instructed

## 🔧 Step 4: Update API Routes (if needed)

If you need to switch from your current database to Supabase, update `app/api/ask/route.ts`:

```typescript
// Replace this import:
// import { searchWithRole } from "@/lib/rag/store";

// With this:
import { searchWithRole } from "@/lib/rag/supabase-store";
```

## 📊 Step 5: Verify Deployment

### 5.1 Test Your Live Site
1. Visit your Vercel URL
2. Test the AI assistant
3. Check if lessons load properly
4. Verify role selection works

### 5.2 Check Logs
- Go to **Functions** tab in Vercel dashboard
- Check for any errors in API routes
- Monitor performance metrics

## 🔄 Step 6: Automatic Deployments

### 6.1 Git Integration
- Every push to `main` branch = automatic deployment
- Preview deployments for pull requests
- Automatic rollback on build failures

### 6.2 Branch Protection
Consider setting up:
- **Production**: `main` branch only
- **Staging**: `develop` branch
- **Preview**: All other branches

## 📈 Step 7: Monitoring & Analytics

### 7.1 Vercel Analytics
- Built-in performance monitoring
- Real user metrics
- Core Web Vitals tracking

### 7.2 Supabase Monitoring
- Database performance in Supabase dashboard
- API usage and limits
- Query performance metrics

## 🛠️ Step 8: Troubleshooting

### Common Issues:

#### Build Failures:
```bash
# Check build logs in Vercel dashboard
# Common fixes:
- Update Node.js version in vercel.json
- Check for missing dependencies
- Verify environment variables
```

#### API Errors:
```bash
# Check function logs
# Common fixes:
- Verify Supabase credentials
- Check OpenAI API key
- Ensure database schema is correct
```

#### Environment Variables:
```bash
# Make sure all required variables are set
# Check for typos in variable names
# Verify values are correct
```

## 📝 Step 9: Production Checklist

- [ ] Environment variables configured
- [ ] Supabase backend connected
- [ ] AI assistant working
- [ ] Lessons loading properly
- [ ] Role selection functional
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Analytics tracking
- [ ] Error monitoring
- [ ] Custom domain (optional)

## 🎯 Step 10: Go Live!

### 10.1 Final Deployment
1. Push any final changes to GitHub
2. Vercel automatically deploys
3. Test everything thoroughly
4. Share your live URL!

### 10.2 Post-Launch
- Monitor performance
- Check error logs
- Gather user feedback
- Plan future updates

## 💰 Cost Estimation

### Vercel Pricing:
- **Hobby Plan**: Free (perfect for your project)
  - Unlimited personal projects
  - 100GB bandwidth/month
  - Automatic HTTPS
  - Global CDN

- **Pro Plan**: $20/month (when you scale)
  - Team collaboration
  - Advanced analytics
  - Priority support

### Your Current Setup:
- ✅ **Frontend**: Vercel (Free)
- ✅ **Backend**: Supabase (Free tier)
- ✅ **Total Cost**: $0/month

## 🔗 Quick Links

- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
- **Your Repository**: [github.com/Anmolbaral/Assistive-Technology-with-AI](https://github.com/Anmolbaral/Assistive-Technology-with-AI)

## 🎉 You're Ready!

Your TechBridge Learning platform will be live on Vercel in just a few minutes! The frontend will connect to your existing Supabase backend seamlessly.

**Next Steps:**
1. Import project in Vercel
2. Add environment variables
3. Deploy
4. Test and go live!

🚀 **Your platform will be accessible worldwide with automatic scaling and global CDN!**
