# CloudPanel Deployment Guide

## 🚀 Deploying Job Portal to CloudPanel

Your CloudPanel server is configured at:
- **Host:** cpanel.apie.tech.site
- **IP Address:** 122.176.25.162
- **Domain:** api.jobportal.apie.tech
- **Site User:** apie-api-jobportal

## Step 1: Set Up GitHub Secrets

Go to your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

```
CLOUDPANEL_HOST=122.176.25.162
CLOUDPANEL_USER=apie-api-jobportal
CLOUDPANEL_PASSWORD=<your-password-from-manager>
```

## Step 2: Manual Server Setup (One-time)

### SSH into your CloudPanel server:

```bash
ssh apie-api-jobportal@122.176.25.162
```

### Install Node.js (if not already installed):

```bash
# Check if Node.js is installed
node --version

# If not, install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

### Install MongoDB (if not already installed):

```bash
# Import MongoDB public key
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Create .env file on server:

```bash
cd /home/apie-api-jobportal/htdocs/api.jobportal.apie.tech
nano .env
```

Add this content:

```env
NODE_ENV=production
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/job_portal

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@jobportal.com

# Frontend URL
FRONTEND_URL=https://jobportal.apie.tech
```

Save and exit (Ctrl+X, Y, Enter)

### Set up Nginx reverse proxy:

In CloudPanel, go to your site → **Vhost** tab, and add this configuration:

```nginx
server {
    listen 80;
    server_name api.jobportal.apie.tech;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Serve uploaded files
    location /uploads {
        alias /home/apie-api-jobportal/htdocs/api.jobportal.apie.tech/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable SSL/HTTPS:

In CloudPanel:
1. Go to your site
2. Click **SSL/TLS** tab
3. Click **Let's Encrypt** button
4. Select your domain and click **Install**

## Step 3: Initial Manual Deployment

```bash
# Navigate to project directory
cd /home/apie-api-jobportal/htdocs/api.jobportal.apie.tech

# Clone your repository (first time only)
git clone https://github.com/ankit74123/Naukrii.git temp
mv temp/backend/* .
rm -rf temp

# Install dependencies
npm ci --production

# Create upload directories
mkdir -p uploads/profiles uploads/resumes uploads/documents

# Start with PM2
pm2 start server.js --name job-portal-api
pm2 save
pm2 startup
```

## Step 4: Deploy Frontend

### Option A: Separate subdomain (jobportal.apie.tech)

1. Create a new site in CloudPanel for `jobportal.apie.tech`
2. Point the root directory to the frontend build

### Option B: Same server different directory

```bash
cd /home/apie-api-jobportal/htdocs
mkdir jobportal
```

Update frontend build and copy to this directory.

## Step 5: Automated Deployment

Once everything is set up, simply push to GitHub:

```bash
git add .
git commit -m "Update code"
git push origin main
```

The GitHub Action will automatically:
1. Build your application
2. Deploy to CloudPanel via SFTP
3. Extract files
4. Install dependencies
5. Restart PM2 process

## Monitoring and Logs

### View PM2 logs:
```bash
pm2 logs job-portal-api
```

### View PM2 status:
```bash
pm2 status
```

### Restart application:
```bash
pm2 restart job-portal-api
```

### View MongoDB logs:
```bash
sudo journalctl -u mongod
```

## Troubleshooting

### Port 5000 already in use:
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
pm2 restart job-portal-api
```

### Permission issues:
```bash
cd /home/apie-api-jobportal/htdocs/api.jobportal.apie.tech
chmod -R 755 .
chown -R apie-api-jobportal:apie-api-jobportal .
```

### MongoDB connection issues:
```bash
sudo systemctl status mongod
sudo systemctl restart mongod
```

## Manual Deployment Script

If you prefer manual deployment, use this script:

```bash
#!/bin/bash
cd /home/apie-api-jobportal/htdocs/api.jobportal.apie.tech

# Pull latest code
git pull origin main

# Install dependencies
npm ci --production

# Restart application
pm2 restart job-portal-api

echo "Deployment completed!"
```

Save as `deploy.sh` and run: `bash deploy.sh`

## Health Check

Test your deployment:

```bash
# Backend health
curl https://api.jobportal.apie.tech/api/health

# Expected response:
# {"success":true,"status":"healthy","timestamp":"...","uptime":123.45,"services":{"database":"connected","api":"operational"}}
```

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check MongoDB logs: `sudo journalctl -u mongod -f`
4. Verify environment variables: `cat .env`
