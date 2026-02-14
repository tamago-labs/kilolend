# KiloLend

**KiloLend** is a stablecoin-focused decentralized lending protocol on **LINE Mini Dapp** that integrates an intelligent AI agent with a distinct character to help onboard new Web3 users. Interest rates adjust dynamically based on market utilization and the risk model assigned to each asset class, supported by **cross-chain price oracle infrastructure**, while the AI powered by the **AWS Bedrock AI engine** using the **Claude 4** model.

## Highlighted Features

- **Live on Mainnet**, launched via LINE Mini Dapp stack using LINE Dapp Starter and LIFF SDK, with multi-chain expansion in progress
- **Battle-tested Lending Architecture** – built on proven money market design patterns adapted for KiloLend
- **Stablecoin-focused** – optimized risk models supporting stablecoin and volatile asset lending pairs
- **Gamification with KILO Points** – earned by active users and converted 1:1 into KILO tokens at launch
- **AI DeFi Co-pilot Agent** – executes DeFi strategies across multiple protocols through intent-based chat commands, handling routing, execution, and on-chain transactions automatically

## System Overview

The system comprises 3 main components designed for scalability and user-friendly Web3 onboarding:

- **LINE Mini Dapp** – The main interface for users to fully access the system: supply and borrow assets, manage portfolios, send tokens, and invite friends to multiply KILO points. Alternatively, it can be accessed via browser if LINE is not installed. Wallets are secured by the LINE Mini Dapp — no private keys to manage, just sign in with LINE or Gmail.

- **Smart Contracts** – Handle decentralized lending for supported assets. Forked from Compound V2 with custom risk models for collateral-only assets, volatile assets, and stablecoins. The KILO Oracle provides price feeds using a combination of Pyth Oracle, Orakl Network, and an internal Oracle bot that tracks prices from CoinMarketCap and other sources.

- **Backend (AWS CDK)** – Uses AWS CDK stacks to deploy and manage infrastructure. Includes an ECS cluster running bots in Docker containers with auto-scaling, DynamoDB as the main database for KILO points and leaderboard data, and serverless Lambda functions serving APIs for the Mini Dapp. 

<img width="1494" height="705" alt="kilo-system-overview" src="https://github.com/user-attachments/assets/cab76214-c9b9-44c6-8462-009e1eaaf6ad" />

The system is designed for easy integration of new features, enabling continuous improvement while minimizing maintenance and costs through the **AWS CDK stack**. Forking **Compound V2** ensures security by leveraging a proven protocol, allowing us to focus on delivering core value from the start. The **LINE Mini Dapp** helps us scale to reach Asian users through LINE LIFF's unique features, while our **AI agent** assists in onboarding them to Web3.

## LINE Mini Dapp

LINE Mini Dapp is the main interface where users can **supply assets** like USDT into lending pools to earn interest automatically. When depositing, users receive **cTokens** representing their share, which can be redeemed anytime for the underlying assets plus accrued interest.

Users can **borrow against collateral** up to their collateral limit. They need to maintain healthy ratios to avoid liquidation and should regularly check their portfolio. Meanwhile, the **Liquidation Bot** is actively monitoring the protocol for unhealthy loans (collateral ratio < 1.20).

<img width="1920" height="1080" alt="Kilolend - KRW Stablecoin Hackathon " src="https://github.com/user-attachments/assets/7be74f6d-f32e-4b19-8e40-8628ca69a846" />

This Mini Dapp leverages many unique features from the LINE Mini Dapp SDK and LIFF SDK, enhancing usability in the following ways:

- **Seamless Login** – Users can authenticate via LINE, Google, or other supported providers. Once logged in, they can view their wallet address and a QR code for instant transactions.  

- **QR Code Reader** – Using `liff.scanCodeV2`, users can scan QR codes with their mobile camera to quickly send KAIA or USDT tokens to friends or anyone in need.

- **Invite for Boosting KILO Points** – Users can invite friends via `liff.shareTargetPicker()` one person at a time to earn bonus KILO points. Each invite gives 2%, with a cap of 100% (subject to change).

LINE profile name and picture are fetched for display purposes only and are not stored in the dapp or our system. If LINE is not installed, we can still access via a standard browser, but most features above will not be available.

## Smart Contract

KiloLend’s smart contracts use a **Compound V2 fork** with custom improvements for stablecoin lending. This gives the protocol proven security and reliable mechanics. Custom risk models help users borrow efficiently while keeping the system safe and robust. This approach lets the team focus on new features and user experience instead of rebuilding core lending logic.

<img width="1097" height="579" alt="kilo-smart-contract drawio" src="https://github.com/user-attachments/assets/4b10dbd3-0f06-4bdf-8675-d3e913067065" />

### Core Architecture

The lending protocol consists of interconnected smart contracts:

- **Comptroller** – Acts as the central management hub, controlling all market operations including collateral factors, liquidation thresholds, and market configurations. It ensures users maintain healthy borrowing positions and prevents risky transactions.
- **CToken Markets** – Each supported asset (like USDT and KAIA) has its own market contract that handles deposits, withdrawals, and interest calculations. When users supply assets, they receive cTokens representing their share of the pool.
- **Risk Models** – Dynamic algorithms adjust borrowing and lending rates per asset class based on utilization. Stablecoins use a low base rate with a gradual slope, volatile assets have steeper risk-adjusted curves, and collateral-only assets apply fixed rates for native tokens.
- **Kilo Oracle** – A Compound V2-compatible oracle supporting three modes: bot (manual prices), Pyth (real-time with staleness checks) and Orakl, with automatic decimal normalization for different token types.

### Lending & Borrowing Process

- **Supplying Assets** works by users depositing their tokens into lending pools to earn interest automatically. When they supply assets like USDT, they receive cTokens that represent their share of the pool and can be redeemed anytime for the underlying assets plus accrued interest. Interest rates adjust dynamically based on market demand.

- **Borrowing Against Collateral** allows users to unlock liquidity from their assets without selling them. Users can borrow up to their collateral limit while maintaining healthy ratios to avoid liquidation. The system continuously monitors portfolio health and provides clear indicators of borrowing capacity and liquidation risk.

- **Interest Accrual** happens automatically in real-time without requiring any user interaction. Both borrowers and lenders see their positions update continuously as interest compounds

This creates a seamless experience that abstracts away the complexity of DeFi while maintaining security and efficiency through proven Compound V2 mechanics.

## Backend 

KiloLend's backend infrastructure is built on AWS using Infrastructure as Code (CDK) to ensure scalability, reliability, and cost-effectiveness. The architecture consists of multiple specialized components that work together to support the decentralized lending protocol, KILO points system, and social features.

### Infrastructure Overview

- **AWS CDK Stack** – The entire backend is deployed and managed through AWS CDK (Cloud Development Kit), enabling version-controlled infrastructure that can be easily replicated across environments. This approach ensures consistent deployments and simplified maintenance.

- **ECS Cluster with Auto-Scaling** – Docker containers run specialized bots that monitor the protocol 24/7. The cluster automatically scales based on demand and includes health checks to ensure continuous operation.

- **Serverless APIs** – Lambda functions serve REST APIs that power the Mini Dapp features, including KILO points management, and invite system integration.

### Bot Infrastructure (ECS Cluster)

#### **Oracle Bot**
- **Purpose:** Update on-chain prices for all configured feeds
- **Data Sources:** CoinMarketCap API
- **Update Frequency:** Every 2 hours 

#### **Liquidation Bot** 
- **Purpose:** Monitors and executes liquidations to maintain protocol stability
- **Monitoring:** Continuously scans all borrowing positions every 10 minutes
- **Trigger Conditions:** Collateral ratio < 1.20 (liquidation threshold)

#### **KILO Point Bot** 
- **Purpose:** Tracks lending activities and calculates daily KILO point distributions
- **Event Monitoring:** Real-time tracking of Mint, Redeem, Borrow, RepayBorrow events
- **Calculation Formula:** `(Base TVL × 50%) + (Net Contribution × 50%) × Invite Multiplier`

This robust backend architecture ensures KiloLend can handle growth from hundreds to thousands of users while maintaining the reliability, security, and performance required for a DeFi lending protocol with social features.

## AI Assistants

KiloLend uses an AI assistant to guide you through DeFi lending with ease. Different agents come with unique personality traits, communication styles, and context programmed directly into the system prompt when a user starts chatting.

<img width="1674" height="465" alt="ai-diagram drawio" src="https://github.com/user-attachments/assets/b0718ad3-897b-418f-89ea-dcd308a41080" />

The agent is aware of both the user’s data and market trends by leveraging tools that gather information from the dApp state and external APIs.We now have 9 specialized tools covering market data, portfolio analytics, yield optimization, risk assessment, and position simulation, with more to be added in the future.

The following are all the agents and their settings in the current version.

**Penny the Penguin** 
- **Risk Profile:** Conservative, low-risk strategies
- **Best For:** New DeFi users, risk-averse investors, stable income seekers
- **Approach:** Prioritizes capital preservation, recommends USDT and conservative collateral ratios (health factor > 2.5), uses simple explanations with penguin metaphors

**Tora the Tiger** 
- **Risk Profile:** Aggressive, growth-focused opportunities
- **Best For:** Experienced DeFi users, yield maximizers, active portfolio managers
- **Approach:** Identifies high-APY opportunities (SIX 8.1%, BORA 7.8%, MBX 6.9%), suggests leveraged strategies with optimal health factors (> 2.0)

**Sly the Snake** 
- **Risk Profile:** Balanced, precision-focused strategies
- **Best For:** Data-driven users, optimization seekers, advanced strategists
- **Approach:** Calculates optimal collateral utilization, recommends rebalancing strategies, focuses on compound efficiency with precise ratios (2.1-2.3)

The AI maintains context across chat sessions and adapts responses based on preferred language and context. Currently, the system supports up to 10 messages per chat to help manage token costs, as we sponsor the usage. Users can clear the chat and start a new session at any time. This limit may change over time.

## How to Test

The smart contracts are built with **Foundry** and are located in the `/contracts` folder, with all tests and deployment scripts available.

### Setup

1. **Install Foundry**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. **Install Dependencies & Build**
```bash
cd contracts/
forge install
forge build
```

3. **Testing**

```bash
# Run all tests
forge test

# Run tests with detailed output
forge test -vvv

# Run specific test file
forge test --match-path test/CTokenTest.t.sol
```

## Test Structure

```
test/
├── unit/
│   ├── CToken.t.sol               # Supply, redeem, borrow, repay functionality
│   ├── Comptroller.t.sol          # Market management and collateral logic
│   ├── JumpRateModelV2.t.sol      # Interest rate calculations
│   └── OracleTest.t.sol           # Price oracle functionality
├── /
│   ├── MultiMarket.t.sol          # Complete user lending workflows
│   └── Liquidation.t.sol          # Liquidation scenarios
└── mocks/ 
    └── MockToken.t.sol              # Test token implementations
```

## Getting Started

1. First, install packages. This project is tested with node version v20.18.0. At least Node.js >=18.0.0 is recommended. 

```bash
npm install
# or
pnpm install
```

2. Add `.env.local and .env.production` file. 

If needed, other environment files can be added.
To open template code, `.env*` file should include basic variables. Here's example for `.env.local` file.  

```
NODE_ENV=local
NEXT_PUBLIC_CLIENT_ID={clientId provided when applying for the SDK}
NEXT_PUBLIC_CHAIN_ID=1001 //testnet
CLIENT_SECRET={clientSecret provided when applying for the SDK}
BASE_API_URL=https://dapp-starter.netlify.app //change with your domain
NEXT_PUBLIC_LIFF_ID={LIFF ID provided when enrolling LIFF app at LINE Developers}
```

3. Create trusted SSL certificates for local development.

[1] Install mkcert
```bash
brew install mkcert
brew install nss  # Only needed for Firefox support
```
[2] Create a local Certificate Authority
```bash
mkcert -install
```
[3] Make a cert directory and generate a certificate for local domains
```bash
mkdir cert
cd cert
mkcert -cert-file cert.pem -key-file key.pem localhost 127.0.0.1 ::1
```
[4] Start Dapp Starter 

```bash 
#To use port 3000
npm run dev
# or 
pnpm dev
#To use port 443 (required to get webhook)
npm run dev:https
# or
pnpm dev:https
```

## Deployment

KiloLend is deployed on multiple mainnet networks, with each deployment tailored to the specific blockchain's block time and ecosystem.

### Etherlink Mainnet

#### Core Contracts
- **Comptroller:** [0x42f098E6aE5e81f357D3fD6e104BAA77A195133A](https://explorer.etherlink.com/address/0x42f098E6aE5e81f357D3fD6e104BAA77A195133A?tab=index)  
- **KiloOracle:** [0xE370336C3074E76163b2f9B07876d0Cb3425488D](https://explorer.etherlink.com/address/0xE370336C3074E76163b2f9B07876d0Cb3425488D?tab=index)  
- **StablecoinRateModel:** [0x7a4399356987E22156b9a0f8449E0a5a9713D5a6](https://explorer.etherlink.com/address/0x7a4399356987E22156b9a0f8449E0a5a9713D5a6?tab=index)  
- **VolatileRateModel:** [0x790057160a6B183C80C0514f644eA6BCE9EDa0D4](https://explorer.etherlink.com/address/0x790057160a6B183C80C0514f644eA6BCE9EDa0D4?tab=index)   

#### Lending Markets
- **cUSDT (Stablecoin):** [0x5E9aF11F9a09174B87550B4Bfb4EdE65De933085](https://explorer.etherlink.com/address/0x5E9aF11F9a09174B87550B4Bfb4EdE65De933085?tab=index)  
- **cXTZ (Volatile):** [0x0cA8DaD1e517a9BB760Ba0C27051C4C3A036eA75](https://explorer.etherlink.com/address/0x0cA8DaD1e517a9BB760Ba0C27051C4C3A036eA75?tab=index)

---

### KUB Mainnet

#### Core Contracts
- **Comptroller:** [0x42f098E6aE5e81f357D3fD6e104BAA77A195133A](https://www.kubscan.com/address/0x42f098E6aE5e81f357D3fD6e104BAA77A195133A)  
- **KiloOracle:** [0xE370336C3074E76163b2f9B07876d0Cb3425488D](https://www.kubscan.com/address/0xE370336C3074E76163b2f9B07876d0Cb3425488D)  
- **StablecoinRateModel:** [0x7a4399356987E22156b9a0f8449E0a5a9713D5a6](https://www.kubscan.com/address/0x7a4399356987E22156b9a0f8449E0a5a9713D5a6)  
- **VolatileRateModel:** [0x790057160a6B183C80C0514f644eA6BCE9EDa0D4](https://www.kubscan.com/address/0x790057160a6B183C80C0514f644eA6BCE9EDa0D4)   

#### Lending Markets
- **cKUSDT (Stablecoin):** [0x5E9aF11F9a09174B87550B4Bfb4EdE65De933085](https://www.kubscan.com/address/0x5E9aF11F9a09174B87550B4Bfb4EdE65De933085)  
- **cKUB (Volatile):** [0x0cA8DaD1e517a9BB760Ba0C27051C4C3A036eA75](https://www.kubscan.com/address/0x0cA8DaD1e517a9BB760Ba0C27051C4C3A036eA75)

---

### KAIA Mainnet

#### Core Contracts
- **Comptroller:** [0x2591d179a0B1dB1c804210E111035a3a13c95a48](https://www.kaiascan.io/address/0x2591d179a0B1dB1c804210E111035a3a13c95a48)  
- **KiloOracle:** [0xE370336C3074E76163b2f9B07876d0Cb3425488D](https://www.kaiascan.io/address/0xE370336C3074E76163b2f9B07876d0Cb3425488D)  
- **StablecoinJumpRateModel:** [0x9948DFaC28D39c2EeDB7543E24c28df2922568A6](https://www.kaiascan.io/address/0x9948DFaC28D39c2EeDB7543E24c28df2922568A6)  
- **VolatileRateModel:** [0x836B1A7A6996cC04bA2387e691c7947679A1eF0d](https://www.kaiascan.io/address/0x836B1A7A6996cC04bA2387e691c7947679A1eF0d)   
#### Lending Markets
- **cUSDT (Stablecoin):** [0x20A2Cbc68fbee094754b2F03d15B1F5466f1F649](https://www.kaiascan.io/address/0x20A2Cbc68fbee094754b2F03d15B1F5466f1F649)  
- **cSIX (Volatile):** [0x287770f1236AdbE3F4dA4f29D0f1a776f303C966](https://www.kaiascan.io/address/0x287770f1236AdbE3F4dA4f29D0f1a776f303C966)  
- **cBORA (Volatile):** [0xA7247a6f5EaC85354642e0E90B515E2dC027d5F4](https://www.kaiascan.io/address/0xA7247a6f5EaC85354642e0E90B515E2dC027d5F4)  
- **cMBX (Volatile):** [0xa024B1DE3a6022FB552C2ED9a8050926Fb22d7b6](https://www.kaiascan.io/address/0xa024B1DE3a6022FB552C2ED9a8050926Fb22d7b6)  
- **cStKAIA (Volatile):** [0x8A424cCf2D2B7D85F1DFb756307411D2BBc73e07](https://www.kaiascan.io/address/0x8A424cCf2D2B7D85F1DFb756307411D2BBc73e07)  
- **cKAIA (Volatile):** [0x2029f3E3C667EBd68b1D29dbd61dc383BdbB56e5](https://www.kaiascan.io/address/0x2029f3E3C667EBd68b1D29dbd61dc383BdbB56e5)


## Learn More About dapp-portal-sdk

- [dapp-portal-sdk guide](https://docs.dappportal.io/mini-dapp/mini-dapp-sdk) Get more information about dapp-portal-sdk!


