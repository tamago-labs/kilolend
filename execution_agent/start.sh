#!/bin/bash

# KiloLend Task Processor Startup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting KiloLend Task Processor${NC}"

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/kilolend-task-processor.log"
PID_FILE="/var/run/kilolend-task-processor.pid"

# Environment variables (set defaults if not provided)
export AWS_REGION=${AWS_REGION:-"ap-southeast-1"}
export USER_POINTS_TABLE_NAME=${USER_POINTS_TABLE_NAME:-"kilo-user-points-2"}
export ENCLAVE_PORT=${ENCLAVE_PORT:-"5005"}
export POLL_INTERVAL_SECONDS=${POLL_INTERVAL_SECONDS:-"10"}
export MAX_RETRIES=${MAX_RETRIES:-"3"}
export BATCH_SIZE=${BATCH_SIZE:-"10"}

# Check if already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Task processor already running (PID: $PID)${NC}"
        exit 1
    else
        echo -e "${YELLOW}🧹 Removing stale PID file${NC}"
        rm -f "$PID_FILE"
    fi
fi

# Create log directory
sudo mkdir -p "$(dirname "$LOG_FILE")"
sudo chown ec2-user:ec2-user "$(dirname "$LOG_FILE")"

# Install dependencies if needed
echo -e "${YELLOW}📦 Checking Python dependencies...${NC}"
pip3 install --user boto3 > /dev/null 2>&1 || {
    echo -e "${RED}❌ Failed to install Python dependencies${NC}"
    exit 1
}

# Check AWS credentials
echo -e "${YELLOW}🔐 Checking AWS credentials...${NC}"
aws sts get-caller-identity > /dev/null 2>&1 || {
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo -e "${YELLOW}💡 Run: aws configure${NC}"
    exit 1
}

# Check if enclave is running
echo -e "${YELLOW}🔍 Checking for Nitro Enclave...${NC}"
if ! command -v nitro-cli &> /dev/null; then
    echo -e "${RED}❌ nitro-cli not found${NC}"
    echo -e "${YELLOW}💡 Install Nitro Enclaves CLI first${NC}"
    exit 1
fi

ENCLAVE_STATUS=$(nitro-cli describe-enclaves 2>/dev/null || echo '{"Enclaves":[]}')
ENCLAVE_COUNT=$(echo "$ENCLAVE_STATUS" | jq '.Enclaves | length')

if [ "$ENCLAVE_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No running enclaves found${NC}"
    echo -e "${YELLOW}💡 Start the enclave first with your build script${NC}"
    # Don't exit - processor can wait for enclave
fi

# Start the processor
echo -e "${GREEN}✅ Starting task processor...${NC}"

cd "$SCRIPT_DIR"
nohup python3 task_processor.py > "$LOG_FILE" 2>&1 & 
PROCESSOR_PID=$!

# Save PID
echo "$PROCESSOR_PID" > "$PID_FILE"

# Wait a moment and check if it's still running
sleep 2
if ps -p "$PROCESSOR_PID" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Task processor started successfully!${NC}"
    echo -e "${GREEN}📋 PID: $PROCESSOR_PID${NC}"
    echo -e "${GREEN}📄 Logs: $LOG_FILE${NC}"
    echo -e "${YELLOW}💡 Monitor with: tail -f $LOG_FILE${NC}"
    echo -e "${YELLOW}💡 Stop with: kill $PROCESSOR_PID${NC}"
else
    echo -e "${RED}❌ Task processor failed to start${NC}"
    echo -e "${YELLOW}📄 Check logs: $LOG_FILE${NC}"
    rm -f "$PID_FILE"
    exit 1
fi