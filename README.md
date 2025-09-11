# KiloLend

**KiloLend** is a stablecoin-focused decentralized lending protocol on **LINE Mini Dapp** that integrates an intelligent AI agent with a distinct character to help onboard new Web3 users. Interest rates adjust dynamically based on market utilization and the risk model assigned to each asset class, supported by real-time oracles like **Pyth** and **Orakl**, while the AI powered by the **AWS Bedrock** AI engine using the **Claude 4** model.

- LINE Mini Dapp: https://liff.line.me/2007932254-AVnKMMp9
- Web Access: https://kilolend.xyz/

## Highlighted Features

- Live on **KAIA Mainnet**, built with **LINE Dapp Starter** and LIFF SDK  
- **Compound V2 Fork** – built on **battle-tested Compound V2** code with minimal modifications  
- **Stablecoin-focused** – custom risk models supporting seamless **stablecoin ↔ volatile asset** lending
- **Gamification with KILO Points** – earned by active users and converted **1:1 into KILO tokens** at launch  
- **AI Agent Chat** – distinct LINE-style characters that help analyze **portfolio performance** and **lending markets** in real time  

## System Overview

The system comprises **3 main components** as shown in the diagram below:

- **LINE Mini Dapp** – The main interface for users to fully access the system: supply and borrow assets, manage portfolios, send tokens, and invite friends to multiply KILO points. Alternatively, it can be accessed via browser if LINE is not installed. Wallets are secured by the LINE Mini Dapp — no private keys to manage, just sign in with LINE or Gmail.  

- **Smart Contracts** – Handle decentralized lending for supported assets. Forked from **Compound V2** with custom risk models for collateral-only assets, volatile assets, and stablecoins. The **KILO Oracle** provides price feeds using a combination of **Pyth Oracle, Orakl Network**, and an **internal Oracle bot** that tracks prices from CoinMarketCap and other sources.  

- **Backend (AWS CDK)** – Uses AWS **CDK stacks** to deploy and manage infrastructure. Includes an **ECS cluster** running bots in Docker containers with auto-scaling, **DynamoDB** as the main database for KILO points and leaderboard data, and **serverless Lambda functions** serving APIs for the Mini Dapp.  


<img width="1494" height="705" alt="kilo-system-overview" src="https://github.com/user-attachments/assets/cab76214-c9b9-44c6-8462-009e1eaaf6ad" />

The system is designed for easy integration of new features, enabling continuous improvement while minimizing maintenance and costs through the **AWS CDK stack**. Forking **Compound V2** ensures security by leveraging a proven protocol, allowing us to focus on delivering core value from the start. The **LINE Mini Dapp** helps us scale to reach Asian users through LINE LIFF’s unique features, while our **AI agent** assists in onboarding them to Web3.

## LINE Mini Dapp

LINE Mini Dapp is the main interface where users can **supply assets** like USDT into lending pools to earn interest automatically. When depositing, users receive **cTokens** representing their share, which can be redeemed anytime for the underlying assets plus accrued interest.  

Users can **borrow against collateral** up to their collateral limit. They need to maintain healthy ratios to avoid liquidation and should regularly check their portfolio. Meanwhile, the **Liquidation Bot** is actively monitoring the protocol for unhealthy loans (collateral ratio < 1.20). Additional features, like smart notifications, will be added in the future.

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

The lending protocol consists of interconnected smart contracts that work together as follows:

- **Comptroller** – Acts as the central management hub, controlling all market operations including collateral factors, liquidation thresholds, and market configurations. It ensures users maintain healthy borrowing positions and prevents risky transactions.
- **CToken Markets** – Each supported asset (like USDT and stKAIA) has its own market contract that handles deposits, withdrawals, and interest calculations. When users supply assets, they receive cTokens representing their share of the pool.
- **Risk Models** – Dynamic algorithms adjust borrowing and lending rates per asset class based on utilization. Stablecoins use a low base rate with a gradual slope, volatile assets have steeper risk-adjusted curves, and collateral-only assets apply fixed rates for native tokens.
- **Kilo Oracle** – A Compound V2-compatible oracle supporting three modes: bot (manual prices), Pyth (real-time with staleness checks) and Orakl, with automatic decimal normalization for different token types.

### Lending & Borrowing Process

- **Supplying Assets** works by users depositing their tokens into lending pools to earn interest automatically. When they supply assets like USDT, they receive cTokens that represent their share of the pool and can be redeemed anytime for the underlying assets plus accrued interest. The interest rates adjust dynamically based on market demand, ensuring competitive returns for lenders.

- **Borrowing Against Collateral** allows users to unlock liquidity from their assets without selling them. Users can borrow up to their collateral limit while maintaining healthy ratios to avoid liquidation. The system continuously monitors portfolio health and provides clear indicators of borrowing capacity and liquidation risk.

- **Interest Accrual** happens automatically in real-time without requiring any user interaction. Both borrowers and lenders see their positions update continuously as interest compounds

This all creates a seamless experience that abstracts away the complexity of DeFi. By building custom risk models and a multi-mode oracle on top of the proven Compound V2 framework, KiloLend is ready to deliver stablecoin-focused lending with security, efficiency, and simplicity for everyday users.

## Backend 

TBD

## AI Recommendations

TBD

## How to Test

The smart contracts are built with Foundry and are located in the /contracts folder, with all tests and deployment scripts available.

```
cd contracts/
forge build
forge test
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

## Deployment (KAIA Mainnet)

All smart contracts are deployed on the **KAIA Mainnet** and verified them all through **KaiaScan**, ensuring transparency. Users can easily view contract details, transactions, and interactions directly on KaiaScan. 

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


