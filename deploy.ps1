# Job Portal Deployment Script (PowerShell)
# This script automates the deployment process on Windows

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('full', 'rebuild', 'restart', 'logs')]
    [string]$Action = 'full'
)

# Colors for output
function Log-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Log-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Log-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Docker is installed
function Check-Docker {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Log-Error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    }
    Log-Info "Docker is installed"
}

# Check if Docker Compose is installed
function Check-DockerCompose {
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Log-Error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    }
    Log-Info "Docker Compose is installed"
}

# Check if .env file exists
function Check-EnvFile {
    if (-not (Test-Path .env)) {
        Log-Warn ".env file not found. Creating from .env.example..."
        Copy-Item .env.example .env
        Log-Warn "Please update .env file with your configuration"
        exit 1
    }
    Log-Info ".env file exists"
}

# Pull latest code
function Pull-Code {
    Log-Info "Pulling latest code from repository..."
    git pull origin main
}

# Build Docker images
function Build-Images {
    Log-Info "Building Docker images..."
    docker-compose build --no-cache
}

# Stop existing containers
function Stop-Containers {
    Log-Info "Stopping existing containers..."
    docker-compose down
}

# Start containers
function Start-Containers {
    Log-Info "Starting containers..."
    docker-compose up -d
}

# Run database migrations
function Run-Migrations {
    Log-Info "Running database migrations..."
    try {
        docker-compose exec backend npm run migrate
    } catch {
        Log-Warn "No migrations to run or migration failed"
    }
}

# Check container health
function Check-Health {
    Log-Info "Checking container health..."
    Start-Sleep -Seconds 10
    
    # Check backend health
    try {
        $backendResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing
        if ($backendResponse.Content -match '"status":"healthy"') {
            Log-Info "Backend is healthy"
        } else {
            throw "Backend health check returned unexpected response"
        }
    } catch {
        Log-Error "Backend health check failed"
        docker-compose logs backend
        exit 1
    }
    
    # Check frontend health
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:80/health" -UseBasicParsing
        if ($frontendResponse.Content -match "healthy") {
            Log-Info "Frontend is healthy"
        } else {
            throw "Frontend health check returned unexpected response"
        }
    } catch {
        Log-Error "Frontend health check failed"
        docker-compose logs frontend
        exit 1
    }
}

# Show logs
function Show-Logs {
    Log-Info "Showing container logs..."
    docker-compose logs -f
}

# Main deployment flow
function Main {
    Log-Info "Starting deployment process..."
    
    Check-Docker
    Check-DockerCompose
    Check-EnvFile
    
    switch ($Action) {
        'full' {
            Pull-Code
            Stop-Containers
            Build-Images
            Start-Containers
            Run-Migrations
            Check-Health
            Log-Info "Deployment completed successfully!"
        }
        'rebuild' {
            Stop-Containers
            Build-Images
            Start-Containers
            Check-Health
            Log-Info "Rebuild completed successfully!"
        }
        'restart' {
            Stop-Containers
            Start-Containers
            Check-Health
            Log-Info "Restart completed successfully!"
        }
        'logs' {
            Show-Logs
        }
    }
}

# Run main function
Main
