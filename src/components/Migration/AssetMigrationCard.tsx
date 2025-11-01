'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ArrowUp, ArrowUpRight, AlertTriangle } from 'react-feather';
import { Position } from '@/hooks/useDualPositions';
import { useMarketContract } from '@/hooks/useMarketContract';
import { useMarketContract as useV1MarketContract } from '@/hooks/v1/useMarketContract';
import { useBorrowingPower } from '@/hooks/useBorrowingPower';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { truncateToSafeDecimals, validateAmountAgainstBalance, getSafeMaxAmount } from '@/utils/tokenUtils';

const Card = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const AssetHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const AssetIcon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
`;

const AssetInfo = styled.div`
  flex: 1;
`;

const AssetName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const AssetType = styled.div<{ $type: 'supply' | 'borrow' }>`
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  
  ${({ $type }) => $type === 'supply' ? `
    background: #dcfce7;
    color: #166534;
  ` : `
    background: #fef2f2;
    color: #dc2626;
  `}
`;

const StatusBadge = styled.div<{ $status: 'active' | 'inactive' | 'low' | 'minimal' }>`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  
  ${({ $status }) => {
    switch ($status) {
      case 'active':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'inactive':
      case 'low':
      case 'minimal':
        return `
          background: #f1f5f9;
          color: #64748b;
        `;
      default:
        return `
          background: #f1f5f9;
          color: #64748b;
        `;
    }
  }}
`;

const BalanceSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 20px;
`;

const BalanceCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
`;

const BalanceLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-weight: 600;
`;

const BalanceAmount = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const BalanceUSD = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const APYBadge = styled.div<{ $type: 'supply' | 'borrow' }>`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  margin-top: 8px;
  display: inline-block;
  
  ${({ $type }) => $type === 'supply' ? `
    background: #ecfdf5;
    color: #059669;
  ` : `
    background: #fef3c7;
    color: #d97706;
  `}
`;

const TabContainer = styled.div`
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 20px;
`;

const TabList = styled.div`
  display: flex;
  gap: 4px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 20px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: ${({ $active }) => $active ? '#06C755' : '#64748b'};
  border-bottom: 2px solid ${({ $active }) => $active ? '#06C755' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #06C755;
  }
`;

const TabContent = styled.div`
  min-height: 200px;
`;

const TransactionInput = styled.div`
  margin-bottom: 16px;
`;

const InputLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: white;
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    border-color: #06C755;
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const QuickAmountButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`;

const QuickAmountButton = styled.button<{ $selected?: boolean }>`
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ $selected }) => $selected ? `
    background: #06C755;
    color: white;
    border: 2px solid #06C755;
  ` : `
    background: white;
    color: #64748b;
    border: 2px solid #e2e8f0;
    
    &:hover {
      border-color: #06C755;
      color: #06C755;
    }
  `}
`;

const BalanceInfo = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 16px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  ${({ $variant }) => $variant === 'primary' ? `
    background: linear-gradient(135deg, #06C755 0%, #059212 100%);
    color: white;
    border-color: #06C755;
    
    &:hover {
      background: linear-gradient(135deg, #059212 0%, #047857 100%);
      transform: translateY(-1px);
    }
    
    &:disabled {
      background: #94a3b8;
      border-color: #94a3b8;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: white;
    color: #64748b;
    border-color: #e2e8f0;
    
    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #475569;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `}
`;

const WarningCard = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WarningIcon = styled.div`
  color: #f59e0b;
  flex-shrink: 0;
`;

const WarningText = styled.div`
  font-size: 14px;
  color: #d97706;
  line-height: 1.5;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
  color: #dc2626;
  font-size: 12px;
`;

interface AssetMigrationCardProps {
  position: Position;
  type: 'supply' | 'borrow';
  migrationStatus: string;
  disabled?: boolean;
}

export const AssetMigrationCard = ({
  position,
  type,
  migrationStatus,
  disabled = false
}: AssetMigrationCardProps) => {
  const { account } = useWalletAccountStore();
  const { withdraw: hackathonWithdraw } = useMarketContract();
  const { supply: v1Supply, repay: v1Repay } = useV1MarketContract();
  const { calculateBorrowingPower } = useBorrowingPower();
  const { getBalanceBySymbol } = useTokenBalances();

  const [activeTab, setActiveTab] = useState<'withdraw' | 'supply' | 'repay'>(
    type === 'supply' ? 'withdraw' : 'repay'
  );
  const [amount, setAmount] = useState('');
  const [selectedQuick, setSelectedQuick] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [borrowingPower, setBorrowingPower] = useState<any>(null);
  const [validationError, setValidationError] = useState<any>(null);

  const balance = type === 'supply' ? position.formattedSupplyBalance : position.formattedBorrowBalance;
  const balanceUSD = type === 'supply'
    ? (parseFloat(position.formattedSupplyBalance) * position.price).toFixed(2)
    : (parseFloat(position.formattedBorrowBalance) * position.price).toFixed(2);
  const apy = type === 'supply' ? position.supplyAPY : position.borrowAPR;

  // Get wallet balance for supply tab - handle both KAIA and token symbols
  const getTokenSymbolForBalance = (symbol: string): 'USDT' | 'STAKED_KAIA' | 'SIX' | 'BORA' | 'MBX' | 'KAIA' => {
    switch (symbol.toUpperCase()) {
      case 'KAIA': return 'KAIA';
      case 'USDT': return 'USDT';
      case 'STAKED_KAIA':
      case 'STAKED-KAIA':
      case 'STKAIA': return 'STAKED_KAIA';
      case 'SIX': return 'SIX';
      case 'BORA': return 'BORA';
      case 'MBX': return 'MBX';
      default: return 'USDT'; // fallback
    }
  };

  const walletBalance = getBalanceBySymbol(getTokenSymbolForBalance(position.symbol));
  const walletBalanceDisplay = walletBalance?.formattedBalance || '0';

  // Fetch borrowing power only when account changes
  useEffect(() => {
    const fetchBorrowingPower = async () => {
      if (account) {
        try {
          const power = await calculateBorrowingPower(account);
          setBorrowingPower(power);
        } catch (error) {
          console.error('Error fetching borrowing power:', error);
        }
      }
    };

    fetchBorrowingPower();
  }, [account]); // Only depend on account, not the function itself

  // Validate amount with proper dependencies
  useEffect(() => {
    if (amount) {
      const marketId = position.marketId.toLowerCase() as any;
      const validation = validateAmountAgainstBalance(amount, balance, marketId);
      setValidationError(validation.isValid ? null : validation.error);
    } else {
      setValidationError(null);
    }
  }, [amount, balance, position.marketId]);

  const handleQuickAmount = useCallback((percentage: number) => {
    const fullBalance = parseFloat(balance);
    const quickAmount = (fullBalance * percentage / 100).toString();
    const decimals = position.decimals || 18;
    const safeAmount = truncateToSafeDecimals(quickAmount, decimals);
    setAmount(safeAmount);
    setSelectedQuick(percentage);
  }, [balance, position.decimals]);

  const handleMaxAmount = useCallback(() => {
    const decimals = position.decimals || 18;
    const marketId = position.marketId.toLowerCase() as any;
    const safeAmount = getSafeMaxAmount(balance, marketId);
    setAmount(safeAmount);
    setSelectedQuick(100);
  }, [balance, position.marketId, position.decimals]);

  const handleWithdraw = useCallback(async () => {
    if (!amount || !account) return;

    setIsProcessing(true);
    try {
      const result = await hackathonWithdraw(position.marketId as any, amount);
      if (result.status === 'confirmed') {
        setAmount('');
        setSelectedQuick(null);
        // Parent would handle status update
      }
    } catch (error) {
      console.error('Withdraw failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [amount, account, hackathonWithdraw, position.marketId]);

  const handleSupply = useCallback(async () => {
    if (!amount || !account) return;

    setIsProcessing(true);
    try {
      const result = await v1Supply(position.marketId as any, amount);
      if (result.status === 'confirmed') {
        setAmount('');
        setSelectedQuick(null);
        // Parent would handle status update
      }
    } catch (error) {
      console.error('Supply failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [amount, account, v1Supply, position.marketId]);

  const handleRepay = useCallback(async () => {
    if (!amount || !account) return;

    setIsProcessing(true);
    try {
      const result = await v1Repay(position.marketId as any, amount);
      if (result.status === 'confirmed') {
        setAmount('');
        setSelectedQuick(null);
        // Parent would handle status update
      }
    } catch (error) {
      console.error('Repay failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [amount, account, v1Repay, position.marketId]);

  const hasOutstandingDebt = borrowingPower && parseFloat(borrowingPower.totalBorrowValue) > 0;
  const currentHealthFactor = borrowingPower ? parseFloat(borrowingPower.healthFactor) : 0;

  // Calculate smart status based on USD value
  const getSmartStatus = useCallback(() => {
    const usdValue = parseFloat(balanceUSD);
    const threshold = type === 'supply' ? 1 : 0.1;

    if (usdValue > threshold) {
      return 'active';
    } else {
      return type === 'supply' ? 'low' : 'minimal';
    }
  }, [balanceUSD, type]);

  const smartStatus = getSmartStatus();

  const tabs = useMemo(() => {
    if (type === 'supply') {
      return [
        { id: 'withdraw' as const, label: 'Withdraw' },
        { id: 'supply' as const, label: 'Supply to V1' }
      ];
    } else {
      return [
        { id: 'repay' as const, label: 'Repay Debt' }
      ];
    }
  }, [type]);

  const handleAction = useCallback(() => {
    switch (activeTab) {
      case 'withdraw':
        return handleWithdraw();
      case 'supply':
        return handleSupply();
      case 'repay':
        return handleRepay();
    }
  }, [activeTab, handleWithdraw, handleSupply, handleRepay]);

  const getActionButtonText = useCallback(() => {
    if (isProcessing) {
      switch (activeTab) {
        case 'withdraw': return 'Withdrawing...';
        case 'supply': return 'Supplying...';
        case 'repay': return 'Repaying...';
      }
    }

    switch (activeTab) {
      case 'withdraw': return 'Withdraw';
      case 'supply': return 'Supply to V1';
      case 'repay': return 'Repay Debt';
    }
  }, [isProcessing, activeTab]);

  return (
    <Card>
      <AssetHeader>
        <AssetIcon src={position.icon} alt={position.symbol} />
        <AssetInfo>
          <AssetName>{position.symbol}</AssetName>
        </AssetInfo>
        {type === 'supply' && (
          <StatusBadge $status={smartStatus}>
            {smartStatus === 'active' ? 'Active' : smartStatus === 'low' ? 'Low Balance' : 'Minimal'}
          </StatusBadge>
        )}
        {type === 'borrow' && (
          <StatusBadge $status={smartStatus}>
            {smartStatus === 'active' ? 'Need Repay' : smartStatus === 'low' ? 'Low Balance' : 'Minimal'}
          </StatusBadge>
        )}
      </AssetHeader>

      {/* Warning for supply positions with outstanding debt */}
      {type === 'supply' && hasOutstandingDebt && (
        <WarningCard>
          <WarningIcon>
            <AlertTriangle size={20} />
          </WarningIcon>
          <WarningText>
            You have outstanding debt. Please repay your debts first or ensure you maintain sufficient collateral before withdrawing.
          </WarningText>
        </WarningCard>
      )}

      {type === 'supply' && (
        <BalanceSection>
          <BalanceCard>
            <BalanceLabel>{type === 'supply' ? 'Supplied' : 'Borrowed'} Amount</BalanceLabel>
            <BalanceAmount>{balance}</BalanceAmount>
            {type === 'supply' && <BalanceUSD>${balanceUSD}</BalanceUSD>}
          </BalanceCard>
        </BalanceSection>
      )}

      {/* Card-level tabs - only for supply positions */}
      {type === 'supply' ? (
        <>
          <TabContainer>
            <TabList>
              {tabs.map(tab => (
                <TabButton
                  key={tab.id}
                  $active={activeTab === tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setAmount('');
                    setSelectedQuick(null);
                    setValidationError(null);
                  }}
                >
                  {tab.label}
                </TabButton>
              ))}
            </TabList>
          </TabContainer>

          <TabContent>
            <TransactionInput>
              <InputLabel>
                {activeTab === 'withdraw' && 'Withdraw'}
                {activeTab === 'supply' && 'Supply to V1'}
              </InputLabel>

              <AmountInput
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSelectedQuick(null);
                }}
                disabled={disabled || isProcessing}
              />

              <QuickAmountButtons>
                {[25, 50, 75].map(percentage => (
                  <QuickAmountButton
                    key={percentage}
                    $selected={selectedQuick === percentage}
                    onClick={() => handleQuickAmount(percentage)}
                    disabled={disabled || isProcessing}
                  >
                    {percentage}%
                  </QuickAmountButton>
                ))}
                <QuickAmountButton
                  $selected={selectedQuick === 100}
                  onClick={handleMaxAmount}
                  disabled={disabled || isProcessing}
                >
                  MAX
                </QuickAmountButton>
              </QuickAmountButtons>

              <BalanceInfo>
                {activeTab === 'withdraw' && `Available: ${balance} ${position.symbol}`}
                {activeTab === 'supply' && `Wallet Balance: ${walletBalanceDisplay} ${position.symbol}`}
              </BalanceInfo>
            </TransactionInput>

            {/* Error Messages */}
            {validationError && (
              <ErrorMessage>
                {validationError}
              </ErrorMessage>
            )}

            <ActionButton
              onClick={handleAction}
              disabled={disabled || !amount || isProcessing || !!validationError}
              $variant="primary"
            >
              {isProcessing ? (
                getActionButtonText()
              ) : (
                <>
                  <ArrowUpRight size={16} />
                  {getActionButtonText()}
                </>
              )}
            </ActionButton>
          </TabContent>
        </>
      ) : (
        /* Borrow position - direct input without tabs */
        <>
          <TransactionInput>
            <InputLabel>Repay Debt</InputLabel>

            <AmountInput
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setSelectedQuick(null);
              }}
              disabled={disabled || isProcessing}
            />

            <QuickAmountButtons>
              {[25, 50, 75].map(percentage => (
                <QuickAmountButton
                  key={percentage}
                  $selected={selectedQuick === percentage}
                  onClick={() => handleQuickAmount(percentage)}
                  disabled={disabled || isProcessing}
                >
                  {percentage}%
                </QuickAmountButton>
              ))}
              <QuickAmountButton
                $selected={selectedQuick === 100}
                onClick={handleMaxAmount}
                disabled={disabled || isProcessing}
              >
                MAX
              </QuickAmountButton>
            </QuickAmountButtons>

            <BalanceInfo>
              <div style={{ display: "flex", flexDirection: "row" }}>
                Outstanding: {balance} {position.symbol}
                <div style={{ marginLeft: "auto" }}>
                  Wallet Balance: {walletBalanceDisplay} {position.symbol} 
                </div>
              </div>

            </BalanceInfo>
          </TransactionInput>

          {/* Error Messages */}
          {validationError && (
            <ErrorMessage>
              {validationError}
            </ErrorMessage>
          )}

          <ActionButton
            onClick={handleRepay}
            disabled={disabled || !amount || isProcessing || !!validationError}
            $variant="primary"
          >
            {isProcessing ? 'Repaying...' : (
              <>
                <ArrowUpRight size={16} />
                Repay Debt
              </>
            )}
          </ActionButton>
        </>
      )}
    </Card>
  );
};
