'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BaseModal } from '../BaseModal';
import { AgentSelectionStep } from './AgentSelectionStep';
import { ChatStep } from './ChatStep';
import { ChatStepWithExecution } from "./ChatStepWithExecution"
import { Container, StepContent, ErrorMessage } from './styled';
import { AgentPreset, AIAgent } from '@/types/aiAgent';
import { useMarketContract } from '@/hooks/useMarketContract';
import { useBorrowingPower } from '@/hooks/useBorrowingPower';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useContractUserStore } from '@/stores/contractUserStore';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';

export interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {

  const { account } = useWalletAccountStore();

  const [currentStep, setCurrentStep] = useState(1); // 1: agent selection, 2: chat
  const [selectedAgent, setSelectedAgent] = useState<AgentPreset | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [finalAgent, setFinalAgent] = useState<AIAgent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { markets } = useContractMarketStore();
  const { getUserPosition } = useMarketContract();
  const { calculateBorrowingPower } = useBorrowingPower();
  const userStore = useContractUserStore();

  const fetchPositions = useCallback(async () => {
    if (!account || !markets.length) {
      return;
    }


    try {
      // Get borrowing power data
      const borrowingPower = await calculateBorrowingPower(account);

      let totalSupplyValue = 0;
      let totalBorrowValue = 0;
      const userPositions: any[] = [];

      for (const market of markets) {
        if (!market.isActive || !market.marketAddress) continue;

        const m: any = market;
        const position = await getUserPosition(m.id, account);
        if (!position) continue;

        const supplyBalance = parseFloat(position.supplyBalance || '0');
        const borrowBalance = parseFloat(position.borrowBalance || '0');

        // Add supply position if user has supplied
        if (supplyBalance > 0) {
          const supplyValue = supplyBalance * market.price;
          totalSupplyValue += supplyValue;

          userPositions.push({
            id: `${market.id}_supply`,
            marketId: market.id,
            type: 'supply',
            amount: position.supplyBalance,
            usdValue: supplyValue,
            apy: market.supplyAPY,
            timestamp: Date.now(),
            isHealthy: true
          });
        }

        // Add borrow position if user has borrowed
        if (borrowBalance > 0) {
          const borrowValue = borrowBalance * market.price;
          totalBorrowValue += borrowValue;

          userPositions.push({
            id: `${market.id}_borrow`,
            marketId: market.id,
            type: 'borrow',
            amount: position.borrowBalance,
            usdValue: borrowValue,
            apy: market.borrowAPR,
            timestamp: Date.now(),
            isHealthy: true
          });
        }
      }

      // Update the user store with the fetched data
      const portfolioData = {
        totalSupplied: totalSupplyValue,
        totalBorrowed: totalBorrowValue,
        totalCollateralValue: parseFloat(borrowingPower.totalCollateralValue || '0'),
        healthFactor: parseFloat(borrowingPower.healthFactor || '999'),
        netAPY: 0, // Calculate if needed
        positions: userPositions
      };

      // Clear existing positions and add new ones
      userStore.clearUserData();
      userPositions.forEach(pos => {
        userStore.updateUserPosition(pos.marketId, pos);
      });
      userStore.calculatePortfolioStats(portfolioData);

      console.log('Portfolio data fetched successfully:', portfolioData);

    } catch (error) {
      console.error('Error fetching positions for AI:', error);
    }
  }, [account, markets, getUserPosition, calculateBorrowingPower, userStore]);

  // Add this useEffect to fetch when modal opens:
  useEffect(() => {
    if (isOpen && account) {
      fetchPositions();
    }
  }, [isOpen, account]);

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
          />
        );

      case 2:
        return finalAgent ? (
          finalAgent.name !== "Secured D" ?
            (
              <ChatStep
                agent={finalAgent}
                onBack={handleBackToAgentSelection}
                onReset={handleReset}
              />
            ) :
            (
              <ChatStepWithExecution
                agent={finalAgent}
                onBack={handleBackToAgentSelection}
                onReset={handleReset}
              />
            ) 
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