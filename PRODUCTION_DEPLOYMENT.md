# Production Deployment: idlebite.com on Vercel

This guide walks you through deploying IdleBite to www.idlebite.com using Vercel, GitHub, and GoDaddy DNS.

## Step 1: Push to GitHub

### Option A: Create a New Repository
1. Go to [GitHub.com](https://github.com/new)
2. Create a new repository named `idlebite` (or your preferred name)
3. **Do NOT** initialize with README, .gitignore, or license
4. Click "Create repository"

### Option B: Use Existing Repository
If you already have a GitHub repo, skip to "Push to Remote"

### Push to Remote
```bash
# From the project root directory
git remote add origin https://github.com/YOUR_USERNAME/idlebite.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

## Step 2: Deploy to Vercel

### 2a. Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### 2b. Import Project
1. After signing in, click "Add New..." → "Project"
2. Click "Import Git Repository"
3. Paste your GitHub repo URL: `https://github.com/YOUR_USERNAME/idlebite`
4. Click "Import"

### 2c. Configure Project
1. **Project Name**: `idlebite`
2. **Framework**: Next.js (should auto-detect)
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `.next`

### 2d: Environment Variables (Optional)
Add any environment variables your app needs:
- `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://api.idlebite.com`)

Click "Deploy" and wait for the build to complete.

## Step 3: Connect Custom Domain in Vercel

Once deployed:
1. Go to your Vercel project dashboard
2. Click "Settings"
3. Go to "Domains"
4. Click "Add Domain"
5. Enter `idlebite.com`
6. Choose "Using Nameservers" (recommended for GoDaddy)

Vercel will show you 4 nameservers to use. Copy these.

## Step 4: Update GoDaddy DNS

1. Log in to [GoDaddy.com](https://www.godaddy.com)
2. Go to "My Products" → "Domains"
3. Find `idlebite.com` and click "Manage"
4. Go to "DNS" section
5. Scroll down to "Nameservers"
6. Click "Change Nameservers"
7. Replace the current nameservers with the 4 from Vercel:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ns4.vercel-dns.com
   ```
8. Click "Save"

**Note**: DNS propagation can take 24-48 hours. Your site will be live at www.idlebite.com once propagation completes.

## Step 5: Verify Deployment

### Check Vercel
1. Go to your Vercel project dashboard
2. You should see "✓ Connected" next to your domain

### Test in Browser
Once DNS propagates (24-48 hours):
- Visit `https://idlebite.com` (should redirect to www)
- Visit `https://www.idlebite.com` (production site)
- HTTPS is automatic with Vercel

## Troubleshooting

### Domain not connecting
- Wait 24-48 hours for DNS propagation
- Check GoDaddy nameservers are exactly as Vercel specified
- Use [dns-checker.com](https://dns-checker.com) to verify propagation

### Build fails
- Check that the `frontend` directory exists
- Ensure `package.json` exists in `frontend` folder
- Check Vercel build logs for specific errors

### Wrong branch deployed
- In Vercel settings, verify "Git" section points to `main` branch

## After Deployment

### Automatic Deployments
Every time you push to GitHub's `main` branch, Vercel automatically redeploys.

To deploy changes:
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### Monitor Performance
- Vercel Dashboard shows real-time metrics
- Check "Analytics" tab for performance insights
- Review "Deployments" tab for build history

## Environment Variables in Production

If your app needs backend API connection:
1. Go to Vercel project → Settings → Environment Variables
2. Add `NEXT_PUBLIC_API_URL` = your API URL
3. Redeploy (or push to GitHub to trigger auto-deploy)

## Questions?

For Vercel support: [vercel.com/docs](https://vercel.com/docs)
For GoDaddy DNS help: GoDaddy support chat or contact them at 1-480-505-8877
