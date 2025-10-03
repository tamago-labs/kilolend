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
                  {badges.map((badge, index) => (
                    <Badge key={index}>{badge}</Badge>
                  ))}
                </AgentBadges>
              </AgentInfo>
            </AgentCard>
          );
        })}

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