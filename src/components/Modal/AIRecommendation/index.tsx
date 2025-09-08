'use client';

import React, { useState } from 'react';
import { BaseModal } from '../BaseModal';
import { LendingAIService, PoolRecommendation, UserContext } from '@/utils/aiService';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useContractUserStore } from '@/stores/contractUserStore';
import { useModalStore } from '@/stores/modalStore';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useAppStore } from '@/stores/appStore';

import { ModalContainer, ResultsSection } from './styled';
import { AIRecommendationModalProps } from './constants';
import { AIInputSection } from './InputSection';
import { AIResultsSection } from './ResultsSection';

import styled, { keyframes } from 'styled-components';

const brainPulse = keyframes`
  0% {
    background-position: 0% 50%; 
  }
  25% {
    background-position: 100% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  75% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const BrainIconContainer = styled.div`
  text-align: center;
  color: #06C755; /* LINE green accent */
`;

const BrainIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 24px;
  background: linear-gradient(85deg, #1e293b, #06C755, #05b648, #06C755);
  background-size: 400% 400%;
  animation: ${brainPulse} 3.5s ease infinite;
  box-shadow: 0 0 25px rgba(168, 85, 247, 0.3);
`;

const IconImage = styled.img`
  width: 80%;
  height: 80%;
  object-fit: contain;
  filter: brightness(1.1);
  
  @media (max-width: 480px) {
    width: 65%;
    height: 65%;
  }
`;


export const AIRecommendationModal: React.FC<AIRecommendationModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [recommendations, setRecommendations] = useState<PoolRecommendation[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const { markets } = useContractMarketStore();
  const { positions, totalSupplied, totalBorrowed, healthFactor, netAPY } = useContractUserStore();
  const { openModal } = useModalStore();
  // const { account } = useWalletAccountStore();
  const { setActiveTab } = useAppStore();

  const aiService = new LendingAIService();

  // ================= HANDLERS =================

  const handleTemplateClick = (template: string) => {
    setPrompt(template);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSubmitted(true);

    try {
      const userContext: UserContext = {
        currentPositions: positions,
        totalSupplied,
        totalBorrowed,
        healthFactor,
        netAPY,
      };

      const results = await aiService.getPoolRecommendations(prompt, markets, userContext);
      setRecommendations(results);
      setCurrentIndex(0);
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < recommendations.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleAction = (recommendation: PoolRecommendation) => {
    const market = markets.find((m) => m.id === recommendation.poolId);
    if (!market) return;

    onClose();

    if (recommendation.type === 'supply') openModal('supply', { market });
    else if (recommendation.type === 'borrow') openModal('borrow', { market });
  };

  const handleViewPortfolio = () => {
    onClose();
    setActiveTab('portfolio');
  };

  const handleReset = () => {
    setHasSubmitted(false);
    setRecommendations([]);
    setCurrentIndex(0);
    setError(null);
    setPrompt('');
  };

  // ================= RENDER =================

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Ask AI Advisor">
      <ModalContainer>
        {!hasSubmitted ? (
          <> 
            {/* <BrainIconContainer>
              <BrainIconWrapper>
                <IconImage src="./images/icon-robot.png" alt="AI Advisor" />
              </BrainIconWrapper>
            </BrainIconContainer> */}
 
            <AIInputSection
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onTemplateClick={handleTemplateClick}
            />
          </>
        ) : (
          <ResultsSection>
            <AIResultsSection
              isLoading={isLoading}
              error={error}
              recommendations={recommendations}
              currentIndex={currentIndex}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onReset={handleReset}
              onAction={handleAction}
              onViewPortfolio={handleViewPortfolio}
            />
          </ResultsSection>
        )}
      </ModalContainer>
    </BaseModal>
  );
};
