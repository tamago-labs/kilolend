#!/bin/bash

# KiloLend Bots - Docker Build and ECR Deployment Script
# This script builds Docker images for all three bots and pushes them to AWS ECR

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="kilolend"
AWS_REGION="${AWS_REGION:-ap-northeast-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID}"
ENVIRONMENT="${ENVIRONMENT:-dev}"

# Bot configurations
declare -A BOTS=(
    ["kilo_point_bot"]="kilolend-point-bot"
)

# Function to print colored output
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

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        print_status $RED "❌ Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_status $RED "❌ Docker daemon is not running"
        exit 1
    fi
    print_status $GREEN "✅ Docker is available"
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_status $RED "❌ AWS CLI is not installed"
        exit 1
    fi
    print_status $GREEN "✅ AWS CLI is available"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_status $RED "❌ AWS credentials not configured"
        exit 1
    fi
    print_status $GREEN "✅ AWS credentials are configured"
    
    # Get AWS Account ID if not provided
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
        print_status $YELLOW "🔍 Detected AWS Account ID: $AWS_ACCOUNT_ID"
    fi
}

# Function to create ECR repository if it doesn't exist
create_ecr_repository() {
    local repo_name=$1
    
    print_status $BLUE "🔍 Checking if ECR repository '$repo_name' exists..."
    
    if aws ecr describe-repositories --repository-names $repo_name --region $AWS_REGION &> /dev/null; then
        print_status $GREEN "✅ ECR repository '$repo_name' already exists"
    else
        print_status $YELLOW "📦 Creating ECR repository '$repo_name'..."
        aws ecr create-repository \
            --repository-name $repo_name \
            --region $AWS_REGION \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256
        print_status $GREEN "✅ ECR repository '$repo_name' created successfully"
    fi
}

# Function to get ECR login token
ecr_login() {
    print_status $BLUE "🔐 Logging into Amazon ECR..."
    aws ecr get-login-password --region $AWS_REGION | \
        docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    print_status $GREEN "✅ Successfully logged into ECR"
}

# Function to build and push a single bot
build_and_push_bot() {
    local bot_dir=$1
    local repo_name=$2
    local image_tag="${3:-latest}"
    
    print_header "Building and Pushing $repo_name"
    
    # Check if bot directory exists
    if [ ! -d "$bot_dir" ]; then
        print_status $RED "❌ Bot directory '$bot_dir' not found"
        return 1
    fi
    
    # Check if Dockerfile exists
    if [ ! -f "$bot_dir/Dockerfile" ]; then
        print_status $RED "❌ Dockerfile not found in '$bot_dir'"
        return 1
    fi
    
    # Create ECR repository
    create_ecr_repository $repo_name
    
    # Build the image
    local full_image_name="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$repo_name:$image_tag"
    
    print_status $BLUE "🔨 Building Docker image: $full_image_name"
    docker build -t $repo_name:$image_tag $bot_dir
    docker tag $repo_name:$image_tag $full_image_name
    
    print_status $GREEN "✅ Successfully built $repo_name:$image_tag"
    
    # Push the image
    print_status $BLUE "📤 Pushing image to ECR: $full_image_name"
    docker push $full_image_name
    
    print_status $GREEN "✅ Successfully pushed $full_image_name"
    
    # Also tag and push with environment and timestamp
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local env_tag="$ENVIRONMENT-$timestamp"
    local env_image_name="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$repo_name:$env_tag"
    
    docker tag $repo_name:$image_tag $env_image_name
    docker push $env_image_name
    
    print_status $GREEN "✅ Also pushed with tag: $env_tag"
    
    return 0
}

# Function to clean up local Docker images
cleanup_local_images() {
    print_header "Cleaning Up Local Images"
    
    for bot_dir in "${!BOTS[@]}"; do
        local repo_name=${BOTS[$bot_dir]}
        print_status $BLUE "🧹 Removing local image: $repo_name"
        docker rmi $repo_name:latest 2>/dev/null || true
        docker rmi $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$repo_name:latest 2>/dev/null || true
    done
    
    # Remove dangling images
    if [ "$(docker images -f dangling=true -q)" ]; then
        print_status $BLUE "🧹 Removing dangling images..."
        docker images -f dangling=true -q | xargs docker rmi 2>/dev/null || true
    fi
    
    print_status $GREEN "✅ Local cleanup completed"
}

# Function to display final summary
display_summary() {
    print_header "Deployment Summary"
    
    echo "🏷️  Environment: $ENVIRONMENT"
    echo "🌍 AWS Region: $AWS_REGION"
    echo "🏦 AWS Account: $AWS_ACCOUNT_ID"
    echo
    echo "📦 Deployed Images:"
    
    for bot_dir in "${!BOTS[@]}"; do
        local repo_name=${BOTS[$bot_dir]}
        local image_uri="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$repo_name:latest"
        echo "   • $repo_name: $image_uri"
    done
    
    echo
    echo "🎯 Next Steps:"
    echo "   1. Update your CDK script in backend-aws-cdk/ to use these image URIs"
    echo "   2. Configure environment variables for each service"
    echo "   3. Deploy your CDK stack"
    echo
    echo "💡 Example CDK usage:"
    echo '   const oracleImage = ecs.ContainerImage.fromRegistry("'$AWS_ACCOUNT_ID'.dkr.ecr.'$AWS_REGION'.amazonaws.com/kilolend-oracle-bot:latest");'
}

# Main deployment function
main() {
    print_header "KiloLend Bots - Docker ECR Deployment"
    
    echo "🚀 Starting deployment process..."
    echo "📅 Timestamp: $(date)"
    echo
    
    # Check prerequisites
    check_prerequisites
    
    # ECR login
    ecr_login
    
    # Build and push all bots
    local success_count=0
    local total_count=${#BOTS[@]}
    
    for bot_dir in "${!BOTS[@]}"; do
        local repo_name=${BOTS[$bot_dir]}
        
        if build_and_push_bot "$bot_dir" "$repo_name" "latest"; then
            ((success_count++))
        else
            print_status $RED "❌ Failed to deploy $repo_name"
        fi
    done
    
    # Clean up local images (optional)
    if [ "${CLEANUP_LOCAL:-true}" = "true" ]; then
        cleanup_local_images
    fi
    
    # Display summary
    display_summary
    
    # Final status
    if [ $success_count -eq $total_count ]; then
        print_status $GREEN "🎉 All $total_count bots deployed successfully!"
        exit 0
    else
        print_status $RED "⚠️  Only $success_count/$total_count bots deployed successfully"
        exit 1
    fi
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -r, --region REGION      AWS region (default: ap-northeast-1)"
    echo "  -a, --account-id ID      AWS account ID (auto-detected if not provided)"
    echo "  -e, --environment ENV    Environment tag (default: dev)"
    echo "  -h, --help              Show this help message"
    echo "  --no-cleanup            Skip local Docker image cleanup"
    echo
    echo "Environment Variables:"
    echo "  AWS_REGION              AWS region override"
    echo "  AWS_ACCOUNT_ID          AWS account ID override"
    echo "  ENVIRONMENT             Environment tag override"
    echo "  CLEANUP_LOCAL           Set to 'false' to skip cleanup (default: true)"
    echo
    echo "Examples:"
    echo "  $0                      # Deploy with default settings"
    echo "  $0 -e prod -r us-east-1 # Deploy to production in us-east-1"
    echo "  $0 --no-cleanup         # Deploy without cleaning up local images"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--region)
            AWS_REGION="$2"
            shift 2
            ;;
        -a|--account-id)
            AWS_ACCOUNT_ID="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --no-cleanup)
            CLEANUP_LOCAL="false"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_status $RED "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run main function
main
