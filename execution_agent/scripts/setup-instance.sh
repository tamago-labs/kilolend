#!/bin/bash
set -e

echo "🚀 Setting up KiloLend Nitro Enclave Instance..."
 

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify allocator status
echo "✅ Checking allocator status..."
sudo systemctl status nitro-enclaves-allocator --no-pager

# Check available resources
echo "📊 Available enclave resources:"
echo "CPUs: $(cat /sys/module/nitro_enclaves/parameters/ne_cpus)"
echo "Memory: $(cat /sys/module/nitro_enclaves/parameters/ne_hugepages) hugepages"

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/kilolend-execution-agent
sudo chown ec2-user:ec2-user /opt/kilolend-execution-agent
cd /opt/kilolend-execution-agent

# Create logs directory
mkdir -p logs

echo "✅ Nitro Enclave instance setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Log out and log back in (for group changes): logout"
echo "2. Upload the KiloLend execution agent code to /opt/kilolend-execution-agent"
echo "3. Run: npm install"
echo "4. Run: npm run build-enclave"
echo "5. Run: npm start"
echo ""
echo "⚠️  Important notes:"
echo "- Make sure to fund the generated wallet with KAIA for gas fees"
echo "- Configure your .env file with proper API keys"
echo "- Test the enclave in debug mode first"