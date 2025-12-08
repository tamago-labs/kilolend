"use client";

import styled from 'styled-components';
import { useState } from 'react';
import { ChevronDown } from 'react-feather';

// FAQ Section Styles
const FAQWrapper = styled.section`
   
  padding: 80px 32px;
  margin: 48px 0;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
`;

const FAQContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FAQHeader = styled.div`
  text-align: center;
  margin-bottom: 64px;
`;

const FAQTitle = styled.h2`
  font-size: clamp(32px, 4vw, 40px);
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 16px;
  line-height: 1.2;
`;

const FAQSubtitle = styled.p`
  font-size: clamp(18px, 2vw, 20px);
  color: #64748b;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const FAQGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 80%;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 968px) {
    gap: 12px;
  }
`;

const FAQItem = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;

  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const FAQQuestion = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 24px;
  background: ${({ $isOpen }) => ($isOpen ? '#f8fafc' : 'white')};
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  gap: 16px;

  &:hover {
    background: #f8fafc;
  }
`;

const QuestionContent = styled.div`
  flex: 1;
`;


const QuestionText = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
  margin: 0;
`;

const ChevronIcon = styled.div<{ $isOpen: boolean }>`
  color: #64748b;
  transition: transform 0.2s;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  flex-shrink: 0;
`;

const FAQAnswer = styled.div<{ $isOpen: boolean }>`
  max-height: ${({ $isOpen }) => ($isOpen ? '500px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease; 
`;

const AnswerContent = styled.div`
  padding: 0 24px 24px 24px;
  color: #475569;
  font-size: 16px;
  padding-top: 30px;
  line-height: 1.6;

  p {
    margin-bottom: 12px;
  }

  ul {
    margin: 12px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }

  strong {
    color: #1e293b;
    font-weight: 600;
  }

  .highlight {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    padding: 2px 6px;
    border-radius: 4px;
    color: #166534;
    font-weight: 600;
  }
`;

// FAQ Data - Comprehensive from all modal categories
const FAQ_DATA = [
  {
    id: 'which-blockchain',
    question: "Which blockchain network does KiloLend operate on?",
    answer: `<p>KiloLend operates on the <span class="highlight">KAIA Mainnet</span>, a high-performance blockchain designed to bring Web3 to millions of users across Asia and is fully supported with the LINE Mini Dapp.</p>`
  },
  {
    id: 'how-secure-contracts',
    question: "How secure are KiloLend's smart contracts?",
    answer: `<p>KiloLend's smart contracts are forked from <span class="highlight">Compound V2</span>, a proven and battle-tested lending protocol on Ethereum and have been modified to support seamless stablecoin <> volatile asset markets on KAIA.</p><p>All contracts are open source, publicly verifiable and currently undergoing security audits.</p>`
  },
  {
    id: 'is-money-safe',
    question: "Is my money safe on KiloLend?",
    answer: `<p>KiloLend implements multiple security layers:</p>
    <ul>
      <li><strong>Non-custodial:</strong> Fully decentralized and composable</li>
      <li><strong>Smart Contract Security:</strong> Built on battle-tested Compound V2 code</li>
      <li><strong>Transparent:</strong> All transactions are executed on-chain and verifiable</li>
      <li><strong>Risk Management:</strong> An active liquidation bot prevents bad debt</li>
    </ul>`
  },
  {
    id: 'kilo-points',
    question: "What are KILO Points and how do they work?",
    answer: `<p><span class="highlight">KILO Points</span> are reward points earned by using KiloLend that convert <strong>1:1 into KILO Tokens</strong> at launch.</p>
    <ul>
      <li><strong>1:1 Conversion:</strong> 1 KILO Point = 1 KILO Token at launch</li>
      <li><strong>Automatic Earning:</strong> Points are earned through lending, borrowing activities, and TVL contributions</li>
      <li><strong>Pre-launch Rewards:</strong> Accumulate points before the official token launch</li>
    </ul>
    <p>Visit the <strong>KILO Points page</strong> in the app for detailed breakdown and current balance.</p>`
  },
  {
    id: 'what-is-ai-copilot',
    question: "What is AI DeFi Co-Pilot?",
    answer: `<p>The <span class="highlight">AI DeFi Co-Pilot</span> is an intelligent assistant that executes DeFi transactions automatically based on your instructions. Simply tell the AI what you want to achieve, and it handles all the calculations, swaps, and optimizations for you.</p>`
  },
  {
    id: 'create-ai-wallet',
    question: "How do I create an AI-agent wallet?",
    answer: `<p>Getting started with AI Co-Pilot is simple and currently <span class="highlight">free</span> during beta:</p>
    <ul>
      <li><strong>Create AI Wallet:</strong> Set up your AI-agent wallet (100 beta slots available)</li>
      <li><strong>Choose Character:</strong> Select AI personality and model (AWS Nova or Claude)</li>
      <li><strong>Start Chatting:</strong> Just tell AI what you want to do naturally</li>
    </ul>
    <p>AI-agent wallets are hosted in secure enterprise AWS environment, separate from your main wallet.</p>`
  },
  {
    id: 'ai-execute',
    question: "What can AI Co-Pilot automatically execute?",
    answer: `<p>AI Co-Pilot leverages our <span class="highlight">KAIA-MCP plugin</span> to interact directly with blockchain protocols:</p>
    <ul>
      <li><strong>KiloLend:</strong> Lend, borrow, repay, and redeem</li>
      <li><strong>DragonSwap V3:</strong> Get quotes and execute swaps</li>
      <li><strong>Price Data:</strong> Real-time prices from CoinMarketCap</li>
      <li><strong>KAIA Native:</strong> Wrap and unwrap KAIA tokens</li>
    </ul>`
  },
  {
    id: 'ai-free',
    question: "Is AI Co-Pilot free to use?",
    answer: `<p>AI Co-Pilot is currently <span class="highlight">free during beta</span> with 100 AI-agent wallet slots available. After KILO token launch, AI inference will be paid using KILO tokens at reasonable rates.</p>
    <p>Supported AI models include AWS Nova and Claude Sonnet for optimal performance.</p>`
  },
  {
    id: 'tokens-lend-borrow',
    question: "What tokens can I lend and borrow?",
    answer: `<p>KiloLend focuses on <span class="highlight">stablecoins</span> with support for major stable assets:</p>
    <ul>
      <li><strong>USDT:</strong> Tether USD - Most liquid stablecoin</li>
      <li><strong>KAIA:</strong> Native network token for collateral</li>
      <li><strong>More Assets:</strong> Additional tokens being added regularly</li>
    </ul>
    <p>With us, you can either increase exposure by using them as collateral to borrow USDT for buying more, or you can speculate on supported tokens by collateralizing USDT.</p>`
  },
  {
    id: 'fees',
    question: "What are the fees for using KiloLend?",
    answer: `<p>KiloLend maintains transparent, competitive fee structure:</p>
    <ul>
      <li><strong>No Platform Fees:</strong> Zero fees for supplying assets</li>
      <li><strong>Interest Spread:</strong> Small spread between supply and borrow rates</li>
      <li><strong>No Hidden Costs:</strong> All fees are transparent and displayed upfront</li>
    </ul>`
  },
  {
    id: 'behind-kilolend',
    question: "Who is behind KiloLend?",
    answer: `<p>KiloLend is a decentralized, non-custodial lending protocol on KAIA blockchain with <span class="highlight">Tamago Labs</span>, a Web3 software company based in Japan, operating the frontend interface and technical infrastructure.</p>`
  }
];

export const FAQSection = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    
    setOpenItems(newOpenItems);
  };

  const isItemOpen = (id: string) => {
    return openItems.has(id);
  };


  return (
    <FAQWrapper>
      <FAQContainer>
        <FAQHeader>
          <FAQTitle>Frequently Asked Questions</FAQTitle>
          <FAQSubtitle>
            Everything you need to know about KiloLend - from platform basics to DeFi Co-Pilot agent
          </FAQSubtitle>
        </FAQHeader>

        <FAQGrid>
          {FAQ_DATA.map((item) => {
            const isOpen = isItemOpen(item.id);
            
            return (
              <FAQItem key={item.id}>
                <FAQQuestion onClick={() => toggleItem(item.id)} $isOpen={isOpen}>
                  <QuestionContent>
                    <QuestionText>{item.question}</QuestionText>
                  </QuestionContent>
                  <ChevronIcon $isOpen={isOpen}>
                    <ChevronDown size={20} />
                  </ChevronIcon>
                </FAQQuestion>
                
                <FAQAnswer $isOpen={isOpen}>
                  <AnswerContent dangerouslySetInnerHTML={{ __html: item.answer }} />
                </FAQAnswer>
              </FAQItem>
            );
          })}
        </FAQGrid>
      </FAQContainer>
    </FAQWrapper>
  );
};
