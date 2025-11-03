# Deployment Guide - SGED Copa Dorada

## Status: Ready to Deploy

Your application is fully configured and ready for deployment!

### Database Setup - COMPLETED

- 5 tables created with proper RLS security
- Sample data loaded (tournament config, 6 matches)
- All indexes and policies in place
- Supabase connection configured

### What's Working

1. **Tournament Config**: Copa Dorada 2024 with 3 groups
2. **Teams**: 6 teams per group (A, B, C)
3. **Sample Matches**: 6 matches loaded for Jornada 1
4. **Authentication**: Supabase Auth ready
5. **Build**: Project builds successfully

## Deploy to Netlify

### Option 1: Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Option 2: Netlify Web UI

1. Go to https://app.netlify.com
2. Click "Add new site" > "Import an existing project"
3. Connect your Git repository (GitHub/GitLab/Bitbucket)
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`: (copy from your .env file)
   - `VITE_SUPABASE_ANON_KEY`: (copy from your .env file)
6. Click "Deploy site"

### Option 3: Drag & Drop

```bash
# Build the project
npm run build

# Drag the 'dist' folder to Netlify's deploy drop zone
# at https://app.netlify.com/drop
```

## First Steps After Deployment

### 1. Create Your Admin Account

1. Visit your deployed site
2. Click "Iniciar Sesión"
3. Click "¿No tienes cuenta? Regístrate"
4. Create an account with your email

### 2. Grant Admin Access

After creating your account, run this in Supabase SQL Editor:

```sql
-- Get your user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Insert admin role (replace YOUR_USER_ID with the ID from above)
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');
```

### 3. Start Using the System

- **View Matches**: Jornada tab shows all matches
- **Enter Scores**: As admin, you can edit match results
- **View Calendar**: See all scheduled matches
- **View Standings**: Auto-calculated FVF standings

## Files Created for Deployment

- `netlify.toml` - Netlify configuration
- `_redirects` - SPA routing support
- Database fully migrated and populated

## Environment Variables

Your `.env` file contains:
```
VITE_SUPABASE_URL=https://hdwnkaqfutbefgpvzlww.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Make sure to add these to Netlify's environment variables!

## Testing Locally

```bash
# Development server
npm run dev

# Production build test
npm run build
npm run preview
```

## Need Help?

- Supabase Dashboard: https://supabase.com/dashboard
- Netlify Dashboard: https://app.netlify.com
- Check SETUP.md for detailed system information
