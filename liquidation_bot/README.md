# Liquidation Bot

Automated liquidation bot for KiloLend protocol to detect and liquidate underwater positions.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file and configure:
```bash
cp .env.example .env
```

3. Edit `.env` file with your configuration:
```bash
# Your wallet private key (needs KAIA and tokens for liquidations)
PRIVATE_KEY=your_private_key_here

# Adjust liquidation parameters
MIN_PROFIT_USD=10
MAX_LIQUIDATION_USD=5000
CHECK_INTERVAL_SECONDS=60
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Features

- ✅ **Account Health Monitoring**: Tracks account liquidity vs shortfall
- ✅ **Underwater Detection**: Identifies accounts eligible for liquidation
- ✅ **Profit Calculation**: Estimates liquidation incentive profits
- ✅ **Multi-market Support**: Works across all cToken markets
- ✅ **Gas Price Protection**: Skips liquidations when gas is too expensive
- ✅ **Risk Management**: Configurable profit minimums and liquidation limits
- ✅ **Automated Execution**: Handles token approvals and liquidation calls
- ✅ **Performance Tracking**: Records liquidation history and statistics

## How It Works

### 1. Account Monitoring
- Tracks borrowers across all markets
- Checks account liquidity every 60 seconds
- Identifies accounts with shortfall (underwater)

### 2. Liquidation Opportunity Analysis
```
Account Health = (Collateral Value × Collateral Factor) - Borrow Value

If Account Health < 0:
  → Account is underwater
  → Eligible for liquidation
```

### 3. Profit Calculation
```
Max Liquidation = Borrow Balance × Close Factor (50%)
Liquidation Incentive = 8% (seize extra collateral)
Expected Profit = Liquidation Amount × Liquidation Incentive
```

### 4. Execution Decision
- ✅ Profit > Minimum threshold ($10)
- ✅ Gas price < Maximum threshold (50 gwei)
- ✅ Wallet has sufficient balance
- ✅ Collateral value > Minimum ($100)

## Sample Output

```
🔧 Initializing Liquidation Bot...
✅ Liquidation Bot initialized successfully
📍 Wallet address: 0x1234567890123456789012345678901234567890
📍 Comptroller: 0xA4d31FAD3D2b0b2777F639e6FBe125368Fd4d845
⏱️  Check interval: 60 seconds
💰 Min profit: $10
⛽ Max gas price: 50 gwei
💳 Wallet balance: 5.2341 KAIA

🚀 Starting liquidation monitoring...
⏱️  Checking every 60 seconds

⏰ 2025-09-09T10:30:00.000Z - Checking for liquidation opportunities...
🔍 Found underwater account: 0x9876543210987654321098765432109876543210
💧 Shortfall: $450.30

🎯 Found 1 liquidation opportunities
🚀 Executing liquidation...
👤 Borrower: 0x9876543210987654321098765432109876543210
💰 Liquidation value: $225.15
🎯 Expected profit: $18.01
🔄 Repaying 1250.500000 USDT
⛽ Gas price: 25.50 gwei
📝 Approving token spending...
✅ Token approval confirmed
📤 Liquidation transaction sent: 0xabc123def456...
⏳ Waiting for confirmation...
✅ Liquidation successful!
📊 Block: 12345678
⛽ Gas used: 450000
🎉 Total liquidations executed: 1
```

## Configuration

### Risk Management Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `MIN_PROFIT_USD` | Minimum profit to execute liquidation | `$10` |
| `MAX_LIQUIDATION_USD` | Maximum single liquidation size | `$5000` |
| `MIN_COLLATERAL_USD` | Minimum collateral value required | `$100` |
| `MAX_GAS_PRICE_GWEI` | Skip liquidations if gas > this | `50 gwei` |

### Protocol Parameters (Auto-fetched)

| Parameter | Description | Typical Value |
|-----------|-------------|---------------|
| Close Factor | Max % of borrow that can be liquidated | `50%` |
| Liquidation Incentive | Extra collateral seized as profit | `8%` |
| Collateral Factors | Loan-to-value ratios per asset | `70-85%` |

## Wallet Requirements

The liquidation wallet needs:

1. **KAIA**: For transaction gas fees
2. **Tokens**: To repay borrowers (USDT, SIX, BORA, MBX)
3. **Balancing**: Keep adequate balances of all tokens

### Token Balance Strategy

**Option 1: Pre-fund with all tokens**
```bash
# Maintain balances of:
- 10,000 USDT
- 50,000 SIX  
- 20,000 BORA
- 10,000 MBX
- 100 KAIA (for gas)
```

**Option 2: Just-in-time swapping**
- Keep only KAIA
- Swap tokens right before liquidation
- Requires DEX integration

## Borrower Discovery

The bot tracks borrowers through several methods:

1. **Event Listening**: Monitor `Borrow` events (recommended)
2. **Manual Addition**: Add known borrowers via `addBorrower()`
3. **Block Scanning**: Scan transaction logs (resource intensive)

### Recommended: Event-based Tracking

```javascript
// Listen to Borrow events to discover new borrowers
cToken.on('Borrow', (borrower, borrowAmount, accountBorrows, totalBorrows) => {
  bot.addBorrower(borrower);
});

// Remove when fully repaid
cToken.on('RepayBorrow', async (payer, borrower, repayAmount) => {
  const remainingDebt = await cToken.borrowBalanceStored(borrower);
  if (remainingDebt === 0n) {
    bot.removeBorrower(borrower);
  }
});
```

## Profit Analysis

### Liquidation Economics

```
Example Liquidation:
- Borrower owes: $1000 USDT
- Collateral: $800 worth of SIX (underwater!)
- Close Factor: 50%
- Max liquidation: $500 USDT

Execution:
1. Pay $500 USDT to protocol
2. Receive $540 worth of SIX (8% bonus)
3. Profit: $40 (8% of $500)

Costs:
- Gas fees: ~$5
- Net profit: ~$35
```

## Error Handling

The bot handles common scenarios:

- **Insufficient Balance**: Skips liquidation if wallet lacks funds
- **High Gas**: Waits for gas prices to drop
- **Transaction Failure**: Logs error and continues monitoring
- **Price Feed Issues**: Gracefully handles oracle failures
- **Network Issues**: Retries failed RPC calls

## Statistics & Monitoring

The bot tracks performance metrics:

```
📊 LIQUIDATION BOT STATISTICS
==============================
🎯 Total liquidations: 15
👀 Tracked borrowers: 127
💰 Total profit: $487.50
📈 Total volume: $6,093.75
📊 Avg profit per liquidation: $32.50

🏆 Recent liquidations:
  1. 2025-09-09T10:30:00.000Z - $18.01 profit
  2. 2025-09-09T09:15:00.000Z - $45.20 profit
  3. 2025-09-09T08:45:00.000Z - $32.10 profit
==============================
```

## Security Considerations

### Private Key Management
- Store private key securely (environment variables)
- Consider using hardware wallets for production
- Rotate keys periodically

### Wallet Isolation
- Use dedicated wallet for liquidations only
- Don't store large amounts beyond operational needs
- Monitor wallet for unusual activity

### MEV Protection
- Consider using private mempools
- Implement transaction timing strategies
- Monitor for front-running

## Advanced Features

### Integration with Point Bot
Combine with the Kilo Point Bot for enhanced borrower discovery:

```javascript
// In kilo_point_bot, add borrower tracking
async handleBorrowEvent(event, market) {
  // ... existing code ...
  
  // Notify liquidation bot
  if (liquidationBot) {
    liquidationBot.addBorrower(event.args.borrower);
  }
}
```

### Flash Loan Integration
For capital efficiency, integrate flash loans:

```javascript
async executeFlashLiquidation(opportunity) {
  // 1. Flash loan the repay amount
  // 2. Liquidate the borrower
  // 3. Sell seized collateral
  // 4. Repay flash loan + fees
  // 5. Keep profit
}
```

### Multi-DEX Arbitrage
Optimize collateral sales across multiple DEXs:

```javascript
async findBestCollateralSale(collateralToken, amount) {
  const prices = await Promise.all([
    getUniswapPrice(collateralToken, amount),
    getSushiswapPrice(collateralToken, amount),
    get1InchPrice(collateralToken, amount)
  ]);
  
  return prices.reduce((best, current) => 
    current.outputAmount > best.outputAmount ? current : best
  );
}
```

## Troubleshooting

### Common Issues

**"Insufficient funds" Error**
- Check wallet KAIA balance for gas
- Verify token balances for repayments
- Ensure token approvals are sufficient

**"Gas price too high" Warning**
- Adjust `MAX_GAS_PRICE_GWEI` setting
- Wait for network congestion to decrease
- Consider priority fee adjustments

**"No liquidation opportunities"**
- Verify borrowers are being tracked correctly
- Check oracle price feeds are working
- Confirm market parameters (close factor, etc.)

**Slow Performance**
- Reduce `CHECK_INTERVAL_SECONDS` if needed
- Optimize RPC calls with batching
- Consider running closer to RPC endpoint

### Debug Mode

Enable detailed logging:
```bash
LOG_LEVEL=debug npm start
```

## Next Steps

After deploying the liquidation bot:

1. **Monitor Performance**: Track profits and adjust parameters
2. **Scale Operations**: Add more capital for larger liquidations  
3. **Optimize Strategy**: Implement flash loans for capital efficiency
4. **Add Alerts**: Set up notifications for large opportunities
5. **Dashboard**: Build monitoring interface for bot performance

## Integration Summary

All three bots work together:

1. **Oracle Bot**: Ensures accurate pricing for liquidation calculations
2. **Point Bot**: Discovers borrowers and tracks protocol activity
3. **Liquidation Bot**: Executes profitable liquidations to maintain protocol health

This creates a complete ecosystem for KiloLend protocol automation!
