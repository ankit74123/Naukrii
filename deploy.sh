#!/bin/bash

# Job Portal Deployment Script
# This script automates the deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    log_info "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    log_info "Docker Compose is installed"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        log_warn ".env file not found. Creating from .env.example..."
        cp .env.example .env
        log_warn "Please update .env file with your configuration"
        exit 1
    fi
    log_info ".env file exists"
}

# Pull latest code
pull_code() {
    log_info "Pulling latest code from repository..."
    git pull origin main
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    docker-compose build --no-cache
}

# Stop existing containers
stop_containers() {
    log_info "Stopping existing containers..."
    docker-compose down
}

# Start containers
start_containers() {
    log_info "Starting containers..."
    docker-compose up -d
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    docker-compose exec backend npm run migrate || log_warn "No migrations to run"
}

# Check container health
check_health() {
    log_info "Checking container health..."
    sleep 10  # Wait for containers to start
    
    # Check backend health
    BACKEND_HEALTH=$(curl -s http://localhost:5000/api/health | grep -o '"status":"healthy"' || echo "")
    if [ -z "$BACKEND_HEALTH" ]; then
        log_error "Backend health check failed"
        docker-compose logs backend
        exit 1
    fi
    log_info "Backend is healthy"
    
    # Check frontend health
    FRONTEND_HEALTH=$(curl -s http://localhost:80/health | grep -o "healthy" || echo "")
    if [ -z "$FRONTEND_HEALTH" ]; then
        log_error "Frontend health check failed"
        docker-compose logs frontend
        exit 1
    fi
    log_info "Frontend is healthy"
}

# Show logs
show_logs() {
    log_info "Showing container logs..."
    docker-compose logs -f
}

# Main deployment flow
main() {
    log_info "Starting deployment process..."
    
    check_docker
    check_docker_compose
    check_env_file
    
    # Parse arguments
    case "${1:-full}" in
        full)
            pull_code
            stop_containers
            build_images
            start_containers
            run_migrations
            check_health
            log_info "Deployment completed successfully!"
            ;;
        rebuild)
            stop_containers
            build_images
            start_containers
            check_health
            log_info "Rebuild completed successfully!"
            ;;
        restart)
            stop_containers
            start_containers
            check_health
            log_info "Restart completed successfully!"
            ;;
        logs)
            show_logs
            ;;
        *)
            log_error "Invalid argument. Use: full, rebuild, restart, or logs"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
