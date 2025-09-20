'use client';

import React from 'react';
import {
  AgentGrid,
  AgentCard,
  AgentAvatar,
  AgentInfo,
  AgentName,
  AgentPersonality,
  AgentBadges,
  Badge,
  CustomSection,
  SectionTitle,
  CustomPromptInput,
  InfoBox
} from './styled';
import { AGENT_PRESETS } from '@/types/aiAgent';
import type { AgentPreset } from '@/types/aiAgent';

interface AgentSelectionStepProps {
  selectedAgent: AgentPreset | null;
  customPrompt: string;
  onAgentSelect: (agent: AgentPreset) => void;
}

const getAgentBadges = (agent: AgentPreset): string[] => {
  const { personality, defaultPreferences } = agent;
  const badges = [];


  // Communication style badge
  switch (defaultPreferences.communicationStyle) {
    case 'friendly':
      badges.push('Friendly');
      break;
    case 'formal':
      badges.push('Formal');
      break;
    case 'casual':
      badges.push('Casual');
      break;
  }

  // Risk tolerance badge
  switch (defaultPreferences.riskTolerance) {
    case 'low':
      badges.push('Conservative');
      break;
    case 'medium':
      badges.push('Balanced');
      break;
    case 'high':
      badges.push('High Yield');
      break;
  }


  // Focus areas badges
  if (defaultPreferences.focusAreas.includes('stable_returns')) {
    badges.push('Stable Returns');
  }
  if (defaultPreferences.focusAreas.includes('high_yields')) {
    badges.push('Growth Focus');
  }
  if (defaultPreferences.focusAreas.includes('optimization')) {
    badges.push('Efficiency Expert');
  }
  if (defaultPreferences.focusAreas.includes('beginner_friendly')) {
    badges.push('Educational');
  }
  if (defaultPreferences.focusAreas.includes('advanced_strategies')) {
    badges.push('Advanced Tactics');
  }

  return badges.slice(0, 1); // Limit to 3 badges max
};

export const AgentSelectionStep: React.FC<AgentSelectionStepProps> = ({
  selectedAgent,
  customPrompt,
  onAgentSelect,
}) => {
  return (
    <>
      <AgentGrid>
        {AGENT_PRESETS.slice(0, 3).map((agent) => {
          const badges = getAgentBadges(agent);
          return (
            <AgentCard
              key={agent.id}
              $selected={selectedAgent?.id === agent.id}
              onClick={() => onAgentSelect(agent)}
            >
              <AgentAvatar>
                <img src={`${agent.image}`} alt="Agent Avatar" />
              </AgentAvatar>
              <AgentInfo>
                <AgentName>{agent.name}</AgentName>
                <AgentBadges>
                  <Badge>Advisory Agent</Badge>
                  {badges.map((badge, index) => (
                    <Badge key={index}>{badge}</Badge>
                  ))}
                </AgentBadges>
              </AgentInfo>
            </AgentCard>
          );
        })}

        {/* <AgentCard
          $selected={selectedAgent?.id === "secured"}
          onClick={() => onAgentSelect({
            id: 'secured',
            name: 'Secured D',
            image: "./images/icon-robot.png",
            description: '',
            personality: 'robot',
            avatar: ' ',
            systemPrompt: `You are Secured D, a friendly and precise robotic assistant for KiloLend on the KAIA blockchain. Your personality is logical, structured, and focused on safely executing transactions while guiding users step by step.

            PERSONALITY TRAITS:
            - Use clear, concise, and precise language
            - Maintain a friendly and approachable tone, but with robotic efficiency
            - Prioritize safety, stability, and correct execution
            - Provide step-by-step guidance for transactions
            - Remind users of risks and confirm their actions
            
            KILOLEND CONTEXT:
            - Available assets: USDT (stable), MBX (gaming), BORA (gaming), SIX (utility), KAIA (collateral only)
            - Recommend starting with USDT for safety
            - Explain collateral, health factors, and liquidation clearly
            - Suggest conservative collateral ratios (health factor > 2.5)
            - Able to execute transactions on behalf of users (with their approval)
            
            COMMUNICATION STYLE:
            - Polite, professional, robotic yet approachable
            - Provide instructions clearly, in numbered steps if needed
            - Use phrases like "Action confirmed," "Processing safely," "Transaction executed," "Please review before confirming"
            - Always verify user understanding before executing
            `,
            defaultPreferences: {
              riskTolerance: 'low',
              focusAreas: ['stable_returns', 'beginner_friendly', 'safety'],
              communicationStyle: 'friendly'
            }
          })}
        >
          <AgentAvatar>
            <img src="./images/icon-robot.png" alt="Agent Avatar" />
          </AgentAvatar>
          <AgentInfo>
            <AgentName>Secured D</AgentName>
            <AgentBadges>
              <Badge>Execution Agent</Badge>
            </AgentBadges>
          </AgentInfo>
          <AgentPersonality>
            Restricted Users
          </AgentPersonality>
        </AgentCard> */}

      </AgentGrid>

      <InfoBox>
        <div className="info-title">
          <strong>This AI chat feature is in beta. Please make sure you understand the following:</strong>
        </div>
        <ul>
          <li><strong>Limited to 10 messages per chat:</strong> You can clear and start fresh anytime</li>
          <li><strong>Real-time data access:</strong> Portfolio analysis, market rates, and KILO points (requires wallet connection)</li>
          <li><strong>Responses may not always be accurate</strong> Please verify important information before acting</li>
        </ul>
      </InfoBox> 
    </>
  );
};