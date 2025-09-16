# Deployment Guide - Xpert Expense Manager

This guide will help you deploy your AI-enabled expense management app to Vercel with Supabase.

## Prerequisites

- GitHub account
- Vercel account (free)
- Supabase account (free)
- OpenAI API key

## Step 1: Set Up Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and enter project details
   - Wait for project to be ready

2. **Get Supabase Credentials**
   - Go to Settings → API
   - Copy your Project URL and anon/public key

3. **Run Database Migrations**
   ```bash
   # Supabase CLI is included as dev dependency
   # Login to Supabase
   npx supabase login
   
   # Link to your project
   npx supabase link --project-ref YOUR_PROJECT_REF
   
   # Run migrations
   npx supabase db push
   ```

## Step 2: Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (you won't see it again!)

## Step 3: Deploy to Vercel

### Option A: Deploy from GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/xpert-expense-manager.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Choose "Next.js" framework

3. **Add Environment Variables**
   In Vercel dashboard, go to Settings → Environment Variables and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-project.vercel.app`

### Option B: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add OPENAI_API_KEY
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

## Step 4: Configure Production Settings

1. **Update Supabase Settings**
   - Go to Authentication → Settings
   - Add your Vercel domain to "Site URL"
   - Add your Vercel domain to "Redirect URLs"

2. **Test Your Deployment**
   - Visit your Vercel URL
   - Create a test group
   - Add a test expense
   - Verify AI categorization works

## Step 5: Custom Domain (Optional)

1. **Add Custom Domain in Vercel**
   - Go to your project settings
   - Add your domain
   - Configure DNS records as instructed

2. **Update Supabase Settings**
   - Update Site URL and Redirect URLs with your custom domain

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |

## Troubleshooting

### Common Issues

1. **"Invalid Supabase URL"**
   - Check your `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Ensure it starts with `https://`

2. **"OpenAI API Error"**
   - Verify your `OPENAI_API_KEY` is correct
   - Check you have credits in your OpenAI account

3. **"Database Connection Error"**
   - Ensure Supabase project is active
   - Check database migrations ran successfully

4. **"CORS Error"**
   - Add your Vercel domain to Supabase CORS settings
   - Check Supabase project settings

### Debug Steps

1. **Check Vercel Logs**
   ```bash
   vercel logs
   ```

2. **Check Supabase Logs**
   - Go to Supabase dashboard → Logs

3. **Test API Endpoints**
   ```bash
   curl https://your-app.vercel.app/api/groups
   ```

## Cost Estimation

### Vercel (Free Tier)
- ✅ Unlimited personal projects
- ✅ 100GB bandwidth/month
- ✅ Serverless functions included

### Supabase (Free Tier)
- ✅ 500MB database storage
- ✅ 50MB file storage
- ✅ 2GB bandwidth/month

### OpenAI (Pay-per-use)
- ~$0.002 per 1K tokens
- Typical usage: $1-5/month for small groups

**Total: ~$1-5/month for typical usage**

## Next Steps

1. **Monitor Usage**
   - Check Vercel analytics
   - Monitor Supabase usage
   - Track OpenAI API costs

2. **Scale Up**
   - Upgrade Supabase plan if needed
   - Add more AI features
   - Implement real-time notifications

3. **Customize**
   - Add your branding
   - Customize categories
   - Add more integrations

## Support

- 📚 [Vercel Documentation](https://vercel.com/docs)
- 📚 [Supabase Documentation](https://supabase.com/docs)
- 📚 [OpenAI Documentation](https://platform.openai.com/docs)
- 🐛 [Report Issues](https://github.com/yourusername/xpert-expense-manager/issues)

---

🎉 **Congratulations!** Your AI-enabled expense management app is now live and ready for your next trip!
