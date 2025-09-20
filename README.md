# KiloLend

**KiloLend** is a stablecoin-focused decentralized lending protocol on **LINE Mini Dapp** that integrates an intelligent AI agent with a distinct character to help onboard new Web3 users. Interest rates adjust dynamically based on market utilization and the risk model assigned to each asset class, supported by real-time oracles like **Pyth** and **Orakl**, while the AI powered by the **AWS Bedrock AI engine** using the **Claude 4** model and operates within a secure TEE environment inside **AWS Nitro Enclaves**.

<img width="1920" height="1080" alt="Kilolend - KRW Stablecoin Hackathon  (1)" src="https://github.com/user-attachments/assets/e609d4b4-1ba4-4373-9160-1ccd26802615" />

## Links

- LINE Mini Dapp: https://liff.line.me/2007932254-AVnKMMp9
- Web Access: https://kilolend.xyz/
- YouTube Demo: https://youtu.be/rGSsaTShwN0
- Presentation: https://docsend.com/view/xk2hitgw5vk25y5g
- Dune Analytics: https://dune.com/pisuthd/kilolend-protocol-analytics

## Highlighted Features

- **Live on KAIA Mainnet**, built with **LINE Dapp Starter** and **LIFF SDK**
- **Compound V2 Fork** – built on battle-tested Compound V2 code with minimal modifications
- **Stablecoin-focused** – custom risk models supporting seamless stablecoin ↔ volatile asset lending
- **Gamification with KILO Points** – earned by active users and converted 1:1 into KILO tokens at launch
- **AI Agent Chat** – distinct LINE-style characters that help analyze portfolio performance and lending markets in real time
- **Social Growth System** – invite friends to multiply KILO points with up to 2x multipliers
- **Secured Agent with TEE** – AI agents can execute transactions securely using AWS Nitro Enclaves, providing hardware-level isolation for private key protection

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

### Secure Transaction Execution

<img width="1277" height="300" alt="encalve drawio" src="https://github.com/user-attachments/assets/36257d2f-d477-41b6-90da-5f757e07a31c" />


This is an experimental feature available only to whitelisted users during the beta testing phase that allows execute transactions securely on behalf of users through AWS Nitro Enclaves, providing hardware-level security similar to Phala TEE but on AWS infrastructure. Access will be gradually expanded based on testing results and user feedback. 

**How it works:**
- Users can ask the AI to execute transactions (supply, withdraw, borrow, repay) through natural conversation
- Transactions are processed in a secure hardware-isolated environment (Nitro Enclave)
- Private keys never leave the secure enclave, ensuring maximum security
- Complete audit trail and cryptographic verification of execution environment

KiloLend leverages hardware-level isolation to ensure private key protection, with no network access permitted from within the enclave environment. Transactions are executed in a cryptographically verifiable environment, and every action is recorded through a complete audit trail, ensuring full transparency and accountability.

The current version separates the AI agent on the client side while tasks are executed in the TEE environment. In future versions, the AI agent will be fully integrated within the TEE, enabling secure and autonomous transaction execution. 

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

## Roadmap

### Q3/2025 (Complete)
- Successfully launched V1 on KAIA Mainnet with full lending protocol functionality  
- Started off-chain KILO points program
- Supported 5 assets: USDT, KAIA, BORA, SIX, MBX with different risk models  
- Client-side AI agent assistance for user guidance  

### Q4/2025
- Implement autonomous agent framework 
- Enable automated execution based on user-defined strategies  
- Deploy agent infrastructure to TEE (Trusted Execution Environment)  
- Complete tokenomics design and prepare TGE documentation   

### Q1/2026
- Conduct full security audits and optimize performance
- Execute Token Generation Event (TGE) and public token launch   
- Integrate token utilities across the platform ecosystem  
- Begin token distribution to early adopters and community members

### Q2/2026
- Enable purchase of various stablecoins via credit card and other methods
- Expand partnership network with institutional clients and DeFi protocols  
- Launch V2 of lending contracts with KILO token integration  
- Enhance yield opportunities and optimization features

## Deployment (KAIA Mainnet)

All smart contracts are deployed on **KAIA Mainnet** and verified through **KaiaScan**. Users can easily view contract details, transactions, and interactions directly on KaiaScan. 

### Core Contracts
- **Comptroller:** [0x0B5f0Ba5F13eA4Cb9C8Ee48FB75aa22B451470C2](https://www.kaiascan.io/address/0x0B5f0Ba5F13eA4Cb9C8Ee48FB75aa22B451470C2)  
- **KiloOracle:** [0xBB265F42Cce932c5e383536bDf50B82e08eaf454](https://www.kaiascan.io/address/0xBB265F42Cce932c5e383536bDf50B82e08eaf454)  
- **StablecoinJumpRateModel:** [0x792ecD8E829ca66DE9a744F7a6C17F4B76FE932e](https://www.kaiascan.io/address/0x792ecD8E829ca66DE9a744F7a6C17F4B76FE932e)  
- **VolatileRateModel:** [0x741AD28811a05845D1de298860F796a54CaE2130](https://www.kaiascan.io/address/0x741AD28811a05845D1de298860F796a54CaE2130)  
- **CollateralRateModel:** [0x0FB331ed4abE0A2D7da880c6D81C42436B5abAC6](https://www.kaiascan.io/address/0x0FB331ed4abE0A2D7da880c6D81C42436B5abAC6)  

### Lending Markets
- **cUSDT (Stablecoin):** [0x498823F094f6F2121CcB4e09371a57A96d619695](https://www.kaiascan.io/address/0x498823F094f6F2121CcB4e09371a57A96d619695)  
- **cSIX (Volatile):** [0xC468dFD0C96691035B3b1A4CA152Cb64F0dbF64c](https://www.kaiascan.io/address/0xC468dFD0C96691035B3b1A4CA152Cb64F0dbF64c)  
- **cBORA (Volatile):** [0x7a937C07d49595282c711FBC613c881a83B9fDFD](https://www.kaiascan.io/address/0x7a937C07d49595282c711FBC613c881a83B9fDFD)  
- **cMBX (Volatile):** [0xE321e20F0244500A194543B1EBD8604c02b8fA85](https://www.kaiascan.io/address/0xE321e20F0244500A194543B1EBD8604c02b8fA85)  
- **cKAIA (Collateral Only):** [0x98Ab86C97Ebf33D28fc43464353014e8c9927aB3](https://www.kaiascan.io/address/0x98Ab86C97Ebf33D28fc43464353014e8c9927aB3)  



## Learn More About dapp-portal-sdk

- [dapp-portal-sdk guide](https://docs.dappportal.io/mini-dapp/mini-dapp-sdk) Get more information about dapp-portal-sdk!


