import React from 'react';
import { TrendingUp, DollarSign, Shield, ExternalLink } from 'react-feather';
import { PoolRecommendation } from '@/utils/aiService';
import {
  RecommendationCard,
  CardHeader,
  StrategyType,
  ConfidenceScore,
  TokenInfo,
  TokenIcon,
  TokenDetails,
  TokenName,
  TokenSymbol,
  APYBadge,
  MetricsGrid,
  MetricCard,
  MetricLabel,
  MetricValue,
  ReasonText,
  RiskSection,
  SectionTitle,
  RiskList,
  RiskItem,
  BenefitItem,
  ActionButton,
} from './styled';

interface AIRecommendationCardProps {
  recommendation: PoolRecommendation;
  onAction: (recommendation: PoolRecommendation) => void;
  onViewPortfolio: () => void;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  recommendation,
  onAction,
  onViewPortfolio,
}) => {
  return (
    <RecommendationCard $show={true}>
      {/* Header with strategy type and confidence score */}
      <CardHeader>
        <StrategyType $type={recommendation.type}>
          {recommendation.type === 'supply' ? <TrendingUp size={14} /> : <DollarSign size={14} />}
          {recommendation.type}
        </StrategyType>
        <ConfidenceScore>{recommendation.score}% Match</ConfidenceScore>
      </CardHeader>

      {/* Token info section */}
      <TokenInfo>
        <TokenIcon>{recommendation.symbol?.charAt(0)}</TokenIcon>
        <TokenDetails>
          <TokenName>{recommendation.name}</TokenName>
          <TokenSymbol>{recommendation.symbol}</TokenSymbol>
        </TokenDetails>
        <APYBadge>{recommendation.apy?.toFixed(1)}% APY</APYBadge>
      </TokenInfo>

      {/* Metrics */}
      <MetricsGrid>
        <MetricCard>
          <MetricLabel>Suggested Amount</MetricLabel>
          <MetricValue>${recommendation.suggestedAmount?.toLocaleString() || 'N/A'}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>Est. Monthly Return</MetricLabel>
          <MetricValue>${recommendation.estimatedEarnings?.toFixed(2) || 'N/A'}</MetricValue>
        </MetricCard>
      </MetricsGrid>

      {/* Recommendation reason */}
      <ReasonText>{recommendation.reason}</ReasonText>

      {/* Benefits */}
      {recommendation.benefits?.length > 0 && (
        <RiskSection>
          <SectionTitle>
             Strategy Benefits
          </SectionTitle>
          <RiskList>
            {recommendation.benefits.map((benefit, index) => (
              <BenefitItem key={index}>{benefit}</BenefitItem>
            ))}
          </RiskList>
        </RiskSection>
      )}

      {/* Risk warnings */}
      {recommendation.riskWarnings?.length > 0 && (
        <RiskSection>
          <SectionTitle>
             Risk Considerations
          </SectionTitle>
          <RiskList>
            {recommendation.riskWarnings.map((warning, index) => (
              <RiskItem key={index}>{warning}</RiskItem>
            ))}
          </RiskList>
        </RiskSection>
      )}

      {/* Action buttons */}
      <ActionButton $primary onClick={() => onAction(recommendation)}>
        {recommendation.type === 'supply' ? 'Supply Now' : 'Borrow Now'} 
      </ActionButton> 
      {/* <ActionButton onClick={onViewPortfolio}>
        View Portfolio Overview
        <ExternalLink size={16} />
      </ActionButton> */}
    </RecommendationCard>
  );
};
