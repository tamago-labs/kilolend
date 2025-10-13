import React from 'react';
import { CheckCircle, ExternalLink, Zap, AlertCircle, Info } from 'react-feather';
import { useVaultCaps } from '@/hooks/useVaultCaps';
import { KAIA_SCAN_URL } from '@/utils/tokenConfig';
import type { VaultStrategy, DepositStep } from './types';
import {
  SectionTitle,
  VaultGrid,
  VaultCard,
  VaultHeader,
  VaultInfo,
  VaultName,
  VaultAsset,
  VaultStats,
  VaultStat,
  StatLabel,
  StatValue,
  VaultDescription,
  VaultStrategy as VaultStrategyStyled,
  InputGroup,
  Label,
  BalanceText,
  InputWrapper,
  Input,
  InputLabel,
  MaxButton,
  ExpectedResults,
  ResultRow,
  ResultLabel,
  ResultValue,
  InfoBanner,
  EmptyState,
  EmptyStateIcon,
  EmptyStateText,
  ActionButton,
  ActivityLink,
  TokenIcon,
  TokenIconImage
} from './styled';

interface DepositFlowProps {
  step: DepositStep;
  vault: VaultStrategy | null;
  depositAmount: string;
  kaiaBalance: string;
  onAmountChange: (amount: string) => void;
  onMaxClick: () => void;
  onSuccess: () => void;
  onViewActivity: () => void;
  onViewPositions: () => void;
  depositTxHash: string | null;
}

export const DepositFlow: React.FC<DepositFlowProps> = ({
  step,
  vault,
  depositAmount,
  kaiaBalance,
  onAmountChange,
  onMaxClick,
  onSuccess,
  onViewActivity,
  onViewPositions,
  depositTxHash
}) => {
  // Fetch real vault caps - NO MOCKS
  const caps = useVaultCaps();
  const calculateReturns = () => {
    if (!depositAmount || !vault || parseFloat(depositAmount) === 0) {
      return { principal: '0', earnings30Days: '0', total30Days: '0', apy: '0' };
    }

    const amount = parseFloat(depositAmount);
    const apy = vault.boostedAPY;

    const dailyRate = apy / 365 / 100;
    const earnings30 = amount * dailyRate * 30;
    const total30 = amount + earnings30;

    return {
      principal: amount.toFixed(2),
      earnings30Days: earnings30.toFixed(2),
      total30Days: total30.toFixed(2),
      apy: apy.toFixed(1)
    };
  };

  const returns = calculateReturns();

  // Step 1: Select Vault
  if (step === 1 && vault) {
    return (
      <>
        <SectionTitle>Select Vault to Deposit</SectionTitle>
        <VaultGrid>
          <VaultCard $selected={true}>
            <VaultHeader>
              <TokenIcon>
                <TokenIconImage
                  src={vault.image}
                  alt={vault.asset}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    if (img.parentElement) {
                      img.parentElement.innerHTML = `<b>${vault.asset.charAt(0)}</b>`;
                    }
                  }}
                />
              </TokenIcon>
              <VaultInfo>
                <VaultName>{vault.name}</VaultName>
                <VaultAsset>{vault.asset} Vault</VaultAsset>
              </VaultInfo>
            </VaultHeader>
            <VaultStats>
              <VaultStat>
                <StatLabel>Base APY</StatLabel>
                <StatValue>{vault.baseAPY.toFixed(1)}%</StatValue>
              </VaultStat>
              <VaultStat>
                <StatLabel>AI Boosted</StatLabel>
                <StatValue $highlight>{vault.boostedAPY.toFixed(1)}%</StatValue>
              </VaultStat>
              <VaultStat>
                <StatLabel>Total Value</StatLabel>
                <StatValue>{vault.tvl}</StatValue>
              </VaultStat>
            </VaultStats>
            <VaultDescription>{vault.description}</VaultDescription>
            <VaultStrategyStyled>
              <strong>Strategy:</strong> {vault.strategy}
            </VaultStrategyStyled>
            <VaultStrategyStyled style={{ marginTop: '12px' }}>
              <strong>Deposit Caps:</strong> {parseFloat(caps.maxPerUser).toLocaleString()} KAIA per user | {parseFloat(caps.maxTotal).toLocaleString()} KAIA total vault
            </VaultStrategyStyled>
            {/*<VaultStrategyStyled style={{ marginTop: '8px' }}>
              <strong>Min Deposit:</strong> {vault.minDeposit}
            </VaultStrategyStyled>*/}
          </VaultCard>
        </VaultGrid>
      </>
    );
  }

  // Step 2: Enter Amount
  if (step === 2 && vault) {
    return (
      <>
        <SectionTitle>Enter Deposit Amount</SectionTitle>
        <InputGroup>
          <Label>
            <span>Amount</span>
            <BalanceText>Balance: {kaiaBalance} KAIA</BalanceText>
          </Label>
          <InputWrapper>
            <Input
              type="number"
              value={depositAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0.00"
              step="any"
            />
            <InputLabel>KAIA</InputLabel>
          </InputWrapper>
          {/*<MaxButton onClick={onMaxClick}>Use Max</MaxButton>*/}
        </InputGroup>
        
        {/* Deposit Caps Information */}
        {!caps.loading && (
          <InfoBanner $type="info" style={{ marginTop: '12px', fontSize: '13px' }}>
            <Info size={14} />
            <div>
              <strong>Deposit Limits:</strong>
              <br />• Max per user: {parseFloat(caps.maxPerUser).toLocaleString()} KAIA
              <br />• Vault cap: {parseFloat(caps.maxTotal).toLocaleString()} KAIA (currently {((parseFloat(caps.currentTVL) / parseFloat(caps.maxTotal)) * 100).toFixed(1)}% filled)
              <br />• Your remaining: {parseFloat(caps.userRemaining).toFixed(2)} KAIA
              {parseFloat(caps.userDeposited) > 0 && (
                <>
                  <br />• You've deposited: {parseFloat(caps.userDeposited).toFixed(2)} KAIA
                </>
              )}
            </div>
          </InfoBanner>
        )}
        {depositAmount && parseFloat(depositAmount) > 0 && (
          <>
            <br/>
            <SectionTitle>Expected Returns (AI-Boosted)</SectionTitle>
            <ExpectedResults>
              <ResultRow>
                <ResultLabel>Your Deposit</ResultLabel>
                <ResultValue>{returns.principal} KAIA</ResultValue>
              </ResultRow>
              <ResultRow>
                <ResultLabel>Est. Earnings (30 days)</ResultLabel>
                <ResultValue>+{returns.earnings30Days} KAIA</ResultValue>
              </ResultRow>
              <ResultRow>
                <ResultLabel>Boosted APY</ResultLabel>
                <ResultValue $large>{returns.apy}%</ResultValue>
              </ResultRow>
            </ExpectedResults>
            {/*<InfoBanner $type="info" style={{ marginTop: '16px' }}>
              <Zap size={14} />
              <div style={{ fontSize: '13px' }}>
                AI bot will automatically manage your position with target Health Factor of {vault.targetHealthFactor}
              </div>
            </InfoBanner>*/}
          </>
        )}
      </>
    );
  }

  // Step 3: Confirm
  if (step === 3 && vault) {
    return (
      <>
        <SectionTitle>Review & Confirm Deposit</SectionTitle>
        {/*<InfoBanner $type="success">
          <CheckCircle size={16} />
          <div>Ready to deposit into <strong>{vault.name}</strong></div>
        </InfoBanner>*/}
        {/*<br />*/}
        <ExpectedResults>
          <ResultRow>
            <ResultLabel>Vault</ResultLabel>
            <ResultValue>{vault.name}</ResultValue>
          </ResultRow>
          <ResultRow>
            <ResultLabel>Deposit Amount</ResultLabel>
            <ResultValue>{returns.principal} KAIA</ResultValue>
          </ResultRow>
          <ResultRow>
            <ResultLabel>Boosted APY</ResultLabel>
            <ResultValue $highlight>{vault.boostedAPY.toFixed(1)}%</ResultValue>
          </ResultRow>
         {/* <ResultRow>
            <ResultLabel>Target Health Factor</ResultLabel>
            <ResultValue>{vault.targetHealthFactor}</ResultValue>
          </ResultRow>*/}
          <ResultRow>
            <ResultLabel>Est. 30-Day Earnings</ResultLabel>
            <ResultValue>+{returns.earnings30Days} KAIA</ResultValue>
          </ResultRow>
        </ExpectedResults>
       {/* <InfoBanner $type="warning" style={{ marginTop: '16px' }}>
          <AlertCircle size={14} />
          <div style={{ fontSize: '13px' }}>
            This vault uses leverage. While AI manages risk, your deposit may be subject to liquidation if health factor drops below 1.2.
          </div>
        </InfoBanner>*/}
      </>
    );
  }

  // Step 4: Success
  if (step === 4 && vault) {
    return (
      <EmptyState>
        <EmptyStateIcon><CheckCircle size={64} color="#06C755" /></EmptyStateIcon>
        <EmptyStateText style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
          Deposit Successful!
        </EmptyStateText>
        <EmptyStateText>
          Your {returns.principal} KAIA has been deposited into {vault.name}. 
        </EmptyStateText>
        {/* {depositTxHash && (
          <ActivityLink style={{ marginTop: '20px', fontSize: '14px' }} href={`${KAIA_SCAN_URL}/tx/${depositTxHash}`} target="_blank">
            View Transaction <ExternalLink size={14} />
          </ActivityLink>
        )} */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', width: '100%' }}>
          <ActionButton style={{ flex: 1 }} onClick={onViewActivity}>
            View Bot Activity
          </ActionButton>
          <ActionButton style={{ flex: 1, background: '#f1f5f9', color: '#475569' }} onClick={onViewPositions}>
            My Positions
          </ActionButton>
        </div>
      </EmptyState>
    );
  }

  return null;
};
