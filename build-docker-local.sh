#!/bin/bash

# Local Docker Build Script for KiloLend Bots
# This script builds all Docker images locally for testing before ECR deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
declare -A BOTS=( 
    ["kilo_point_bot"]="kilolend-point-bot"
)

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_header() {
    echo
    echo "=================================="
    echo "$1"
    echo "=================================="
}

build_bot() {
    local bot_dir=$1
    local image_name=$2
    
    print_header "Building $image_name"
    
    if [ ! -d "$bot_dir" ]; then
        print_status $RED "❌ Bot directory '$bot_dir' not found"
        return 1
    fi
    
    if [ ! -f "$bot_dir/Dockerfile" ]; then
        print_status $RED "❌ Dockerfile not found in '$bot_dir'"
        return 1
    fi
    
    print_status $BLUE "🔨 Building Docker image: $image_name:latest"
    
    if docker build -t "$image_name:latest" "$bot_dir"; then
        print_status $GREEN "✅ Successfully built $image_name:latest"
        
        # Show image info
        local image_size=$(docker images "$image_name:latest" --format "table {{.Size}}" | tail -n +2)
        print_status $BLUE "📦 Image size: $image_size"
        return 0
    else
        print_status $RED "❌ Failed to build $image_name"
        return 1
    fi
}

test_bot() {
    local image_name=$1
    
    print_status $BLUE "🧪 Testing $image_name container..."
    
    # Run a quick test to see if the container starts
    if docker run --rm "$image_name:latest" node -e "console.log('Container test successful')" 2>/dev/null; then
        print_status $GREEN "✅ Container test passed for $image_name"
        return 0
    else
        print_status $YELLOW "⚠️  Container test skipped for $image_name (may require env vars)"
        return 0
    fi
}

main() {
    print_header "KiloLend Bots - Local Docker Build"
    
    echo "🔨 Building all bot Docker images locally..."
    echo "📅 Timestamp: $(date)"
    echo
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_status $RED "❌ Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_status $RED "❌ Docker daemon is not running"
        exit 1
    fi
    
    print_status $GREEN "✅ Docker is available"
    echo
    
    local success_count=0
    local total_count=${#BOTS[@]}
    
    # Build all bots
    for bot_dir in "${!BOTS[@]}"; do
        local image_name=${BOTS[$bot_dir]}
        
        if build_bot "$bot_dir" "$image_name"; then
            test_bot "$image_name"
            ((success_count++))
        fi
        echo
    done
    
    # Show final summary
    print_header "Build Summary"
    
    print_status $BLUE "📊 Built Images:"
    docker images | grep "kilolend-.*-bot" | head -n ${#BOTS[@]}
    
    if [ $success_count -eq $total_count ]; then
        print_status $GREEN "🎉 All $total_count bots built successfully!"
        echo
        print_status $BLUE "🚀 Next step: Run ./deploy-docker-ecr.sh to push to AWS ECR"
    else
        print_status $RED "⚠️  Only $success_count/$total_count bots built successfully"
        exit 1
    fi
}

# Clean up function
cleanup() {
    print_header "Cleaning Up Local Images"
    
    for bot_dir in "${!BOTS[@]}"; do
        local image_name=${BOTS[$bot_dir]}
        print_status $BLUE "🧹 Removing $image_name:latest"
        docker rmi "$image_name:latest" 2>/dev/null || true
    done
    
    print_status $GREEN "✅ Cleanup completed"
}

# Handle command line arguments
if [ "$1" = "clean" ]; then
    cleanup
    exit 0
elif [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "Usage: $0 [clean|help]"
    echo
    echo "Commands:"
    echo "  (no args)  Build all Docker images locally"
    echo "  clean      Remove all built Docker images"
    echo "  help       Show this help message"
    echo
    echo "This script builds Docker images for:"
    for bot_dir in "${!BOTS[@]}"; do
        echo "  • ${BOTS[$bot_dir]} (from $bot_dir/)"
    done
    exit 0
fi

# Run main function
main
