# Google OAuth Setup Guide

This guide will help you configure Google OAuth authentication for your Xpert Expense Manager app.

## Prerequisites

- Supabase project set up
- Google Cloud Console account
- Your app running locally or deployed

## Step 1: Configure Google OAuth in Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Select your project or create a new one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For local development: `http://localhost:3000/auth/callback`
     - For production: `https://yourdomain.com/auth/callback`

4. **Save Your Credentials**
   - Copy the Client ID and Client Secret
   - You'll need these for Supabase configuration

## Step 2: Configure Supabase Authentication

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Open your project dashboard

2. **Enable Google Provider**
   - Go to "Authentication" > "Providers"
   - Find "Google" and toggle it ON
   - Enter your Google OAuth credentials:
     - **Client ID**: From Google Cloud Console
     - **Client Secret**: From Google Cloud Console

3. **Configure Redirect URLs**
   - Add your redirect URLs in Supabase:
     - `http://localhost:3000/auth/callback` (for local development)
     - `https://yourdomain.com/auth/callback` (for production)

## Step 3: Update Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## Step 4: Test the Integration

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test Google Sign-In**
   - Visit `http://localhost:3000`
   - Click "Sign in with Google"
   - Complete the Google OAuth flow
   - You should be redirected back to your app

3. **Verify User Data**
   - Check that the user's name and email appear in the navigation
   - Try creating a group to test the full flow

## Step 5: Production Deployment

1. **Update Google OAuth Settings**
   - Add your production domain to authorized redirect URIs
   - Update Supabase redirect URLs

2. **Deploy to Vercel**
   - Your existing deployment process remains the same
   - Environment variables are already configured

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure redirect URIs match exactly in both Google Console and Supabase
   - Check for trailing slashes and http vs https

2. **"Client ID not found" error**
   - Verify Google OAuth credentials are correctly entered in Supabase
   - Check that Google+ API is enabled

3. **User not appearing after login**
   - Check browser console for errors
   - Verify Supabase environment variables are correct

### Debug Steps

1. **Check Supabase Logs**
   - Go to Supabase Dashboard > Logs
   - Look for authentication errors

2. **Check Browser Console**
   - Open Developer Tools
   - Look for JavaScript errors during login

3. **Verify Environment Variables**
   - Ensure all required variables are set
   - Check that URLs don't have trailing slashes

## How It Works

### Authentication Flow

1. **User clicks "Sign in with Google"**
2. **Redirected to Google OAuth**
3. **User authorizes the app**
4. **Google redirects to `/auth/callback`**
5. **Supabase exchanges code for session**
6. **User is redirected to main app**

### User Data Mapping

Your existing database schema works perfectly with Google OAuth:

```typescript
// Google OAuth provides:
user.email                    // Maps to user_email fields
user.user_metadata.full_name  // Maps to user_name fields
user.id                      // Unique user identifier
```

### API Integration

Your existing API routes will work seamlessly:

```typescript
// Before (localStorage)
const userPersona = JSON.parse(localStorage.getItem('userPersona'))

// After (Supabase Auth)
const { data: { user } } = await supabase.auth.getUser()
// Use user.email and user.user_metadata.full_name
```

## Security Benefits

- **Verified identities**: Users must have valid Google accounts
- **Secure sessions**: JWT tokens managed by Supabase
- **Cross-device sync**: Users stay logged in across devices
- **No password management**: Google handles all security

## Next Steps

Once Google OAuth is working:

1. **Test all app features** with authenticated users
2. **Consider adding more providers** (GitHub, Apple, etc.)
3. **Implement user profiles** if needed
4. **Add role-based permissions** for group admins

Your app now has enterprise-grade authentication while maintaining the same user experience!
