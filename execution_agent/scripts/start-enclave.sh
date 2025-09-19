#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "🚀 Starting KiloLend Nitro Enclave..."

# Check if EIF file exists
if [ ! -f "kilolend-enclave.eif" ]; then
    echo "❌ Error: Enclave image file not found. Run 'npm run build-enclave' first."
    exit 1
fi

# Check if enclave is already running
if nitro-cli describe-enclaves 2>/dev/null | grep -q "RUNNING"; then
    echo "⚠️  Enclave already running. Stopping existing enclave..."
    ./scripts/stop-enclave.sh
    sleep 3
fi

# Start enclave
echo "🔄 Starting enclave..."
nitro-cli run-enclave \
    --cpu-count 2 \
    --memory 512 \
    --enclave-cid 16 \
    --eif-path kilolend-enclave.eif \
    --debug-mode \
    > enclave-start.log 2>&1

# Parse the output
ENCLAVE_ID=$(grep -o '"EnclaveID": "[^"]*"' enclave-start.log | cut -d'"' -f4)

if [ -n "$ENCLAVE_ID" ]; then
    echo "✅ Enclave started successfully!"
    echo "🆔 Enclave ID: $ENCLAVE_ID"
    echo "📋 Enclave details:"
    nitro-cli describe-enclaves
    
    echo ""
    echo "📝 To view enclave logs (debug mode only):"
    echo "   nitro-cli console --enclave-id $ENCLAVE_ID"
    
    echo ""
    echo "⏰ Waiting for enclave to initialize (30 seconds)..."
    sleep 30
    
    echo "🧪 Testing enclave connectivity..."
    if timeout 10 bash -c "echo > /dev/tcp/localhost/5000" 2>/dev/null; then
        echo "✅ Enclave is responding on port 5000"
    else
        echo "⚠️  Enclave may still be starting up. Check logs with:"
        echo "   nitro-cli console --enclave-id $ENCLAVE_ID"
    fi
else
    echo "❌ Error: Failed to start enclave"
    echo "📋 Error details:"
    cat enclave-start.log
    exit 1
fi