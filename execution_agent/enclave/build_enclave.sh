#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
ENCLAVE_NAME="kilolend-enclave"
ENCLAVE_PORT=5005
MEMORY_MB=512
CPU_COUNT=2

echo -e "${GREEN}🔨 Building KiloLend Nitro Enclave${NC}"

# Check if we're in the right directory
if [ ! -f "kilolend_enclave.py" ]; then
    echo -e "${RED}❌ kilolend_enclave.py not found. Are you in the enclave directory?${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Building Docker image${NC}"
docker build -t ${ENCLAVE_NAME}:latest -f Dockerfile.server .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 2: Building Enclave Image File (EIF)${NC}"
nitro-cli build-enclave \
    --docker-uri ${ENCLAVE_NAME}:latest \
    --output-file ${ENCLAVE_NAME}.eif

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Enclave EIF built successfully${NC}"
    echo -e "${GREEN}📄 File: ${ENCLAVE_NAME}.eif${NC}"
else
    echo -e "${RED}❌ Enclave build failed${NC}"
    exit 1
fi

# Get file size
EIF_SIZE=$(du -h ${ENCLAVE_NAME}.eif | cut -f1)
echo -e "${GREEN}📊 Enclave size: ${EIF_SIZE}${NC}"

echo -e "${GREEN}🎉 Enclave build completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Configure allocator: sudo nitro-cli-config -t ${CPU_COUNT} -m ${MEMORY_MB}"
echo -e "  2. Run enclave: ./run_enclave.sh"