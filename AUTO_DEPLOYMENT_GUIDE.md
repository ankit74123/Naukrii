# Auto Deployment Setup Guide

## Quick Setup for Auto Deployment

Your project now has 3 deployment workflows that automatically deploy on every push to `main` branch:

1. **`auto-deploy.yml`** - Complete deployment (Railway + Vercel)
2. **`deploy-backend.yml`** - Backend only (Render)
3. **`deploy-frontend.yml`** - Frontend only (Vercel)

---

## Option 1: Railway (Backend) + Vercel (Frontend) - RECOMMENDED

### Step 1: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `Naukrii` repository
4. Select the `backend` folder
5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@jobportal.com
   FRONTEND_URL=https://your-app.vercel.app
   ```
6. Railway will give you a URL like: `https://your-app.railway.app`
7. Copy your Railway Token from Settings → Tokens

### Step 2: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New Project"
3. Import your `Naukrii` repository
4. Set Root Directory to `frontend`
5. Framework Preset: Vite
6. Add environment variable:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```
7. Click Deploy
8. Get your tokens from:
   - Settings → Tokens → Create Token
   - Copy your Org ID and Project ID from project settings

### Step 3: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret:

```
RAILWAY_TOKEN=your_railway_token
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
VITE_API_URL=https://your-app.railway.app
BACKEND_URL=https://your-app.railway.app
FRONTEND_URL=https://your-app.vercel.app
```

### Step 4: Test Auto Deployment

```powershell
# Make any change and push
git add .
git commit -m "Test auto deployment"
git push origin main
```

The workflow will automatically:
1. Deploy backend to Railway
2. Deploy frontend to Vercel
3. Verify both are running
4. Show success message

---

## Option 2: Render (Backend) + Vercel (Frontend)

### Step 1: Deploy Backend to Render

1. Go to [Render.com](https://render.com) and sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your `Naukrii` repository
4. Settings:
   - Name: `naukrii-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add environment variables (same as Railway)
6. Click "Create Web Service"
7. Copy Service ID from URL and API Key from Account Settings

### Step 2: Deploy Frontend (Same as Option 1)

### Step 3: Add GitHub Secrets

```
RENDER_SERVICE_ID=srv-xxxxx
RENDER_API_KEY=your_render_api_key
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

---

## Option 3: Heroku (Backend + Frontend)

### Quick Deploy to Heroku

1. Install Heroku CLI
2. Run:
```powershell
# Backend
cd backend
heroku login
heroku create naukrii-backend
git subtree push --prefix backend heroku main

# Frontend
cd ../frontend
heroku create naukrii-frontend
heroku buildpacks:set heroku/nodejs
git subtree push --prefix frontend heroku main
```

---

## MongoDB Atlas Setup (Required for all options)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Database Access → Add User (username/password)
4. Network Access → Add IP: `0.0.0.0/0` (allow all)
5. Connect → Get connection string
6. Replace `<password>` with your password
7. Use this as `MONGO_URI` in environment variables

---

## Vercel CLI Setup (Alternative)

```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy frontend
cd frontend
vercel --prod

# Link project and get tokens
vercel project ls
```

---

## Testing Your Deployment

After deployment, test these endpoints:

**Backend:**
```
https://your-backend-url.railway.app/api/health
```

**Frontend:**
```
https://your-app.vercel.app
```

---

## Automatic Deployment Flow

Once set up, every push to `main` will:

1. ✅ Trigger GitHub Action
2. ✅ Build and deploy backend
3. ✅ Build and deploy frontend
4. ✅ Run health checks
5. ✅ Notify success/failure

---

## Monitoring

**Railway Dashboard:**
- https://railway.app/dashboard
- View logs, metrics, deployments

**Vercel Dashboard:**
- https://vercel.com/dashboard
- View deployments, analytics, logs

**GitHub Actions:**
- https://github.com/ankit74123/Naukrii/actions
- View workflow runs, logs

---

## Troubleshooting

**Backend not deploying:**
- Check Railway/Render logs
- Verify MONGO_URI is correct
- Check environment variables

**Frontend not building:**
- Verify VITE_API_URL points to backend
- Check Vercel build logs
- Ensure `npm run build` works locally

**CORS errors:**
- Update backend CORS to allow frontend URL
- Check `CLIENT_URL` in backend .env

---

## Cost

- **Railway:** Free tier (500 hours/month, $5 credit)
- **Render:** Free tier (750 hours/month)
- **Vercel:** Free tier (100GB bandwidth)
- **MongoDB Atlas:** Free tier (512MB storage)
- **Heroku:** Free tier discontinued, starts at $7/month

**Recommended:** Railway + Vercel (completely free for small projects)

---

## Next Steps

1. Choose your deployment platform (Railway + Vercel recommended)
2. Create accounts and deploy manually first
3. Add GitHub secrets
4. Push to main branch
5. Watch automatic deployment in Actions tab!

🚀 Your app will now auto-deploy on every push to main!
