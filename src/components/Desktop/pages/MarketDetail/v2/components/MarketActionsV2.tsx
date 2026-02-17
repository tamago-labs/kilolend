"use client";

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { ContractMarket } from '@/stores/contractMarketStore';
import { formatUSD, formatPercent, isValidAmount, parseUserAmount } from '@/utils/formatters';
import { useTokenBalancesV2 } from '@/hooks/useTokenBalancesV2';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useBorrowingPowerV2 } from '@/hooks/v2/useBorrowingPower';
import { useAuth } from '@/contexts/ChainContext';
import { DesktopTransactionModalWeb3 } from '../../components/DesktopTransactionModalWeb3';
import { DesktopTransactionModal } from "../../components/DesktopTransactionModal"
import { useMultiChainMarketData } from '@/hooks/v2/useMultiChainMarketData';

import { useInterval } from 'usehooks-ts'

import { CHAIN_CONFIGS, CHAIN_MARKETS, ChainId, MarketKey } from '@/utils/chainConfig';

const ActionsContainer = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 16px;
  background: ${({ $active }) => $active ? '#06C755' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#64748b'};
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${({ $active }) => $active ? '#059669' : '#f8fafc'};
  }
`;

const ActionContent = styled.div`
  padding: 32px;
`;

const InputSection = styled.div`
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const InputContainer = styled.div`
  position: relative;
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  background: white;

  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

const MaxButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #06C755;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #059669;
  }
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #64748b;
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
`;

const BalanceColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const APYInfo = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const APYLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const APYValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #06C755;
`;

const ActionButton = styled.button<{ $primary?: boolean; $disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  background: ${({ $primary, $disabled }) => 
    $disabled ? '#e2e8f0' : $primary ? '#06C755' : 'white'};
  color: ${({ $primary, $disabled }) => 
    $disabled ? '#94a3b8' : $primary ? 'white' : '#06C755'};
  border: 1px solid ${({ $disabled }) => $disabled ? '#e2e8f0' : '#06C755'};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s;

  &:hover {
    background: ${({ $primary, $disabled }) => 
      $disabled ? '#e2e8f0' : $primary ? '#059669' : '#06C755'};
    color: ${({ $disabled }) => $disabled ? '#94a3b8' : 'white'};
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
`;

// Helper function to parse marketId like "kaia-usdt" into chain and market key
const parseMarketId = (marketId: string): { chainId: ChainId; marketKey: MarketKey } | null => {
  const parts = marketId.split('-');
  if (parts.length !== 2) return null;

  const [chain, marketKey] = parts;
  if (!Object.keys(CHAIN_CONFIGS).includes(chain)) return null;

  return {
    chainId: chain as ChainId,
    marketKey: marketKey as MarketKey
  };
};

// Helper function to get balance by marketId from the new array-based structure
const getBalanceByMarketId = (
  marketId: string, 
  balances: Array<{ symbol: string; balance: string; name: string; decimals: number; address?: string; isNative?: boolean }>
) => {
  const parsed = parseMarketId(marketId);
  if (!parsed) return null;

  // Handle special case for stkaia -> staked-kaia mapping
  let marketKey = parsed.marketKey;
  if (marketKey === 'stkaia') {
    marketKey = 'staked-kaia' as MarketKey;
  }

  // Map market key to symbol
  const symbolMap: Record<string, string> = {
    'usdt': 'USDT',
    'kaia': 'KAIA',
    'six': 'SIX',
    'bora': 'BORA',
    'mbx': 'MBX',
    'staked-kaia': 'STAKED_KAIA',
    'kub': 'KUB',
    'kusdt': 'KUSDT',
    'xtz': 'XTZ'
  };
  
  const symbol = symbolMap[marketKey];
  const balance = balances.find(b => b.symbol === symbol);
  
  return balance;
};

interface MarketActionsV2Props {
  market: ContractMarket;
  activeTab: 'supply' | 'borrow';
  onTabChange: (tab: 'supply' | 'borrow') => void;
};

export const MarketActionsV2 = ({
  market,
  activeTab,
  onTabChange,
}: MarketActionsV2Props) => {

  const [delay, setDelay] = useState<number>(1000)
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { isLoading } = useMultiChainMarketData()
  const { account } = useWalletAccountStore();
  const { selectedAuthMethod } = useAuth();
  const { balances: tokenBalances } = useTokenBalancesV2();
  const { calculateBorrowingPower, calculateMaxBorrowAmount , isLoading: isBorrowingPowerLoading } = useBorrowingPowerV2();
  const [borrowingPowerData, setBorrowingPowerData] = useState<any>(null);
  const [maxBorrowData, setMaxBorrowData] = useState<any>(null);

  // Get the market ID
  const marketId = market.id; 

  // Get user balance for the current asset using the new helper function
  const balanceData = getBalanceByMarketId(marketId, tokenBalances);
  const userBalance = balanceData?.balance || '0.00';
  const fullPrecisionBalance = balanceData?.balance || '0';

  // Load borrowing power data when account changes
  // useEffect(() => {
  //   const loadBorrowingData = async () => {

  //     if (!account || !marketId || !isLoading) return;

  //     try {
  //       const borrowingPower = await calculateBorrowingPower(account);

  //       console.log("origin borrowingPower:", borrowingPower)

  //       setBorrowingPowerData(borrowingPower);
  //     } catch (error) {
  //       console.error('Error loading borrowing data:', error);
  //     }
  //   };
  //   loadBorrowingData();
  // }, [account, marketId, isLoading]);

  // Load max borrow data when asset is selected for borrow tab
  useEffect(() => {
    const loadMaxBorrowData = async () => {
      if (!marketId || !account || activeTab !== 'borrow') return;

      try {
        const maxBorrow = await calculateMaxBorrowAmount(marketId as any, account); 
        setMaxBorrowData(maxBorrow);
      } catch (error) {
        console.error('Error loading max borrow data:', error);
      }
    };
    loadMaxBorrowData();
  }, [marketId, account, activeTab]);

  // Validate amount against balance or borrow limit
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) {
      setValidationError(null);
      return;
    }

    const numAmount = parseFloat(amount);

    if (activeTab === 'supply') {
      // Validate against wallet balance
      const numBalance = parseFloat(fullPrecisionBalance);
      if (numAmount > numBalance) {
        setValidationError('Insufficient balance');
      } else {
        setValidationError(null);
      }
    } else if (activeTab === 'borrow' && maxBorrowData) {
      // Validate against max borrow amount
      const maxAmount = maxBorrowData.maxBorrowAmount || '0';
      const numMax = parseFloat(maxAmount);
      if (numAmount > numMax) {
        setValidationError('Amount exceeds borrow limit');
      } else {
        setValidationError(null);
      }
    }
  }, [amount, activeTab, fullPrecisionBalance, maxBorrowData]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setValidationError(null);
  };

  const handleMax = () => {
    if (activeTab === 'supply') {
      // Use the full wallet balance
      setAmount(fullPrecisionBalance);
    } else if (activeTab === 'borrow' && maxBorrowData) {
      // Use the max borrow amount
      const maxAmount = maxBorrowData.maxBorrowAmount || '0';
      setAmount(maxAmount);
    }
  };

  const handleAction = () => {
    if (!amount || parseFloat(amount) <= 0 || validationError) {
      return;
    }
    // Open appropriate transaction modal based on auth method
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAmount('');
    setValidationError(null);
  };

  // Reset amount when switching tabs
  const handleTabChange = (tab: 'supply' | 'borrow') => {
    setAmount('');
    setValidationError(null);
    onTabChange(tab);
  };

  useInterval(
    () => {
      if (account && marketId && !isBorrowingPowerLoading && !isLoading) {
        calculateBorrowingPower(account).then((borrowingPower) => {
           setBorrowingPowerData(borrowingPower);
           setDelay(60000)
        })
      }
    },
    delay,
  )

  return (
    <>
      <ActionsContainer>
        <TabContainer>
          <TabButton 
            $active={activeTab === 'supply'}
            onClick={() => handleTabChange('supply')}
          >
            Supply
          </TabButton>
          <TabButton 
            $active={activeTab === 'borrow'}
            onClick={() => handleTabChange('borrow')}
          >
            Borrow
          </TabButton>
        </TabContainer>

        <ActionContent>
          <InputSection>
            <InputLabel>Amount</InputLabel>
            <InputContainer>
              <AmountInput
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
              />
              <MaxButton onClick={handleMax}>MAX</MaxButton>
            </InputContainer>
            {activeTab === 'supply' ? (
              <BalanceRow>
                <BalanceColumn>
                  <BalanceInfo>
                    <span>Wallet Balance: {userBalance}</span>
                    <span>{market.symbol}</span>
                  </BalanceInfo>
                </BalanceColumn>
              </BalanceRow>
            ) : (
              <BalanceRow>
                <BalanceColumn>
                  <BalanceInfo>
                    <span>Available to Borrow: {maxBorrowData?.maxBorrowAmount || '0.00'}</span>
                    <span>{market.symbol}</span>
                  </BalanceInfo>
                </BalanceColumn>
              </BalanceRow>
            )}
          </InputSection>

          <APYInfo>
            <APYLabel>
              {activeTab === 'supply' ? 'Supply APY' : 'Borrow APR'}
            </APYLabel>
            <APYValue>
              {formatPercent(activeTab === 'supply' ? market.supplyAPY : market.borrowAPR)}
            </APYValue>
          </APYInfo>

          {validationError && <ErrorMessage>{validationError}</ErrorMessage>}

          <ActionButton 
            $primary 
            $disabled={!amount || !!validationError || !account}
            onClick={handleAction}
          >
            {!account ? 'Wallet Not Connected' : `Preview ${activeTab === 'supply' ? 'Supply' : 'Borrow'}`}
          </ActionButton>
        </ActionContent>
      </ActionsContainer>

      {/* Render appropriate modal based on auth method */}
      {selectedAuthMethod === 'web3_wallet' && (
        <DesktopTransactionModalWeb3
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          type={activeTab}
          amount={amount}
          market={market}
          borrowingPowerData={borrowingPowerData}
          maxBorrowData={maxBorrowData}
        />
      )}
      
       {selectedAuthMethod === 'line_sdk' && (
        <DesktopTransactionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          type={activeTab}
          amount={amount}
          market={market}
          displaySymbol={market.symbol}
          borrowingPowerData={borrowingPowerData}
          maxBorrowData={maxBorrowData}
        />
      )}

    </>
  );
};
