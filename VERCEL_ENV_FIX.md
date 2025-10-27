# 🚨 Vercel Environment Variables Fix

## The Problem
Your Vercel deployment is failing because it can't connect to Supabase. The error shows:
```
getaddrinfo ENOTFOUND db.ukpjuqpkgfxscofekble.supabase.co
```

## The Solution
You need to add the correct `DATABASE_URL` environment variable in Vercel.

## Steps to Fix

### 1. Get Your Supabase Database URL
1. Go to your Supabase dashboard
2. Navigate to **Settings** → **Database**
3. Copy the **Connection string** (URI format)
4. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres?sslmode=require
   ```

### 2. Add Environment Variable in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

   **Required:**
   ```
   DATABASE_URL = postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres?sslmode=require
   OPENAI_API_KEY = sk-your-openai-api-key
   ```

   **Optional:**
   ```
   RAG_MODEL = gpt-4o-mini
   RAG_MAX_TOKENS = 2000
   ```

### 3. Redeploy
1. After adding the environment variables
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Or push a new commit to trigger automatic redeployment

## Verify the Fix
Once redeployed, test:
1. **Health check**: `https://your-site.vercel.app/api/health`
2. **AI assistant**: Try asking a question

## Expected Results
- ✅ Database connection successful
- ✅ No more "ENOTFOUND" errors
- ✅ AI assistant working properly

---

**The key issue was missing `DATABASE_URL` in Vercel environment variables!**
