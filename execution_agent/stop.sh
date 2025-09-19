#!/bin/bash

# KiloLend Task Processor Stop Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping KiloLend Task Processor${NC}"

PID_FILE="/var/run/kilolend-task-processor.pid"

if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠️  No PID file found - processor may not be running${NC}"
    
    # Try to kill by process name
    PIDS=$(pgrep -f "task_processor.py" || true)
    if [ -n "$PIDS" ]; then
        echo -e "${YELLOW}🔍 Found running processes: $PIDS${NC}"
        echo "$PIDS" | xargs kill
        echo -e "${GREEN}✅ Processes terminated${NC}"
    else
        echo -e "${YELLOW}ℹ️  No running task processor found${NC}"
    fi
    exit 0
fi

PID=$(cat "$PID_FILE")
echo -e "${YELLOW}🔍 Found PID: $PID${NC}"

if ps -p "$PID" > /dev/null 2>&1; then
    echo -e "${YELLOW}⏹️  Stopping process $PID...${NC}"
    kill "$PID"
    
    # Wait for graceful shutdown
    for i in {1..10}; do
        if ! ps -p "$PID" > /dev/null 2>&1; then
            break
        fi
        echo -e "${YELLOW}⏳ Waiting for graceful shutdown... ($i/10)${NC}"
        sleep 1
    done
    
    # Force kill if still running
    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚡ Force killing process...${NC}"
        kill -9 "$PID"
    fi
    
    echo -e "${GREEN}✅ Task processor stopped${NC}"
else
    echo -e "${YELLOW}ℹ️  Process not running${NC}"
fi

# Clean up PID file
rm -f "$PID_FILE"
