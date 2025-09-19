#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
ENCLAVE_NAME="kilolend-enclave"
MEMORY_MB=512
CPU_COUNT=2

echo -e "${GREEN}🚀 Starting KiloLend Nitro Enclave${NC}"

# Check if EIF exists
if [ ! -f "${ENCLAVE_NAME}.eif" ]; then
    echo -e "${RED}❌ ${ENCLAVE_NAME}.eif not found. Run ./build_enclave.sh first${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Configuring Nitro Enclaves allocator${NC}"
sudo nitro-cli-config -t ${CPU_COUNT} -m ${MEMORY_MB}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Allocator configured: ${CPU_COUNT} CPUs, ${MEMORY_MB}MB RAM${NC}"
else
    echo -e "${RED}❌ Failed to configure allocator${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 2: Checking for running enclaves${NC}"
RUNNING_ENCLAVES=$(nitro-cli describe-enclaves | jq '.Enclaves | length')

if [ "$RUNNING_ENCLAVES" -gt 0 ]; then
    echo -e "${YELLOW}⚠️ Found ${RUNNING_ENCLAVES} running enclave(s)${NC}"
    echo -e "${YELLOW}🛑 Stopping existing enclaves...${NC}"
    
    # Get all running enclave IDs and stop them
    ENCLAVE_IDS=$(nitro-cli describe-enclaves | jq -r '.Enclaves[].EnclaveID')
    for ENCLAVE_ID in $ENCLAVE_IDS; do
        echo -e "${YELLOW}Stopping enclave: ${ENCLAVE_ID}${NC}"
        nitro-cli terminate-enclave --enclave-id $ENCLAVE_ID
    done
    
    sleep 2
fi

echo -e "${YELLOW}Step 3: Starting new enclave${NC}"
nitro-cli run-enclave \
    --eif-path ${ENCLAVE_NAME}.eif \
    --cpu-count ${CPU_COUNT} \
    --memory ${MEMORY_MB} \
    --debug-mode

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Enclave started successfully!${NC}"
else
    echo -e "${RED}❌ Failed to start enclave${NC}"
    exit 1
fi

# Get enclave info
sleep 1
ENCLAVE_INFO=$(nitro-cli describe-enclaves)
ENCLAVE_ID=$(echo "$ENCLAVE_INFO" | jq -r '.Enclaves[0].EnclaveID')
ENCLAVE_CID=$(echo "$ENCLAVE_INFO" | jq -r '.Enclaves[0].EnclaveCID')

echo -e "${GREEN}📋 Enclave Information:${NC}"
echo -e "${GREEN}  ID: ${ENCLAVE_ID}${NC}"
echo -e "${GREEN}  CID: ${ENCLAVE_CID}${NC}"
echo -e "${GREEN}  Memory: ${MEMORY_MB}MB${NC}"
echo -e "${GREEN}  CPUs: ${CPU_COUNT}${NC}"

echo -e "${YELLOW}💡 Useful commands:${NC}"
echo -e "  Monitor console: nitro-cli console --enclave-id ${ENCLAVE_ID}"
echo -e "  Stop enclave: nitro-cli terminate-enclave --enclave-id ${ENCLAVE_ID}"
echo -e "  Check status: nitro-cli describe-enclaves"

echo -e "${GREEN}🎉 Enclave is ready to process transactions!${NC}"

# Test connection
echo -e "${YELLOW}Step 4: Testing enclave connection${NC}"
python3 << EOF
import socket
import json
import time

try:
    sock = socket.socket(socket.AF_VSOCK, socket.SOCK_STREAM)
    sock.settimeout(5)
    sock.connect((${ENCLAVE_CID}, 5005))
    
    test_msg = json.dumps({
        'request_id': 'startup_test',
        'user_address': '0x1234567890123456789012345678901234567890',
        'action': 'supply',
        'asset': 'USDT',
        'amount': '100'
    }) + '\n'
    
    sock.sendall(test_msg.encode())
    
    response = b''
    while True:
        chunk = sock.recv(1024)
        if not chunk:
            break
        response += chunk
        if response.endswith(b'\n'):
            break
    
    result = json.loads(response.decode().strip())
    print('✅ Connection test successful!')
    print(f'📄 Response: {result["success"]}')
    
    sock.close()
    
except Exception as e:
    print(f'❌ Connection test failed: {e}')
    print('⏳ Enclave may still be starting up...')
EOF