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
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 16px;
  line-height: 1.2;
`;

const FAQSubtitle = styled.p`
  font-size: 18px;
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
    id: 'what-is-kilolend',
    question: "What is KiloLend?",
    answer: `<p><span class="highlight">KiloLend</span> is an agent-native DeFi platform designed for both humans and AI agents. It provides on-chain lending, borrowing, and swap primitives that can be used directly by users or programmatically by autonomous agents.</p>
    <p>KiloLend is built from the ground up to support secure agent execution, APIs, and skill-based integrations.</p>`
  },

  {
    id: 'which-blockchain',
    question: "Which blockchain networks does KiloLend support?",
    answer: `<p>KiloLend is live on multiple mainnets:</p>
    <ul>
      <li><strong>Etherlink:</strong> EVM-compatible network for broader ecosystem access</li>
      <li><strong>KUB Chain:</strong> Optimized for the Thai market and Bitkub ecosystem</li>
      <li><strong>KAIA:</strong> Integrated with LINE Mini Dapp infrastructure</li>
    </ul>
    <p>Users and agents can operate across supported chains with a unified experience.</p>`
  },

  {
    id: 'agent-native',
    question: "What does agent-native DeFi mean?",
    answer: `<p><span class="highlight">Agent-native</span> means KiloLend is built specifically for autonomous execution, not retrofitted for agents.</p>
    <ul>
      <li>Dedicated agent wallets</li>
      <li>Programmatic access via API keys</li>
      <li>Skill-based integrations for agent tools like OpenClaw</li>
      <li>Controlled, session-based execution</li>
    </ul>
    <p>This allows AI agents to interact with DeFi safely, predictably, and at scale.</p>`
  },

  {
    id: 'agent-wallet',
    question: "What is an Agent Wallet?",
    answer: `<p>An <span class="highlight">Agent Wallet</span> is a secure execution wallet used by AI agents to perform on-chain actions.</p>
    <ul>
      <li>Protected by HSM infrastructure</li>
      <li>Paired with session keys for scoped execution</li>
      <li>Fully isolated from your main wallet</li>
      <li>User-controlled funding and withdrawal</li>
    </ul>
    <p>You can revoke access or withdraw funds at any time.</p>`
  },

  {
    id: 'security',
    question: "How secure is KiloLend?",
    answer: `<p>KiloLend applies multiple layers of security:</p>
    <ul>
      <li><strong>Battle-tested smart contracts:</strong> Forked from Compound V2</li>
      <li><strong>HSM-protected keys:</strong> For agent wallet custody</li>
      <li><strong>Session-based execution:</strong> Limits agent permissions</li>
      <li><strong>Non-custodial design:</strong> Users retain full asset control</li>
    </ul>
    <p>All transactions are executed on-chain and publicly verifiable.</p>`
  },

  {
    id: 'smart-contracts',
    question: "What DeFi protocols power KiloLend?",
    answer: `<p>KiloLend’s lending markets are based on a <span class="highlight">Compound V2 fork</span>, adapted for multi-chain deployment and agent execution.</p>
    <p>The protocol supports interest rate models, collateralized borrowing, and liquidation mechanisms designed for automated interaction.</p>`
  },

  {
    id: 'humans-vs-agents',
    question: "Can humans use KiloLend without AI agents?",
    answer: `<p>Yes. KiloLend is designed for <span class="highlight">both humans and AI agents</span>.</p>
    <ul>
      <li>Humans can lend, borrow, and swap directly via the UI</li>
      <li>Advanced users can automate strategies using agents and APIs</li>
    </ul>
    <p>You choose how much automation you want.</p>`
  },

  {
    id: 'openclaw',
    question: "How does KiloLend work with OpenClaw?",
    answer: `<p>KiloLend provides <span class="highlight">agent skills</span> that allow OpenClaw agents to interact with the protocol.</p>
    <ul>
      <li>No custom integrations required</li>
      <li>Use API keys to authorize execution</li>
      <li>Compatible with any AI model supported by OpenClaw</li>
    </ul>
    <p>This enables automated DeFi workflows across messaging apps, bots, and schedulers.</p>`
  },

  {
    id: 'playground',
    question: "What is the Agent Playground?",
    answer: `<p>The <span class="highlight">Agent Playground</span> is a built-in environment to test and simulate agent actions.</p>
    <ul>
      <li>Test prompts before going live</li>
      <li>Validate transactions safely</li>
      <li>Inspect execution results in real time</li>
    </ul>
    <p>This reduces errors and speeds up agent development.</p>`
  },

  {
    id: 'fees',
    question: "What fees does KiloLend charge?",
    answer: `<p>KiloLend maintains a transparent fee model:</p>
    <ul>
      <li>No platform fee for supplying assets</li>
      <li>Borrowers pay interest based on market utilization</li>
      <li>Standard on-chain gas fees apply</li>
    </ul>`
  },

  {
    id: 'who-behind',
    question: "Who is building KiloLend?",
    answer: `<p>KiloLend is developed and maintained by <span class="highlight">Tamago Labs</span>, a Web3 infrastructure company focused on agent-native financial systems.</p>`
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
            Everything you need to know about KiloLend
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
