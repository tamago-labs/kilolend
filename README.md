# KiloLend

**KiloLend** is a stablecoin-focused decentralized lending protocol on **LINE Mini Dapp** that integrates an intelligent AI agent with a distinct character to help onboard new Web3 users. Interest rates adjust dynamically based on market utilization and the risk model assigned to each asset class, supported by real-time oracles like **Pyth** and **Orakl**, while the AI provides personalized recommendations powered by the **AWS Bedrock** AI engine using the **Claude 4** model.

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

- **Backend (AWS CDK)** – Uses AWS **CDK stacks** to deploy and manage infrastructure. Includes an **ECS cluster** running bots in Docker containers with auto-scaling, **DynamoDB** as the main database for KILO points and leaderboard data, and **serverless Lambda functions** powering APIs for the Mini Dapp.  


<img width="1494" height="705" alt="kilo-system-overview" src="https://github.com/user-attachments/assets/cab76214-c9b9-44c6-8462-009e1eaaf6ad" />

The system is designed for easy integration of new features, enabling continuous improvement while minimizing maintenance and costs through the **AWS CDK stack**. Forking **Compound V2** ensures security by leveraging a proven protocol, allowing us to focus on delivering core value from the start. The **LINE Mini Dapp** helps us scale to reach Asian users through LINE LIFF’s unique features, while our **AI agent** assists in onboarding them to Web3.


 

## Smart Contract

The `BaseLendingMarket.sol` contract implements all core lending logic. Each stablecoin market (`USDTMarket.sol`, `KRWMarket.sol`, `JPYMarket.sol`, `THBMarket.sol`) extends this base contract with currency-specific implementations for decimal handling and USD conversion.

The `PriceOracle.sol` provides reliable price feeds, seamlessly switching between mock data for testing and live Pyth Network feeds in production. The `InterestRateModel.sol` implements a dual-slope interest rate curve, similar to major DeFi protocols, automatically adjusting borrow and supply rates based on market utilization to optimize capital efficiency.

## AI-Powered Recommendations

![Kilolend - KRW Stablecoin Hackathon ](https://github.com/user-attachments/assets/ddaf320c-7fd6-44bc-a5f9-e2767e464d6a)

To onboard new Web3 users efficiently, we provide an AI-powered recommendation system powered by AWS Bedrock. Users can simply state their intent (e.g., “I want to earn 5% on my USDT with low risk”) or choose from ready-made templates. The AI then analyzes available markets, compares risk and yield, and presents personalized, easy-to-understand options in any language. This helps new users quickly find what they need without navigating complex DeFi mechanics.

This will be very useful when more pools are added and when extended to additional DeFi services and staking reward pools. The current version analyzes available lending pools, but we aim to support portfolio analysis in the next release.

## Lending Mechanism

In the current version of KiloLend:

- **Collateral Options:** Users can deposit **WKAIA** or **stKAIA** tokens as collateral.
- **Loan-to-Value (LTV):** 
  - WKAIA supports up to **60% LTV**.  
  - stKAIA supports up to **65% LTV** (higher due to its yield-generating nature).
- **Interest Rates:** Rates **adjust dynamically** based on the utilization of each stablecoin pool to optimize liquidity.
- **Risk Management:**  
  - If a position falls below safe thresholds, **liquidators can seize collateral** to maintain protocol stability.
  - Ensures that the system remains solvent and users are protected.

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


