# CI/CD Pipeline Documentation

## Overview

This job portal application uses GitHub Actions for Continuous Integration and Continuous Deployment (CI/CD). The pipeline automates testing, building, and deployment processes across multiple environments.

## Pipeline Structure

### 1. Continuous Integration (CI)
**File**: `.github/workflows/ci.yml`

Triggers on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs**:

#### Backend Testing
- Runs on Node.js 18.x and 20.x
- Spins up MongoDB 8.0 service container
- Installs dependencies
- Runs linting
- Executes backend tests
- Validates code syntax

#### Frontend Testing
- Runs on Node.js 18.x and 20.x
- Installs dependencies
- Runs linting
- Executes frontend tests
- Builds the application
- Uploads build artifacts

#### Security Audit
- Runs npm audit on both backend and frontend
- Scans for secrets using TruffleHog
- Reports vulnerabilities

#### Code Quality
- Integrates with SonarCloud for code analysis
- Checks code coverage
- Identifies code smells

#### Docker Build
- Tests Docker image builds
- Validates Dockerfiles
- Caches layers for faster builds

### 2. Staging Deployment (CD)
**File**: `.github/workflows/cd-staging.yml`

Triggers on:
- Push to `develop` branch
- Manual workflow dispatch

**Jobs**:

#### Build and Push
- Builds Docker images
- Pushes to GitHub Container Registry
- Tags with `staging`

#### Deploy to Staging
- Deploys to AWS ECS staging cluster
- Updates services with new images
- Waits for deployment stability
- Verifies health checks

#### Integration Tests
- Runs integration tests against staging API
- Validates API endpoints
- Tests database interactions

#### E2E Tests
- Uses Playwright for end-to-end testing
- Tests complete user workflows
- Captures screenshots and videos on failure

#### Performance Tests
- Runs Lighthouse CI for performance metrics
- Executes k6 load tests
- Generates performance reports

### 3. Production Deployment (CD)
**File**: `.github/workflows/cd-production.yml`

Triggers on:
- Push to `main` branch
- Git tags matching `v*.*.*`
- Manual workflow dispatch

**Jobs**:

#### Build and Push
- Builds production Docker images
- Tags with version numbers and SHA
- Pushes to GitHub Container Registry

#### Deploy to Production
- Deploys to AWS ECS production cluster
- Alternative: Heroku backend + Vercel frontend
- Zero-downtime deployment
- Health check verification

#### Database Migrations
- Runs database migration scripts
- Updates schema if needed
- Validates migration success

#### Smoke Tests
- Quick validation of critical paths
- Tests authentication, job posting, applications
- Uses Newman for API testing

#### Rollback on Failure
- Automatically rolls back on deployment failure
- Reverts to previous stable version
- Notifies team via Slack

## Environment Variables

### Required Secrets

Set these in GitHub Settings > Secrets and Variables > Actions:

#### AWS Deployment
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```

#### Application Configuration
```
PRODUCTION_API_URL
PRODUCTION_MONGO_URI
STAGING_API_URL
STAGING_MONGO_URI
JWT_SECRET
EMAIL_USERNAME
EMAIL_PASSWORD
```

#### Container Registry
```
GITHUB_TOKEN (automatically provided)
```

#### Optional Integrations
```
HEROKU_API_KEY
HEROKU_EMAIL
HEROKU_BACKEND_APP
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SONAR_TOKEN
SLACK_WEBHOOK
K6_CLOUD_TOKEN
```

## Docker Configuration

### Backend Dockerfile
**File**: `backend/Dockerfile`

Multi-stage build:
- `deps`: Production dependencies
- `development`: Development environment with hot reload
- `build`: Build stage for compilation
- `production`: Optimized production image

Features:
- Non-root user for security
- Health checks
- Upload directories creation
- Minimal image size

### Frontend Dockerfile
**File**: `frontend/Dockerfile`

Multi-stage build:
- `deps`: Dependencies installation
- `development`: Development with Vite dev server
- `builder`: Build production bundle
- `production`: Nginx server for static files

Features:
- Nginx for serving static files
- Health checks
- Gzip compression
- Security headers

### Nginx Configuration
**File**: `frontend/nginx.conf`

Features:
- SPA routing support
- Static asset caching
- Gzip compression
- Security headers
- Health check endpoint

## Docker Compose

### Production
**File**: `docker-compose.yml`

Services:
- MongoDB 8.0
- Backend API
- Frontend (Nginx)
- Nginx reverse proxy (optional with SSL)
- Redis cache (optional)

Features:
- Service health checks
- Named volumes for data persistence
- Network isolation
- Environment variable configuration

### Development
**File**: `docker-compose.dev.yml`

Services:
- MongoDB
- Backend with hot reload
- Frontend with Vite HMR
- Redis

Features:
- Volume mounting for live code updates
- Development environment variables
- Port exposure for debugging

## Deployment Strategies

### AWS ECS Deployment

1. **Build Phase**:
   - Docker images built and pushed to GitHub Container Registry
   - Tagged with version/SHA

2. **Deploy Phase**:
   - ECS service updated with new task definition
   - Rolling update strategy
   - Health checks validate new containers

3. **Verification**:
   - Smoke tests run against production
   - Monitoring alerts activated

4. **Rollback** (if needed):
   - Automatic rollback on health check failure
   - Manual rollback via workflow dispatch

### Heroku + Vercel Deployment

**Backend (Heroku)**:
- Git push to Heroku remote
- Automatic buildpack detection
- Environment variables from Heroku config
- Health check validation

**Frontend (Vercel)**:
- Deploy from GitHub integration
- Build environment variables injected
- Edge network distribution
- Automatic HTTPS

## Usage

### Running CI/CD Locally

Test CI pipeline locally:
```bash
# Install act (GitHub Actions local runner)
choco install act-cli

# Run CI workflow
act -j backend-test
act -j frontend-test
```

### Building Docker Images

Development:
```bash
# Build and run development environment
docker-compose -f docker-compose.dev.yml up --build

# Stop services
docker-compose -f docker-compose.dev.yml down
```

Production:
```bash
# Build production images
docker-compose build

# Run production stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

Trigger deployment manually:
```bash
# Go to GitHub Actions
# Select "CD Pipeline - Production" or "CD Pipeline - Staging"
# Click "Run workflow"
# Select branch
# Click "Run workflow"
```

### Environment Setup

1. Copy environment template:
```bash
cp .env.example .env
```

2. Fill in your values:
```bash
# Edit .env file with your configuration
nano .env
```

3. For Docker deployment:
```bash
# Ensure .env is in root directory
# Docker Compose will automatically load it
```

## Monitoring and Logging

### Health Checks

Backend health endpoint:
```
GET /api/health
```

Frontend health endpoint:
```
GET /health
```

### Logs

View application logs:
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# All logs
docker-compose logs -f
```

### Metrics

- Application logs in CloudWatch (AWS)
- Performance metrics in Lighthouse CI
- Load test results in k6 Cloud
- Error tracking in Sentry (if configured)

## Troubleshooting

### CI/CD Pipeline Failures

**Backend tests failing**:
- Check MongoDB service health
- Verify environment variables
- Review test logs in Actions tab

**Frontend build failing**:
- Check for TypeScript errors
- Verify API URL configuration
- Review build logs

**Docker build failing**:
- Validate Dockerfile syntax
- Check base image availability
- Review build context

### Deployment Issues

**ECS deployment stuck**:
- Check task definition
- Verify IAM permissions
- Review CloudWatch logs

**Health checks failing**:
- Verify application is listening on correct port
- Check MongoDB connection
- Review environment variables

**Rollback needed**:
- Go to Actions tab
- Find successful previous deployment
- Re-run that workflow

## Best Practices

1. **Branch Strategy**:
   - `main` → Production
   - `develop` → Staging
   - Feature branches → CI only

2. **Commit Messages**:
   - Use conventional commits
   - Include ticket/issue numbers
   - Clear, descriptive messages

3. **Pull Requests**:
   - Require CI to pass
   - Code review required
   - Update tests with code changes

4. **Secrets Management**:
   - Never commit secrets
   - Use GitHub Secrets
   - Rotate secrets regularly

5. **Testing**:
   - Write tests for new features
   - Maintain test coverage >80%
   - Run tests locally before pushing

## Future Enhancements

- [ ] Add canary deployments
- [ ] Implement blue-green deployment
- [ ] Add chaos engineering tests
- [ ] Integrate with monitoring tools (Datadog, New Relic)
- [ ] Add automatic security patching
- [ ] Implement feature flags
- [ ] Add A/B testing infrastructure
- [ ] Set up disaster recovery procedures
