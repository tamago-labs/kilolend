import React from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'react-feather';
import { PoolRecommendation } from '@/utils/aiService';
import {
  CardContainer,
  LoadingState,
  LoadingSpinner,
  ErrorState,
  ResetButton,
  NavigationSection,
  NavButton,
  PageIndicator,
} from './styled';
import { AIRecommendationCard } from './RecommendationCard';

interface AIResultsSectionProps {
  isLoading: boolean;
  error: string | null;
  recommendations: PoolRecommendation[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  onAction: (recommendation: PoolRecommendation) => void;
  onViewPortfolio: () => void;
}

export const AIResultsSection: React.FC<AIResultsSectionProps> = ({
  isLoading,
  error,
  recommendations,
  currentIndex,
  onNext,
  onPrevious,
  onReset,
  onAction,
  onViewPortfolio,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <LoadingState>
        <LoadingSpinner /> 
      </LoadingState>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorState>
        <div>Strategy Analysis Failed</div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>{error}</div>
        <ResetButton onClick={onReset}>
          <RotateCcw size={14} />
          Try New Strategy
        </ResetButton>
      </ErrorState>
    );
  }

  // No recommendations
  if (!recommendations?.length) {
    return (
      <ErrorState>
        <div>No suitable strategies found</div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>
          Try adjusting your criteria or amount
        </div>
        <ResetButton onClick={onReset}>
          <RotateCcw size={14} />
          Create New Strategy
        </ResetButton>
      </ErrorState>
    );
  }

  const currentRecommendation = recommendations[currentIndex];

  return (
    <>
      {/* Recommendation Card */}
      <CardContainer>
        {currentRecommendation && (
          <AIRecommendationCard
            recommendation={currentRecommendation}
            onAction={onAction}
            onViewPortfolio={onViewPortfolio}
          />
        )}
      </CardContainer>

      {/* Navigation for multiple recommendations */}
      {recommendations.length > 1 && (
        <NavigationSection>
          <NavButton
            onClick={onPrevious}
            // $disabled={currentIndex === 0}
            disabled={currentIndex === 0}
          >
            <ArrowLeft size={16} /> Previous
          </NavButton>

          <PageIndicator>
            {currentIndex + 1} of {recommendations.length}
          </PageIndicator>

          <NavButton
            onClick={onNext}
            // $disabled={currentIndex === recommendations.length - 1}
            disabled={currentIndex === recommendations.length - 1}
          >
            Next <ArrowRight size={16} />
          </NavButton>
        </NavigationSection>
      )}

      {/* Reset / new query */}
      {/* <NavigationSection style={{ borderTop: 'none', paddingTop: '8px' }}>
        <ResetButton onClick={onReset}>
          <RotateCcw size={14} /> New Strategy Query
        </ResetButton>
      </NavigationSection> */}
    </>
  );
};
