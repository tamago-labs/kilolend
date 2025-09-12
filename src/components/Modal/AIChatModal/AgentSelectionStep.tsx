'use client';

import React from 'react';
import {
  AgentGrid,
  AgentCard,
  AgentAvatar,
  AgentInfo,
  AgentName,
  AgentDescription,
  AgentPersonality,
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
        {AGENT_PRESETS.map((agent) => (
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
              <AgentDescription>{agent.description}</AgentDescription>
              <AgentPersonality>
                <span>🎯</span>
                {agent.personality.charAt(0).toUpperCase() + agent.personality.slice(1)} Style
              </AgentPersonality>
            </AgentInfo>
          </AgentCard>
        ))}
      </AgentGrid>

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