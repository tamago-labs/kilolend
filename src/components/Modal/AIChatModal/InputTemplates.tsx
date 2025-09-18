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
  max-height: 300px;
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
  padding: 10px 12px;
  margin: 4px 0;
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
    margin-bottom: 4px;
  }
  
  .template-description {
    color: #64748b;
    font-size: 12px;
  }
`;

const getAgentTemplates = (agent: AIAgent) => {
  const commonTemplates = {
    marketData: {
      text: "What are the current market rates?",
      description: "Get real-time APY rates and market statistics"
    }, 
    // yields: {
    //   text: "Find the best yield opportunities",
    //   description: "Discover optimal strategies for earning"
    // },
    simulate: {
      text: "What happens if I supply 1000 USDT?",
      description: "Simulate position changes and impacts"
    },
    portfolio: {
      text: "Analyze my portfolio risk",
      description: "Check portfolio health and liquidation risks"
    },
    basic:  {
      text: "Explain how DeFi lending works",
      description: "Learn the fundamentals of decentralized lending"
    },
    
  };
  
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
    common: Object.values(commonTemplates),
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
            <div className="template-description">{template.description}</div>
          </TemplateButton>
        ))}
      </TemplateSection>
      
      {/* <TemplateSection>
        <SectionTitle>
          {agent.personality === 'tiger' && 'Conservative Strategies'}
          {agent.personality === 'snake' && 'Growth Strategies'}
          {agent.personality === 'balanced' && 'Balanced Approach'}
          {agent.personality === 'penguin' && 'Learn DeFi'}
          {agent.personality === 'custom' && 'Guidance'}
        </SectionTitle>
        {templates.personality.map((template, index) => (
          <TemplateButton 
            key={index}
            onClick={() => onTemplateSelect(template.text)}
          >
            <div className="template-text">{template.text}</div>
            <div className="template-description">{template.description}</div>
          </TemplateButton>
        ))}
      </TemplateSection>
      
      <TemplateSection>
        <SectionTitle>⚡ Quick Actions</SectionTitle>
        {templates.actions.map((template, index) => (
          <TemplateButton 
            key={index}
            onClick={() => onTemplateSelect(template.text)}
          >
            <div className="template-text">{template.text}</div>
            <div className="template-description">{template.description}</div>
          </TemplateButton>
        ))}
      </TemplateSection> */}
    </TemplatesContainer>
  );
};

export default InputTemplates;