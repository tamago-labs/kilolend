'use client';

import styled from 'styled-components';
import { useModalStore } from '@/stores/modalStore';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useUserStore } from '@/stores/userStore';
import { useAIDealsStore } from '@/stores/aiDealsStore';
import { useState, useEffect } from 'react';
import useTokenBalances from '@/hooks/useTokenBalances';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { MarketInfo } from './MarketInfo';
import { useTransactions } from '@/hooks/useTransactions'; 
import { validateMinimumAmount, validateDecimalPlaces, getInputStep, formatTokenAmount } from '@/utils/tokenUtils';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BotIcon = styled.div`
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #00C300, #00A000);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const ModalForm = styled.div`
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #00C300;
  }
`;

const AIModalInput = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  min-height: 100px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;

  &:focus {
    border-color: #00C300;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const InfoBox = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const InfoValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #00C300, #00A000);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 195, 0, 0.3);
    }
  ` : `
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f8fafc;
    }
  `}
`;

const ChatDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const AIModalExamples = styled.div`
  margin-top: 16px;
  max-height: 200px;
  overflow-y: auto;
`;

const ExampleTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
`;

const ExampleCard = styled.button`
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;

  &:hover {
    background: #f1f5f9;
    border-color: #00C300;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const BalanceSection = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
`;

const BalanceHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 8px;
`;

const BalanceTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const BalanceRefresh = styled.button`
  background: none;
  border: none;
  color: #00C300;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #f0fdf4;
  }
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BalanceAmount = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
`;

const BalanceUSD = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const WalletConnectPrompt = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  text-align: center;
`;

const ConnectText = styled.p`
  font-size: 14px;
  color: #92400e;
  margin-bottom: 8px;
`;

const ConnectButton = styled.button`
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #d97706;
  }
`;

const ValidationMessage = styled.div<{ $error?: boolean }>`
  font-size: 12px;
  color: ${props => props.$error ? '#ef4444' : '#00C300'};
  margin-top: 4px;
  padding: 4px 0;
`;

const MaxButton = styled.button`
  background: #e2e8f0;
  color: #64748b;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #cbd5e1;
    color: #475569;
  }
`;

const TransactionDetails = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border-left: 3px solid #00C300;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const DetailValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
`;

const NetworkFee = styled.div`
  background: #fef3c7;
  border-radius: 6px;
  padding: 8px;
  margin-top: 12px;
  font-size: 11px;
  color: #92400e;
  text-align: center;
`;

const ExampleText = styled.span`
  color: #475569;
  font-size: 14px;
  line-height: 1.4;
`;

interface GlobalModalProps {
  onAIDealsGenerated?: (userQuery: string) => void;
}

export const GlobalModal = ({ onAIDealsGenerated }: GlobalModalProps) => {
  const { isOpen, type, data, closeModal } = useModalStore();
  const { markets } = useContractMarketStore();
  const { addPosition, addTransaction } = useUserStore();
  const { account } = useWalletAccountStore();
  const { balances, refreshBalances, getBalanceBySymbol } = useTokenBalances();
  const { executeSupply, executeBorrow, isProcessing } = useTransactions();
  
  const [amount, setAmount] = useState('');
  const [userQuery, setUserQuery] = useState(data?.userQuery || '');
  const [validationError, setValidationError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  // Update userQuery when modal data changes
  useEffect(() => {
    if (data?.userQuery) {
      setUserQuery(data.userQuery);
    }
  }, [data?.userQuery]);

  if (!isOpen || !type) return null;

  const currentMarket = data?.marketId ? markets.find(m => m.id === data.marketId) : null;
  
  // Get current token balance
  const currentTokenBalance = currentMarket ? getBalanceBySymbol(currentMarket.symbol as any) : null;
  const currentRate = currentMarket && data?.action ?
    (data.action === 'supply' ? currentMarket.supplyAPY : currentMarket.borrowAPR) : 0;

  // Validation function
  const validateAmount = (inputAmount: string, balance: string | null) => {
    setValidationError('');
    
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setValidationError('Amount must be greater than 0');
      return false;
    }
    
    if (!currentMarket) {
      setValidationError('Market not found');
      return false;
    }
    
    // Validate decimal places
    const decimalValidation = validateDecimalPlaces(inputAmount, currentMarket.id as any);
    if (!decimalValidation.isValid) {
      setValidationError(decimalValidation.error!);
      return false;
    }
    
    // Validate minimum amount
    const minValidation = validateMinimumAmount(currentMarket.id as any, inputAmount);
    if (!minValidation.isValid) {
      setValidationError(minValidation.error!);
      return false;
    }
    
    // Balance check for supply operations
    if (type === 'supply' && balance) {
      const numBalance = parseFloat(balance);
      const numAmount = parseFloat(inputAmount);
      
      if (numAmount > numBalance) {
        setValidationError('Insufficient balance');
        return false;
      }
    }
    
    return true;
  };

  // Handle amount input change with validation
  const handleAmountChange = (value: string) => {
    setAmount(value);
    
    if (type === 'supply' || type === 'borrow') {
      validateAmount(value, currentTokenBalance?.balance || null);
    }
  };

  // Handle max button click
  const handleMaxClick = () => {
    if (type === 'supply' && currentTokenBalance?.balance) {
      // Leave some for gas fees (0.001 for native, 5% for tokens)
      const balance = parseFloat(currentTokenBalance.balance);
      const maxAmount = currentMarket?.symbol === 'KAIA' 
        ? Math.max(0, balance - 0.001)
        : balance * 0.95;
      
      const maxAmountStr = maxAmount.toFixed(6);
      setAmount(maxAmountStr);
      validateAmount(maxAmountStr, currentTokenBalance.balance);
    }
  };

  // Enhanced transaction estimates
  const calculateTransactionFee = () => {
    // Estimated gas fees on Kaia testnet
    return 0.0001; // ~0.0001 KAIA for most transactions
  };

  const calculateMonthlyReturn = () => {
    if (!amount || !currentRate) return 0;
    return (parseFloat(amount) * currentRate / 100 / 12);
  };

  const calculateHealthImpact = () => {
    // Simplified health factor calculation
    // This would be more complex with real collateral data
    if (type === 'borrow' && amount) {
      return 'Health factor will decrease';
    }
    if (type === 'supply' && amount) {
      return 'Increases lending power';
    }
    return '';
  };

  const handleQuickActionSubmit = async () => {
    if (!data || !currentMarket || !amount) return;
    
    // Validate before submission
    if (!validateAmount(amount, currentTokenBalance?.balance || null)) {
      return;
    }
    
    if (!account) {
      setValidationError('Please connect your wallet first');
      return;
    }

    try {
      setValidationError('');
      
      let result: any;
      if (data.action === 'supply') {
        result = await executeSupply(currentMarket.id as any, amount);
      } else {
        result = await executeBorrow(currentMarket.id as any, amount);
      }
      
      if (result.success) {
        // Show progress modal
        setTransactionHash(result.hash!);
        setShowProgressModal(true);
        
        // Add transaction to user store
        addTransaction({
          type: data.action!,
          marketId: data.marketId!,
          amount: parseFloat(amount),
          status: 'pending',
          usdValue: parseFloat(amount) * currentMarket.price,
          txHash: result.hash!
        });
        
        // Close main modal
        closeModal();
        setAmount('');
        setValidationError('');
      } else {
        setValidationError(result.error || 'Transaction failed');
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      setValidationError(error.message || 'Transaction failed');
    }
  };

  const handleAISubmit = () => {
    if (!userQuery.trim()) return;
    
    closeModal();
    onAIDealsGenerated?.(userQuery);
    setUserQuery('');
  };

  const handleExampleClick = (example: string) => {
    setUserQuery(example);
  };
  
  const exampleQuestions = [
    "I want safe returns around 4-5% APY with my stablecoins",
    "안전한 스테이블코인으로 4-5% 수익률을 원해요",
    "Help me borrow against my KAIA tokens with low risk",
    "KAIA 토큰을 담보로 낮은 리스크로 대출받고 싶어요",
    "What's the best lending strategy for $1000 USDT?",
    "1000달러 USDT로 최적의 렌딩 전략이 뭔가요?",
    "I need to borrow KRW with minimal collateral requirements",
    "최소한의 담보로 KRW를 빌리고 싶습니다"
  ];

  const handleTransactionSuccess = () => {
    // Update transaction status and refresh balances
    setTimeout(() => {
      refreshBalances();
    }, 2000);
    
    setShowProgressModal(false);
    setTransactionHash('');
  };

  const renderModalContent = () => {
    switch (type) {
      case 'supply':
      case 'borrow':
        if (!currentMarket || !data) return null;
        
        return (
          <>
            <ModalTitle>
               {type === 'supply' ? 'Supply' : 'Borrow'} {currentMarket.symbol}
            </ModalTitle>

            {/* Market Information */}
            <MarketInfo marketId={data.marketId!} actionType={data.action!} />

            {/* Wallet Connection Check */}
            {!account && (
              <WalletConnectPrompt>
                <ConnectText>Connect your wallet to continue</ConnectText>
                <ConnectButton onClick={() => alert('Wallet connection handled by app')}>
                  Connect Wallet
                </ConnectButton>
              </WalletConnectPrompt>
            )}

            {/* Token Balance Display */}
            {account && currentTokenBalance && (
              <BalanceSection>
                <BalanceHeader>
                  <BalanceTitle>Available Balance</BalanceTitle>
                  <BalanceRefresh onClick={refreshBalances}>
                    🔄 Refresh
                  </BalanceRefresh>
                </BalanceHeader>
                <BalanceInfo>
                  <div>
                    <BalanceAmount>
                      {currentTokenBalance.isLoading ? 'Loading...' : currentTokenBalance.formattedBalance} {currentMarket.symbol}
                    </BalanceAmount>
                    <br />
                    <BalanceUSD>
                      ≈ ${((parseFloat(currentTokenBalance.balance || '0')) * currentMarket.price).toFixed(2)} USD
                    </BalanceUSD>
                  </div>
                </BalanceInfo>
              </BalanceSection>
            )}

            <ModalForm>
              <FormGroup>
                <Label>
                  Amount ({currentMarket.symbol})
                  {type === 'supply' && currentTokenBalance && (
                    <MaxButton onClick={handleMaxClick}>MAX</MaxButton>
                  )}
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  min="0"
                  step={currentMarket ? getInputStep(currentMarket.id as any) : "0.000001"}
                  disabled={!account}
                />
                {validationError && (
                  <ValidationMessage $error>
                    {validationError}
                  </ValidationMessage>
                )}
              </FormGroup>

              {amount && parseFloat(amount) > 0 && !validationError && (
                <TransactionDetails>
                  <DetailRow>
                    <DetailLabel>{type === 'supply' ? 'APY' : 'APR'}:</DetailLabel>
                    <DetailValue>{currentRate.toFixed(2)}%</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Est. Monthly {type === 'supply' ? 'Earnings' : 'Cost'}:</DetailLabel>
                    <DetailValue>${calculateMonthlyReturn().toFixed(4)}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>USD Value:</DetailLabel>
                    <DetailValue>${((parseFloat(amount) || 0) * currentMarket.price).toFixed(2)}</DetailValue>
                  </DetailRow>
                  {calculateHealthImpact() && (
                    <DetailRow>
                      <DetailLabel>Impact:</DetailLabel>
                      <DetailValue>{calculateHealthImpact()}</DetailValue>
                    </DetailRow>
                  )}
                  
                  <NetworkFee>
                    Estimated network fee: ~{calculateTransactionFee().toFixed(4)} KAIA
                  </NetworkFee>
                </TransactionDetails>
              )}
            </ModalForm>

            <ModalButtons>
              <ModalButton $variant="secondary" onClick={closeModal}>
                Cancel
              </ModalButton>
              <ModalButton
                $variant="primary"
                onClick={handleQuickActionSubmit}
                disabled={!account || !amount || parseFloat(amount) <= 0 || !!validationError || currentTokenBalance?.isLoading || isProcessing}
              >
                {!account ? 'Connect Wallet' : 
                 currentTokenBalance?.isLoading ? 'Loading...' :
                 isProcessing ? 'Processing...' :
                 type === 'supply' ? 'Supply' : 'Borrow'}
              </ModalButton>
            </ModalButtons>
          </>
        );

      case 'ai-chat':
        return (
          <>
            <ModalTitle>
              <BotIcon>AI</BotIcon>
              Ask KiloBot Assistant
            </ModalTitle>

            <ChatDescription>
              Describe your lending or borrowing needs in natural language. Our AI will analyze the markets and create personalized deals just for you.
            </ChatDescription>

            <FormGroup>
              <AIModalInput
                placeholder="e.g., I want to earn 5% on my USDT with low risk..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                maxLength={500}
                autoFocus
              />
            </FormGroup>

            <AIModalExamples>
              <ExampleTitle>Try these examples:</ExampleTitle>
              {exampleQuestions.map((example, index) => (
                <ExampleCard key={index} onClick={() => handleExampleClick(example)}>
                  <ExampleText>"{example}"</ExampleText>
                </ExampleCard>
              ))}
            </AIModalExamples>

            <ModalButtons>
              <ModalButton $variant="secondary" onClick={closeModal}>
                Cancel
              </ModalButton>
              <ModalButton
                $variant="primary"
                onClick={handleAISubmit}
                disabled={!userQuery.trim()}
              >
                Ask AI for Deals 🤖
              </ModalButton>
            </ModalButtons>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <ModalOverlay onClick={closeModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          {renderModalContent()}
        </ModalContent>
      </ModalOverlay> 
    </>
  );
};
