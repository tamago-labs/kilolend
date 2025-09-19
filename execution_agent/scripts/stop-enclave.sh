#!/bin/bash
set -e

echo "🛑 Stopping KiloLend Nitro Enclave..."

# Get running enclaves
RUNNING_ENCLAVES=$(nitro-cli describe-enclaves 2>/dev/null | jq -r '.[] | select(.State == "RUNNING") | .EnclaveID' 2>/dev/null || true)

if [ -z "$RUNNING_ENCLAVES" ]; then
    echo "ℹ️  No running enclaves found"
    exit 0
fi

# Stop each running enclave
echo "$RUNNING_ENCLAVES" | while read -r ENCLAVE_ID; do
    if [ -n "$ENCLAVE_ID" ]; then
        echo "🔄 Stopping enclave: $ENCLAVE_ID"
        nitro-cli terminate-enclave --enclave-id "$ENCLAVE_ID"
        echo "✅ Enclave $ENCLAVE_ID stopped"
    fi
done

echo "✅ All enclaves stopped"

# ===================================
# execution_agent/scripts/check-status.sh
# ===================================
#!/bin/bash

echo "📊 KiloLend Execution Agent Status"
echo "=================================="

# Check system info
echo "🖥️  System Info:"
echo "   Instance Type: $(curl -s http://169.254.169.254/latest/meta-data/instance-type)"
echo "   Instance ID: $(curl -s http://169.254.169.254/latest/meta-data/instance-id)"
echo ""

# Check Nitro Enclaves allocator
echo "⚙️  Nitro Enclaves Allocator:"
if systemctl is-active --quiet nitro-enclaves-allocator; then
    echo "   Status: ✅ Running"
    echo "   CPUs: $(cat /sys/module/nitro_enclaves/parameters/ne_cpus)"
    echo "   Memory: $(cat /sys/module/nitro_enclaves/parameters/ne_hugepages) hugepages"
else
    echo "   Status: ❌ Not running"
fi
echo ""

# Check Docker
echo "🐳 Docker:"
if systemctl is-active --quiet docker; then
    echo "   Status: ✅ Running"
    echo "   Images: $(docker images --format "table {{.Repository}}:{{.Tag}}" | grep kilolend || echo "No KiloLend images")"
else
    echo "   Status: ❌ Not running"
fi
echo ""

# Check enclaves
echo "🔒 Nitro Enclaves:"
ENCLAVES=$(nitro-cli describe-enclaves 2>/dev/null || echo "[]")
if [ "$ENCLAVES" = "[]" ]; then
    echo "   Status: ❌ No enclaves running"
else
    echo "   Status: ✅ Running"
    echo "$ENCLAVES" | jq -r '.[] | "   ID: \(.EnclaveID)\n   State: \(.State)\n   CPUs: \(.NumberOfCPUs)\n   Memory: \(.MemoryMiB) MiB"' 2>/dev/null || echo "   Details: $ENCLAVES"
fi
echo ""

# Check API server
echo "🌐 API Server:"
if pgrep -f "node server.js" > /dev/null; then
    echo "   Status: ✅ Running (PID: $(pgrep -f 'node server.js'))"
    if timeout 5 curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "   Health: ✅ Responding"
    else
        echo "   Health: ❌ Not responding"
    fi
else
    echo "   Status: ❌ Not running"
fi
echo ""

# Check logs
echo "📋 Recent Logs:"
if [ -f "logs/combined.log" ]; then
    echo "   Last 5 log entries:"
    tail -5 logs/combined.log | sed 's/^/   /'
else
    echo "   No log file found"
fi

echo ""
echo "🔧 Quick Actions:"
echo "   Start API: npm start"
echo "   Build Enclave: npm run build-enclave"
echo "   Start Enclave: npm run start-enclave"
echo "   Stop Enclave: npm run stop-enclave"