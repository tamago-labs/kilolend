#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "🔨 Building KiloLend Enclave..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from execution_agent directory"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Start with: sudo systemctl start docker"
    exit 1
fi

# Check if we're in the ne group
if ! groups | grep -q "ne"; then
    echo "❌ Error: User not in 'ne' group. Log out and back in, or run: sudo usermod -aG ne $USER"
    exit 1
fi

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t kilolend-enclave:latest ./enclave/

# Verify image was built
echo "📋 Docker image info:"
docker images kilolend-enclave:latest

# Convert to Nitro Enclave
echo "🔒 Converting to Nitro Enclave format..."
nitro-cli build-enclave \
    --docker-uri kilolend-enclave:latest \
    --output-file kilolend-enclave.eif

# Verify EIF file was created
if [ -f "kilolend-enclave.eif" ]; then
    echo "✅ Enclave built successfully!"
    echo "📏 Image size:"
    ls -lh kilolend-enclave.eif
    
    # Get measurements
    echo ""
    echo "🔐 Enclave measurements:"
    nitro-cli describe-eif --eif-path kilolend-enclave.eif
    
    echo ""
    echo "✅ Build complete! You can now run the enclave with:"
    echo "   npm run start-enclave"
else
    echo "❌ Error: Enclave image file not found"
    exit 1
fi