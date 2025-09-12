'use client';

import React, { useState, useEffect } from 'react';
import { BaseModal } from '../BaseModal';
import { AgentSelectionStep } from './AgentSelectionStep';
import { ChatStep } from './ChatStep';
import { Container, StepContent, ErrorMessage } from './styled';
import { AgentPreset, AIAgent } from '@/types/aiAgent';

export interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: agent selection, 2: chat
  const [selectedAgent, setSelectedAgent] = useState<AgentPreset | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [finalAgent, setFinalAgent] = useState<AIAgent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAgentSelect = (agent: AgentPreset) => {
    setSelectedAgent(agent);
    setCustomPrompt('');
    setError(null);
    
    // Create AI agent from preset and go directly to chat
    const aiAgent: AIAgent = {
      id: `temp_${Date.now()}`,
      name: agent.name,
      personality: agent.personality,
      systemPrompt: agent.systemPrompt,
      avatar: agent.avatar,
      createdAt: new Date(),
      isActive: true,
      preferences: agent.defaultPreferences
    };
    setFinalAgent(aiAgent);
    setCurrentStep(2);
  };

  const handleCustomPromptSelect = () => {
    if (!customPrompt.trim()) return;
    
    setSelectedAgent(null);
    setError(null);
    
    // Create custom AI agent and go directly to chat
    const aiAgent: AIAgent = {
      id: `custom_${Date.now()}`,
      name: 'Custom Agent',
      personality: 'custom',
      systemPrompt: customPrompt,
      avatar: '🤖',
      createdAt: new Date(),
      isActive: true,
      preferences: {
        riskTolerance: 'medium',
        focusAreas: ['general'],
        communicationStyle: 'friendly'
      }
    };
    setFinalAgent(aiAgent);
    setCurrentStep(2);
  };

  const handleBackToAgentSelection = () => {
    setCurrentStep(1);
    setFinalAgent(null);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedAgent(null);
    setCustomPrompt('');
    setFinalAgent(null);
    setError(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <AgentSelectionStep
            selectedAgent={selectedAgent}
            customPrompt={customPrompt}
            onAgentSelect={handleAgentSelect}
            onCustomPromptChange={setCustomPrompt}
            onCustomPromptSelect={handleCustomPromptSelect}
          />
        );

      case 2:
        return finalAgent ? (
          <ChatStep
            agent={finalAgent}
            onBack={handleBackToAgentSelection}
            onReset={handleReset}
          />
        ) : null;

      default:
        return null;
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      handleReset();
    }
  }, [isOpen]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Your AI Assistant"
    >
      <Container>
        <StepContent>
          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}
          
          {renderStepContent()}
        </StepContent>
      </Container>
    </BaseModal>
  );
};