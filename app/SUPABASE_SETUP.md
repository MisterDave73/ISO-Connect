
# Supabase Setup Guide for ISO Connect

This guide will walk you through setting up Supabase for the ISO Connect application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: ISO Connect
   - **Database Password**: Choose a strong password (save it somewhere safe)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Start with the free tier
6. Click "Create new project"
7. Wait for the project to be fully initialized (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. Once your project is ready, go to **Settings → API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API Keys → anon/public** (this is your anon key)
   - **Project API Keys → service_role** (this is your service role key - keep it secret!)

## Step 3: Update Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Open the file `scripts/setup-database.sql` in your project
3. Copy the entire contents of this file
4. Paste it into the SQL Editor in Supabase
5. Click **Run** to execute the script

This will create:
- All necessary tables (users, consultant_profiles, inquiries)
- Proper indexes for performance
- Row Level Security (RLS) policies
- Demo data including test accounts

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication → Settings**
2. Under **Site URL**, add your development URL: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/api/auth/callback`
4. For production, you'll need to add your production URLs as well

## Step 6: Set Up Storage (Optional)

If you want to enable file uploads for consultant profiles:

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `profiles`
3. Set the bucket to **Public** if you want profile pictures to be publicly accessible
4. Configure upload policies as needed

## Step 7: Verify Setup

1. Start your Next.js development server: `yarn dev`
2. Visit `http://localhost:3000`
3. Try creating a new account to test the authentication flow
4. Log in with the demo admin account: `admin@isoconnect.com` / `password123`

## Demo Data Included

The setup script includes demo data:

### Demo Users
- **Admin**: `admin@isoconnect.com` / `password123`
- **Company**: `john@doe.com` / `johndoe123`
- **Consultant 1**: `sarah@example.com` / `password123` (verified)
- **Consultant 2**: `michael@example.com` / `password123` (verified)

### Demo Consultant Profiles
- Sarah Johnson: ISO 9001, 14001, 45001 specialist
- Michael Chen: Information Security & IT Service Management expert

## Troubleshooting

### Common Issues

1. **"Invalid API Key" error**
   - Double-check your API keys in the `.env` file
   - Make sure you're using the correct anon key for client-side and service role key for server-side operations

2. **Database connection errors**
   - Verify your project URL is correct
   - Ensure your project is fully initialized (check the Supabase dashboard)

3. **RLS Policy errors**
   - Make sure you ran the complete setup script
   - Check that all policies were created properly in the Authentication section

4. **Authentication not working**
   - Verify your Site URL and Redirect URLs in Authentication settings
   - Check that the callback URL is correct

### Getting Help

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Look at the browser console for client-side errors
3. Check the Next.js server logs for API errors
4. Verify all environment variables are set correctly

## Production Deployment

When deploying to production:

1. Update the Site URL and Redirect URLs in Supabase Authentication settings
2. Set up proper environment variables in your hosting platform
3. Consider setting up a custom domain for your Supabase project
4. Review and tighten RLS policies if needed
5. Set up monitoring and logging for your production environment

Your ISO Connect application should now be fully configured with Supabase!
