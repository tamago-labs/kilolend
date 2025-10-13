module.exports = {
  // Blockchain
  RPC_URL: process.env.KAIA_RPC_URL,
  VAULT_ADDRESS: process.env.VAULT_CONTRACT_ADDRESS, 
  COMPTROLLER_ADDRESS: "0x0B5f0Ba5F13eA4Cb9C8Ee48FB75aa22B451470C2",

  // Tokens
  TOKENS: {
    USDT: process.env.USDT_ADDRESS,
    STKAIA: process.env.STKAIA_ADDRESS,
    KAIA: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  },

  // Bot
  BOT_ADDRESS: process.env.BOT_ADDRESS,
  OPERATION_INTERVAL: parseInt(process.env.OPERATION_INTERVAL_MINUTES || '100') * 60 * 1000,
  EMERGENCY_CHECK_INTERVAL: parseInt(process.env.EMERGENCY_CHECK_INTERVAL_MINUTES || '15') * 60 * 1000,

  // API
  API_BASE_URL: process.env.API_BASE_URL,
  API_KEY: process.env.API_KEY,
  VAULT_TASKS_TABLE_NAME: process.env.VAULT_TASKS_TABLE_NAME || 'kilo-vault-tasks',

  // AI
  AWS_REGION: process.env.AWS_REGION || 'ap-southeast-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID || 'apac.anthropic.claude-sonnet-4-20250514-v1:0',
  AI_ENABLED: process.env.AI_REASONING_ENABLED === 'true',

  // Risk Parameters
  RISK_PARAMS: {
    MIN_HEALTH_FACTOR: parseFloat(process.env.MIN_HEALTH_FACTOR || '1.2'),
    TARGET_HEALTH_FACTOR: parseFloat(process.env.TARGET_HEALTH_FACTOR || '1.6'),
    MAX_HEALTH_FACTOR: parseFloat(process.env.MAX_HEALTH_FACTOR || '2.0'),
    EMERGENCY_THRESHOLD: parseFloat(process.env.EMERGENCY_THRESHOLD || '1.3'),
    SAFE_HEALTH_FACTOR: parseFloat(process.env.SAFE_HEALTH_FACTOR || '1.5')
  },

  // Contract ABIs
  VAULT_ABI: [
    "function totalManagedAssets() external view returns (uint256)",
    "function liquidBalance() external view returns (uint256)",
    "function sharePrice() external view returns (uint256)"
  ],
 
  COMPTROLLER_ABI: [
    // Compound v2 function - returns (error, liquidity, shortfall)
    "function getAccountLiquidity(address account) external view returns (uint256, uint256, uint256)",

    // Get user's entered markets (collateral assets)
    "function getAssetsIn(address account) external view returns (address[])",

    // Get collateral factor for a market
    "function markets(address cTokenAddress) external view returns (bool isListed, uint256 collateralFactorMantissa, bool isComped)",

    // Close factor (max % that can be liquidated)
    "function closeFactorMantissa() external view returns (uint256)",

    // Liquidation incentive
    "function liquidationIncentiveMantissa() external view returns (uint256)"
  ],
  ERC20_ABI: [
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)"
  ]
};
