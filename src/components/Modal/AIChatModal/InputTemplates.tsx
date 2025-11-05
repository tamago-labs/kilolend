'use client';

import React from 'react';
import styled from 'styled-components';
import type { AIAgent } from '@/types/aiAgent';

interface InputTemplatesProps {
  agent: AIAgent;
  onTemplateSelect: (template: string) => void;
  isVisible: boolean;
}

const TemplatesContainer = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  max-height: 500px;
  overflow-y: auto;
  z-index: 10;
  display: ${({ $visible }) => $visible ? 'block' : 'none'};
`;

const TemplateSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TemplateButton = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 12px;
  margin: 3px 0;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  line-height: 1.4;
  
  &:hover {
    background: #f8fafc;
    border-color: #06C755;
    transform: translateY(-1px);
  }
  
  .template-text {
    color: #1e293b;
  }
`;

const getAgentTemplates = (agent: AIAgent) => {
  const commonTemplates = [
    // {
    //   text: "What are the current market rates?",
    //   description: "Get real-time APY rates and market statistics"
    // }, 
    {
      text: "Which token has the highest APY right now?",
      description: "Find the best yield opportunities"
    },
    {
      text: "What happens if I supply 100 USDT?",
      description: "Simulate position changes and impacts"
    },
    {
      text: "Analyze my portfolio risk",
      description: "Check portfolio health and liquidation risks"
    },
    {
      text: "Explain how DeFi lending works",
      description: "Learn the fundamentals of decentralized lending"
    },
    // {
    //   text: "What's the safest way to earn yield?",
    //   description: "Conservative strategy focused on capital preservation"
    // },
    {
      text: "I want to supply 100 USDT",
      description: "Execute a supply action with AI guidance"
    },
    {
      text: "Help me borrow 50 USDT",
      description: "Guided borrowing with risk assessment"
    },
    {
      text: "I want to repay my loan",
      description: "Loan repayment planning and execution"
    },
    {
      text: "Withdraw my supplied KAIA",
      description: "Safe withdrawal planning and execution"
    },
    {
      text: "What's my current health factor?",
      description: "Check portfolio health and risks"
    },
    // {
    //   text: "Which token has the highest APY right now?",
    //   description: "Find the best yield opportunities"
    // },
    {
      text: "What are the current market rates?",
      description: "Get real-time APY rates and market statistics"
    }, 
    {
      text: "What's the maximum I can borrow safely?",
      description: "Calculate safe borrowing limits"
    },
    {
      text: "Show me my portfolio summary",
      description: "Quick overview of your positions"
    },
    {
      text: "Am I at risk of liquidation?",
      description: "Assess liquidation risk level"
    }
  ];
  
  const personalityTemplates = {
    conservative: [
      {
        text: "What's the safest way to earn yield?",
        description: "Conservative strategy focused on capital preservation"
      },
      {
        text: "Analyze my risk exposure",
        description: "Comprehensive risk assessment and mitigation"
      },
      {
        text: "Generate a low-risk strategy for $5000",
        description: "Personalized conservative investment plan"
      }
    ],
    aggressive: [
      {
        text: "Show me the highest APY opportunities",
        description: "Maximum yield strategies for growth seekers"
      },
      {
        text: "How can I leverage my KAIA for more yield?",
        description: "Advanced leveraging strategies and opportunities"
      },
      {
        text: "Generate an aggressive growth strategy",
        description: "High-return investment plan with managed risk"
      }
    ],
    balanced: [
      {
        text: "How should I balance risk and reward?",
        description: "Optimal portfolio allocation strategies"
      },
      {
        text: "Optimize my current portfolio allocation",
        description: "Rebalancing recommendations for better performance"
      },
      {
        text: "Create a diversified DeFi strategy",
        description: "Balanced approach to yield and risk management"
      }
    ],
    educational: [
      {
        text: "Explain how DeFi lending works",
        description: "Learn the fundamentals of decentralized lending"
      },
      {
        text: "What is a health factor and why does it matter?",
        description: "Understanding key DeFi concepts and metrics"
      },
      {
        text: "Teach me about yield farming strategies",
        description: "Educational guide to earning in DeFi"
      }
    ],
    custom: [
      {
        text: "Help me understand my options",
        description: "General guidance based on your custom instructions"
      },
      {
        text: "What should I focus on today?",
        description: "Personalized recommendations for your goals"
      }
    ]
  };
  
  const actionTemplates = [
    {
      text: "I want to supply 500 USDT",
      description: "Execute a supply action with AI guidance"
    },
    {
      text: "Help me borrow against my collateral",
      description: "Guided borrowing with risk assessment"
    },
    {
      text: "I need to withdraw some funds",
      description: "Safe withdrawal planning and execution"
    }
  ];
  
  return {
    common: commonTemplates,
    personality: personalityTemplates[agent.personality as keyof typeof personalityTemplates] || personalityTemplates.custom,
    actions: actionTemplates
  };
};

export const InputTemplates: React.FC<InputTemplatesProps> = ({ 
  agent, 
  onTemplateSelect, 
  isVisible 
}) => {
  const templates = getAgentTemplates(agent);
  
  return (
    <TemplatesContainer $visible={isVisible}>
      <TemplateSection>
        {/* <SectionTitle>📊 Market & Portfolio</SectionTitle> */}
        {templates.common.map((template, index) => (
          <TemplateButton 
            key={index}
            onClick={() => onTemplateSelect(template.text)}
          >
            <div className="template-text">{template.text}</div>
          </TemplateButton>
        ))}
      </TemplateSection>
       
    </TemplatesContainer>
  );
};

export default InputTemplates;
