# Vercel Deployment Instructions

## Environment Variables Required on Vercel

You MUST set these environment variables in your Vercel project settings:

```
MONGODB_URI=mongodb+srv://fakharzm355_db_user:Fakhar12345@fakhar.x2uzrja.mongodb.net/admin_panel_db?retryWrites=true&w=majority
JWT_SECRET=b1f45c7d9a8e4b23d7e6f9a1c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d
```

## Steps to Deploy on Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (Admin Panel)
3. Go to "Settings" → "Environment Variables"
4. Add both `MONGODB_URI` and `JWT_SECRET`
5. Click "Save"
6. Go to "Deployments" and click "Redeploy" on the latest deployment
7. Wait for the build to complete

## If You Still Get 404 Errors

The 404 error typically means:
- **Build is still in progress** - Wait 2-3 minutes for Vercel to finish building
- **Environment variables not set** - Confirm they're in Vercel dashboard
- **CORS issue** - Check browser console for network errors
- **API timeout** - MongoDB connection string might be blocked

## Test Your Deployment

Once deployed, test with:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Login endpoint
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Local Testing

To test locally before deploying:

```bash
npm run build
npm run start
# Visit http://localhost:3000
```