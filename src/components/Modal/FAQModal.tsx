'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { BaseModal } from './BaseModal';
import { ChevronDown, ChevronUp, Shield, Zap, Award, Code, HelpCircle } from 'react-feather';

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
`;

const IntroSection = styled.div`
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 20px;
`;

const IntroTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const IntroText = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
`;

const CategorySection = styled.div` 
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const CategoryIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #06C755, #05b648);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const CategoryTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const AccordionItem = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    border-color: #cbd5e1;
  }
`;

const AccordionHeader = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 16px 20px;
  background: ${({ $isOpen }) => ($isOpen ? '#f8fafc' : 'white')};
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: #f8fafc;
  }
`;

const QuestionText = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  margin-right: 12px;
`;

const ChevronIcon = styled.div<{ $isOpen: boolean }>`
  color: #64748b;
  transition: transform 0.2s;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(0deg)' : 'rotate(0deg)')};
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${({ $isOpen }) => ($isOpen ? '500px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const AnswerContent = styled.div`
  padding: 0 20px 20px 20px;
  color: #374151;
  font-size: 14px;
  line-height: 1.6;

  p {
    margin-bottom: 12px;
  }

  ul {
    margin: 12px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 6px;
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

  .warning {
    background: #fef3c7;
    padding: 2px 6px;
    border-radius: 4px;
    color: #92400e;
    font-weight: 600;
  }
`;

const ContactSection = styled.div`
  margin-top: 32px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  text-align: center;
`;

const ContactTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const ContactText = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
`;

const ContactButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #06C755, #05b648);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  }
`;

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: "Platform & Network",
    icon: <Shield size={16} />,
    items: [
      {
        question: "Which blockchain network does KiloLend operate on?",
        answer: `<p>KiloLend operates on the <span class="highlight">KAIA Mainnet</span>, a high-performance blockchain  designed to bring Web3 to millions of users across Asia and is fully supported with the LINE Mini Dapp.</p>
        `
      }
    ]
  },
  {
    title: "Security & Smart Contracts",
    icon: <Shield size={16} />,
    items: [
      {
        question: "How secure are KiloLend's smart contracts?",
        answer: `<p>KiloLend's smart contracts are forked from <span class="highlight">Compound V2</span>, a proven and battle-tested lending protocol on Ethereum and have been modified to support seamless stablecoin <> volatile asset markets on KAIA.</p><p> All contracts are open source, publicly verifiable and currently undergoing security audits.</p>
         `
      }, 
      {
        question: "Is my money safe on KiloLend?",
        answer: `<p>KiloLend implements multiple security layers:</p>
        <ul>
  <li><strong>Non-custodial:</strong> Fully decentralized and composable</li>
  <li><strong>Smart Contract Security:</strong> Built on battle-tested Compound V2 code</li>
  <li><strong>Transparent:</strong> All transactions are executed on-chain and verifiable</li>
  <li><strong>Risk Management:</strong> An active liquidation bot prevents bad debt</li>
</ul>
       `
      }
    ]
  },
  {
    title: "KILO Points & Rewards",
    icon: <Award size={16} />,
    items: [
      {
        question: "What are KILO Points and how do they work?",
        answer: ` <p><span class="highlight">KILO Points</span> are reward points earned by using KiloLend that convert <strong>1:1 into KILO Tokens</strong> at launch.</p>
<ul>
  <li><strong>1:1 Conversion:</strong> 1 KILO Point = 1 KILO Token at launch</li>
  <li><strong>Automatic Earning:</strong> Points are earned through lending, borrowing activities, and TVL contributions</li>
  <li><strong>Pre-launch Rewards:</strong> Accumulate points before the official token launch</li>
</ul>
<p>Visit the <strong>KILO Points page</strong> in the app for detailed breakdown and current balance.</p>
`
      }, 
    ]
  },
  {
    title: "AI Advisor & Features",
    icon: <Shield size={16} />,
    items: [ 
      {
        question: "How do I use the AI recommendations feature?",
        answer: `<p>Using our AI Advisor is simple and intuitive:</p>
        <ul>
          <li><strong>Access:</strong> Click "Ask AI" on the home screen</li>
          <li><strong>Input:</strong> Describe your goals or choose from quick templates</li>
          <li><strong>Analysis:</strong> KiloBot analyzes markets and your portfolio</li>
          <li><strong>Recommendations:</strong> Review AI-generated lending strategies</li>
          
        </ul>
        <p>Try templates like "I want to earn passive income with low risk" or "Help me maximize yields with USDT."</p>`
      }
    ]
  },
  {
    title: "Getting Started",
    icon: <Zap size={16} />,
    items: [ 
      {
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
        question: "What are the fees for using KiloLend?",
        answer: `<p>KiloLend maintains transparent, competitive fee structure:</p>
        <ul>
          <li><strong>No Platform Fees:</strong> Zero fees for supplying assets</li>
          <li><strong>Interest Spread:</strong> Small spread between supply and borrow rates</li>
          <li><strong>No Hidden Costs:</strong> All fees are transparent and displayed upfront</li>
        </ul>
        `
      },
      {
        question: "Who is behind KiloLend?",
        answer: `
        <p>KiloLend is structured under an offshore entity and has delegated 
        operations and maintenance to <span class="highlight">Tamago Labs</span>, 
        a Web3 software company based in Japan.</p>
        `
      }
    ]
  }
];

export const FAQModal = ({ isOpen, onClose }: FAQModalProps) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const newOpenItems = new Set(openItems);
    
    if (newOpenItems.has(key)) {
      newOpenItems.delete(key);
    } else {
      newOpenItems.add(key);
    }
    
    setOpenItems(newOpenItems);
  };

  const isItemOpen = (categoryIndex: number, itemIndex: number) => {
    return openItems.has(`${categoryIndex}-${itemIndex}`);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Frequently Asked Questions">
      <ModalContainer>
      

        {FAQ_DATA.map((category, categoryIndex) => (
          <CategorySection key={categoryIndex}>
            {/* <CategoryHeader>
              <CategoryIcon>{category.icon}</CategoryIcon>
              <CategoryTitle>{category.title}</CategoryTitle>
            </CategoryHeader> */}

            {category.items.map((item, itemIndex) => {
              const isOpen = isItemOpen(categoryIndex, itemIndex);
              
              return (
                <AccordionItem key={itemIndex}>
                  <AccordionHeader 
                    onClick={() => toggleItem(categoryIndex, itemIndex)}
                    $isOpen={isOpen}
                  >
                    <QuestionText>{item.question}</QuestionText>
                    <ChevronIcon $isOpen={isOpen}>
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </ChevronIcon>
                  </AccordionHeader>
                  
                  <AccordionContent $isOpen={isOpen}>
                    <AnswerContent dangerouslySetInnerHTML={{ __html: item.answer }} />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </CategorySection>
        ))}

        <ContactSection>
          <ContactTitle>Still Have Questions?</ContactTitle>
          <ContactText>
            Can't find what you're looking for? Our support team is here to help you with any questions about KiloLend.
          </ContactText>
          <ContactButton onClick={() => alert("Email to support@tamagolabs.com")}>
            <HelpCircle size={16} />
            Contact Support
          </ContactButton>
        </ContactSection>
      </ModalContainer>
    </BaseModal>
  );
};
