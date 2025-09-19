#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping KiloLend Enclave${NC}"

# Get running enclaves
ENCLAVE_INFO=$(nitro-cli describe-enclaves 2>/dev/null)
ENCLAVE_COUNT=$(echo "$ENCLAVE_INFO" | jq '.Enclaves | length' 2>/dev/null || echo "0")

if [ "$ENCLAVE_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}ℹ️ No running enclaves found${NC}"
    exit 0
fi

echo -e "${YELLOW}🔍 Found ${ENCLAVE_COUNT} running enclave(s)${NC}"

# Stop all running enclaves
ENCLAVE_IDS=$(echo "$ENCLAVE_INFO" | jq -r '.Enclaves[].EnclaveID')
for ENCLAVE_ID in $ENCLAVE_IDS; do
    echo -e "${YELLOW}🛑 Stopping enclave: ${ENCLAVE_ID}${NC}"
    nitro-cli terminate-enclave --enclave-id $ENCLAVE_ID
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Enclave ${ENCLAVE_ID} stopped${NC}"
    else
        echo -e "${RED}❌ Failed to stop enclave ${ENCLAVE_ID}${NC}"
    fi
done

echo -e "${GREEN}🎉 All enclaves stopped${NC}"