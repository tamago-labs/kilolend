# KAIA Leveraged Bot v2

Monitoring-only AI bot for KAIA Leverage Vault. Creates tasks for operators to execute manually.

## Features

- ✅ Monitors KAIA, stKAIA, USDT balances
- ✅ Monitors Health Factor from lending pool
- ✅ AI-powered decision making (Claude Sonnet 4)
- ✅ Creates tasks for operators
- ✅ Submits tasks to backend API
- ✅ 60-minute operation interval
- ✅ 5-minute emergency checks
- ✅ Console.log only (no Winston)
- ✅ NO transaction execution

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Required environment variables:
```env
KAIA_RPC_URL=https://public-en.node.kaia.io
VAULT_CONTRACT_ADDRESS=0xFe575cdE21BEb23d9D9F35e11E443d41CE8e68E3
LENDING_POOL_ADDRESS=0x0BC926EF3856542134B06DCf53c86005b08B9625
BOT_ADDRESS=0x...
API_BASE_URL=https://...
API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## Run

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

Docker:
```bash
docker build -t kaia-bot-v2 .
docker run -d --env-file .env kaia-bot-v2
```

## Architecture

```
MonitoringService → AIStrategy → TaskManager → Backend API → DynamoDB
```

## Configuration

- **Operation Interval**: 60 minutes (normal checks)
- **Emergency Interval**: 5 minutes (when HF < 1.5)
- **Target HF**: 1.8
- **Safe HF**: 1.5
- **Emergency HF**: 1.3

## Task Types

- `LEVERAGE_UP` - Increase leverage for better yields
- `LEVERAGE_DOWN` - Decrease leverage to reduce risk
- `EMERGENCY_STOP` - Close all positions immediately
- `REBALANCE` - Minor adjustments
- `HOLD` - No action needed

## Logs

Bot uses simple console.log for all output:
- 📊 Position snapshots
- 🧠 AI analysis
- 📝 Task creation
- ✅ Success messages
- ❌ Error messages
- 🚨 Emergency alerts

## Safety

- Bot does NOT execute transactions
- Bot does NOT need private key
- All tasks require operator approval
- Emergency checks every 5 minutes
- Immediate alerts for critical HF

## Version

v2.0.0 - Monitoring only, task creation
