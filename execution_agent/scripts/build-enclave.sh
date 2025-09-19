#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Building KiloLend Enclave with Manual Private Key..."

if [ ! -f "package.json" ]; then
    echo "Error: Must run from execution_agent directory"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker is not running"
    exit 1
fi

if ! groups | grep -q "ne"; then
    echo "Error: User not in 'ne' group. Log out and back in."
    exit 1
fi

# Check if private key is set
if [ ! -f ".env" ] || ! grep -q "ENCLAVE_PRIVATE_KEY" .env; then
    echo "WARNING: ENCLAVE_PRIVATE_KEY not found in .env file"
    echo "Please set your private key in .env before building:"
    echo "ENCLAVE_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Building Docker image..."
docker build -t kilolend-enclave:latest ./enclave/

echo "Docker image info:"
docker images kilolend-enclave:latest

echo "Converting to Nitro Enclave format..."
nitro-cli build-enclave \
    --docker-uri kilolend-enclave:latest \
    --output-file kilolend-enclave.eif

if [ -f "kilolend-enclave.eif" ]; then
    echo "Enclave built successfully!"
    echo "Image size:"
    ls -lh kilolend-enclave.eif
    
    echo ""
    echo "Enclave measurements:"
    nitro-cli describe-eif --eif-path kilolend-enclave.eif
    
    echo ""
    echo "Build complete! You can now run the enclave with:"
    echo "   npm run start-enclave"
    echo ""
    echo "IMPORTANT: Make sure ENCLAVE_PRIVATE_KEY is set in your .env file"
else
    echo "Error: Enclave image file not found"
    exit 1
fi