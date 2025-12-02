#!/bin/bash

# CloudPanel Backend Deployment Script
# This script deploys the Job Portal backend to CloudPanel

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}CloudPanel Backend Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Variables
SITE_DIR="/home/apie-api-jobportal/htdocs/api.jobportal.apie.tech"
APP_NAME="job-portal-api"
REPO_URL="https://github.com/ankit74123/Naukrii.git"
BACKUP_DIR="${SITE_DIR}/backup_$(date +%Y%m%d_%H%M%S)"

echo -e "${YELLOW}Step 1: Creating backup...${NC}"
if [ -d "$SITE_DIR" ] && [ "$(ls -A $SITE_DIR)" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r "$SITE_DIR"/* "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "${GREEN}✓ Backup created at: $BACKUP_DIR${NC}"
fi

echo -e "${YELLOW}Step 2: Navigating to site directory...${NC}"
mkdir -p "$SITE_DIR"
cd "$SITE_DIR"
echo -e "${GREEN}✓ Working directory: $(pwd)${NC}"

echo -e "${YELLOW}Step 3: Cloning/pulling latest code...${NC}"
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git remote add origin "$REPO_URL"
    git fetch origin main
    git checkout -b main origin/main
else
    echo "Pulling latest changes..."
    git pull origin main
fi
echo -e "${GREEN}✓ Code updated${NC}"

echo -e "${YELLOW}Step 4: Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js version: $(node --version)"
fi
echo -e "${GREEN}✓ Node.js is installed${NC}"

echo -e "${YELLOW}Step 5: Installing backend dependencies...${NC}"
cd "$SITE_DIR"
npm install --production
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo -e "${YELLOW}Step 6: Creating .env file...${NC}"
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/job_portal
JWT_SECRET=your_super_secret_jwt_key_change_this_12345
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
EMAIL_SERVICE=gmail
EMAIL_USERNAME=ankit@apie.tech
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=noreply@jobportal.com
FRONTEND_URL=https://api.jobportal.apie.tech
CLIENT_URL=https://api.jobportal.apie.tech
EOF
    echo -e "${YELLOW}⚠ .env file created with default values${NC}"
    echo -e "${YELLOW}  Please update EMAIL_PASSWORD in .env file manually${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo -e "${YELLOW}Step 7: Creating upload directories...${NC}"
mkdir -p uploads/profiles uploads/resumes uploads/documents
chmod -R 755 uploads
echo -e "${GREEN}✓ Upload directories created${NC}"

echo -e "${YELLOW}Step 8: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
echo -e "${GREEN}✓ PM2 installed${NC}"

echo -e "${YELLOW}Step 9: Stopping existing PM2 process...${NC}"
pm2 stop "$APP_NAME" 2>/dev/null || true
pm2 delete "$APP_NAME" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓ Old process stopped${NC}"

echo -e "${YELLOW}Step 10: Starting application with PM2...${NC}"
cd "$SITE_DIR"
pm2 start server.js --name "$APP_NAME" --node-args="--max-old-space-size=2048"
pm2 save
echo -e "${GREEN}✓ Application started${NC}"

echo -e "${YELLOW}Step 11: Setting up PM2 startup...${NC}"
pm2 startup systemd -u apie-api-jobportal --hp /home/apie-api-jobportal
echo -e "${GREEN}✓ PM2 startup configured${NC}"

echo -e "${YELLOW}Step 12: Verifying deployment...${NC}"
sleep 3
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Health check passed!${NC}"
else
    echo -e "${RED}⚠ Health check failed - checking logs${NC}"
    pm2 logs "$APP_NAME" --lines 20
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Backend is running at: https://api.jobportal.apie.tech"
echo "Health check: https://api.jobportal.apie.tech/api/health"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 status                 - Check process status"
echo "  pm2 logs $APP_NAME         - View logs"
echo "  pm2 restart $APP_NAME      - Restart application"
echo "  pm2 stop $APP_NAME         - Stop application"
echo ""
echo "To update in future:"
echo "  cd $SITE_DIR"
echo "  git pull origin main"
echo "  npm install --production"
echo "  pm2 restart $APP_NAME"
