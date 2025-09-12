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
  onCustomPromptChange: (prompt: string) => void;
  onCustomPromptSelect: () => void;
}

const getAgentBadges = (agent: AgentPreset): string[] => {
  const { personality, defaultPreferences } = agent;
  const badges = [];

  // Risk tolerance badge
  switch (defaultPreferences.riskTolerance) {
    case 'low':
      badges.push('🛡️ Safety First');
      break;
    case 'medium':
      badges.push('⚖️ Balanced');
      break;
    case 'high':
      badges.push('🚀 High Yield');
      break;
  }

  // Communication style badge
  switch (defaultPreferences.communicationStyle) {
    case 'friendly':
      badges.push('🤗 Beginner-Friendly');
      break;
    case 'formal':
      badges.push('💪 Strategic');
      break;
    case 'casual':
      badges.push('🧠 Optimizer');
      break;
  }

  // Focus areas badges
  if (defaultPreferences.focusAreas.includes('stable_returns')) {
    badges.push('💎 Stable Returns');
  }
  if (defaultPreferences.focusAreas.includes('high_yields')) {
    badges.push('📈 Growth Focus');
  }
  if (defaultPreferences.focusAreas.includes('optimization')) {
    badges.push('⚙️ Efficiency Expert');
  }
  if (defaultPreferences.focusAreas.includes('beginner_friendly')) {
    badges.push('📚 Educational');
  }
  if (defaultPreferences.focusAreas.includes('advanced_strategies')) {
    badges.push('🎯 Advanced Tactics');
  }

  return badges.slice(0, 3); // Limit to 3 badges max
};

export const AgentSelectionStep: React.FC<AgentSelectionStepProps> = ({
  selectedAgent,
  customPrompt,
  onAgentSelect,
  onCustomPromptChange,
  onCustomPromptSelect
}) => {
  return (
    <>
      <SectionTitle>Choose Your Agent</SectionTitle>

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

      {/*<CustomSection>
        <SectionTitle>Or Create Custom Agent</SectionTitle>
        <CustomPromptInput
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="Describe your ideal AI assistant... For example: 'You are a conservative DeFi advisor who focuses on safety and explains everything in simple terms. Always prioritize capital preservation over high yields and provide detailed risk assessments.'"
          rows={4}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.shiftKey && customPrompt.trim()) {
              onCustomPromptSelect();
            }
          }}
        />
        {customPrompt.trim() && (
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button
              onClick={onCustomPromptSelect}
              style={{
                background: '#06C755',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Start Chat with Custom Agent
            </button>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Or press Shift + Enter
            </div>
          </div>
        )}
      </CustomSection>*/}

    </>
  );
};