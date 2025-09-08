'use client';

import React, { useState } from 'react';
import { BaseModal } from '../BaseModal';
import { LendingAIService, PoolRecommendation, UserContext } from '@/utils/aiService';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useContractUserStore } from '@/stores/contractUserStore';
import { useModalStore } from '@/stores/modalStore';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useAppStore } from '@/stores/appStore';

import { 
  Container,
  StepProgress,
  StepDot,
  StepContent,
  NavigationContainer,
  NavButton,
  ErrorMessage
} from './styled';
import { AIRecommendationModalProps } from './constants';
import { AITemplateSelection } from './TemplateSelection';
import { AICustomPrompt } from './CustomPrompt';
import { AIResultsSection } from './ResultsSection';

export const AIRecommendationModal: React.FC<AIRecommendationModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [finalPrompt, setFinalPrompt] = useState<string>('');
  const [recommendations, setRecommendations] = useState<PoolRecommendation[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { markets } = useContractMarketStore();
  const { positions, totalSupplied, totalBorrowed, healthFactor, netAPY } = useContractUserStore();
  const { openModal } = useModalStore();
  const { setActiveTab } = useAppStore();

  const aiService = new LendingAIService();
  const totalSteps = 3; // Reduced from 4 to 3

  // ================= HANDLERS =================

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setFinalPrompt(template);
  };

  const handleCustomPromptChange = (prompt: string) => {
    setCustomPrompt(prompt);
    setFinalPrompt(prompt);
    setSelectedTemplate(null);
  };

  const handleSubmitAnalysis = async () => {
    if (!finalPrompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const userContext: UserContext = {
        currentPositions: positions,
        totalSupplied,
        totalBorrowed,
        healthFactor,
        netAPY,
      };

      const results = await aiService.getPoolRecommendations(finalPrompt, markets, userContext);
      setRecommendations(results);
      setCurrentIndex(0);
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRecommendationNext = () => {
    if (currentIndex < recommendations.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleRecommendationPrevious = () => {
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
    setCurrentStep(1);
    setSelectedTemplate(null);
    setCustomPrompt('');
    setFinalPrompt('');
    setRecommendations([]);
    setCurrentIndex(0);
    setError(null);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedTemplate !== null || customPrompt.trim() !== '';
      case 2: return finalPrompt.trim() !== '';
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <AITemplateSelection
            selectedTemplate={selectedTemplate}
            customPrompt={customPrompt}
            onTemplateSelect={handleTemplateSelect}
            onCustomPromptChange={handleCustomPromptChange}
          />
        );

      case 2:
        return (
          <AICustomPrompt
            prompt={finalPrompt}
            onPromptChange={setFinalPrompt}
            isLoading={isLoading}
            onSubmit={handleSubmitAnalysis}
          />
        );

      case 3:
        return (
          <AIResultsSection
            isLoading={isLoading}
            error={error}
            recommendations={recommendations}
            currentIndex={currentIndex}
            onNext={handleRecommendationNext}
            onPrevious={handleRecommendationPrevious}
            onReset={handleReset}
            onAction={handleAction}
            onViewPortfolio={handleViewPortfolio}
          />
        );

      default:
        return null;
    }
  };

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      handleReset();
    }
  }, [isOpen]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ask AI Advisor"
    >
      <Container>
        <StepProgress>
          {Array.from({ length: totalSteps }, (_, i) => (
            <StepDot
              key={i}
              $active={i + 1 === currentStep}
              $completed={i + 1 < currentStep}
            />
          ))}
        </StepProgress>

        <StepContent>
          {error && currentStep < 3 && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}
          
          {renderStepContent()}
        </StepContent>

        {currentStep < 3 && (
          <NavigationContainer>
            {currentStep > 1 && (
              <NavButton onClick={handleBack} disabled={isLoading}>
                Back
              </NavButton>
            )}
            <NavButton
              $primary
              disabled={!canProceed() || isLoading}
              onClick={currentStep === 2 ? handleSubmitAnalysis : handleNext}
            >
              {currentStep === 2 ? (
                isLoading ? 'Analyzing...' : 'Next'
              ) : (
                'Next'
              )}
            </NavButton>
          </NavigationContainer>
        )}
      </Container>
    </BaseModal>
  );
};