'use client';

import React, { useState, useEffect } from 'react';
import { BaseModal } from '../BaseModal';
import { ChevronRight, AlertCircle, Info, TrendingUp, RefreshCw, CheckCircle, ExternalLink } from 'react-feather';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { KAIA_SCAN_URL } from '@/utils/tokenConfig';
import { liff } from '@/utils/liff';
import {
  Container,
  StepProgress,
  StepDot,
  StepContent,
  NavigationContainer,
  NavButton,
  TokenSection,
  SectionTitle,
  TokenList,
  TokenCard,
  TokenInfo,
  TokenIcon,
  TokenDetails,
  TokenSymbol,
  TokenName,
  TokenBalance,
  BalanceAmount,
  BalanceUSD,
  SwapDirectionButton,
  SelectedTokenBox,
  ChangeButton,
  InputSection,
  InputLabel,
  BalanceText,
  AmountInputWrapper,
  AmountInput,
  InputTokenLabel,
  MaxButton,
  SwapDetailsBox,
  DetailRow,
  DetailLabel,
  DetailValue,
  SlippageSettings,
  SlippageTitle,
  SlippageOptions,
  SlippageOption,
  InfoBanner,
  SuccessContainer,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  SwapSummaryBox,
  SwapSummaryRow,
  SwapSummaryLabel,
  SwapSummaryValue,
  TransactionLink,
  ErrorMessage,
  SearchInput
} from './styled';

interface SwapModalProps {
  onClose: () => void;
}

interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance: string;
  balanceUSD: string;
  decimals: number;
  price: number;
}

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0, 3.0];

// Mock tokens - will be replaced with actual DragonSwap token list
const MOCK_TOKENS: Token[] = [
  {
    symbol: 'KAIA',
    name: 'KAIA',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
    balance: '1,234.56',
    balanceUSD: '$185.18',
    decimals: 18,
    price: 0.15
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    balance: '500.00',
    balanceUSD: '$500.00',
    decimals: 6,
    price: 1.00
  },
  {
    symbol: 'SIX',
    name: 'SIX Protocol',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3327.png',
    balance: '10,000.00',
    balanceUSD: '$500.00',
    decimals: 18,
    price: 0.05
  },
  {
    symbol: 'BORA',
    name: 'BORA',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3801.png',
    balance: '2,500.00',
    balanceUSD: '$250.00',
    decimals: 18,
    price: 0.10
  },
  {
    symbol: 'MBX',
    name: 'MARBLEX',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/18895.png',
    balance: '5,000.00',
    balanceUSD: '$150.00',
    decimals: 18,
    price: 0.03
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    balance: '2.5',
    balanceUSD: '$5,750.00',
    decimals: 18,
    price: 2300.00
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png',
    balance: '0.15',
    balanceUSD: '$6,450.00',
    decimals: 8,
    price: 43000.00
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png',
    balance: '1,000.00',
    balanceUSD: '$1,000.00',
    decimals: 18,
    price: 1.00
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    balance: '750.00',
    balanceUSD: '$750.00',
    decimals: 6,
    price: 1.00
  }
];

export const SwapModal: React.FC<SwapModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [selectingToken, setSelectingToken] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { account } = useWalletAccountStore();

  const totalSteps = 3;

  // Use mock tokens
  const availableTokens = MOCK_TOKENS;

  // Filter tokens based on search
  const filteredTokens = availableTokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-select KAIA as from token if not selected
  useEffect(() => {
    if (!fromToken && availableTokens.length > 0) {
      const kaia = availableTokens.find(t => t.symbol === 'KAIA');
      if (kaia) setFromToken(kaia);
    }
  }, []);

  const handleTokenSelect = (token: Token) => {
    if (selectingToken === 'from') {
      // Don't allow selecting same token
      if (toToken && token.symbol === toToken.symbol) {
        setError(`You cannot swap ${token.symbol} for ${token.symbol}`);
        return;
      }
      setFromToken(token);
      setFromAmount('');
      setToAmount('');
    } else if (selectingToken === 'to') {
      // Don't allow selecting same token
      if (fromToken && token.symbol === fromToken.symbol) {
        setError(`You cannot swap ${token.symbol} for ${token.symbol}`);
        return;
      }
      setToToken(token);
      setToAmount('');
    }
    setSelectingToken(null);
    setSearchQuery('');
    setError(null);
  };

  const handleSwapDirection = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);

    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleMaxAmount = () => {
    if (fromToken) {
      const cleanBalance = fromToken.balance.replace(/,/g, '');
      setFromAmount(cleanBalance);
      calculateToAmount(cleanBalance);
    }
  };

  const calculateToAmount = (amount: string) => {
    if (!amount || !fromToken || !toToken || parseFloat(amount) === 0) {
      setToAmount('');
      return;
    }

    const fromPrice = fromToken.price;
    const toPrice = toToken.price;

    if (fromPrice === 0 || toPrice === 0) {
      setToAmount('0');
      return;
    }

    // Calculate with slippage and fee
    const amountNum = parseFloat(amount);
    const rate = fromPrice / toPrice;
    const slippageMultiplier = 1 - (slippage / 100);
    const result = amountNum * rate * slippageMultiplier * 0.997; // 0.3% trading fee

    setToAmount(result.toFixed(6));
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    calculateToAmount(value);
    setError(null);
  };

  const getExchangeRate = () => {
    if (!fromToken || !toToken) return '0';

    const fromPrice = fromToken.price;
    const toPrice = toToken.price;

    if (fromPrice === 0 || toPrice === 0) return '0';

    return (fromPrice / toPrice).toFixed(6);
  };

  const getPriceImpact = () => {
    if (!fromAmount || parseFloat(fromAmount) === 0) return 0;
    // Mock calculation - in real app, get from DEX
    const amount = parseFloat(fromAmount);
    const balance = parseFloat(fromToken?.balance.replace(/,/g, '') || '0');
    const percentage = (amount / balance) * 100;

    if (percentage > 50) return 2.5;
    if (percentage > 20) return 1.2;
    if (percentage > 10) return 0.5;
    return 0.1;
  };

  const getTradingFee = () => {
    if (!fromAmount || !fromToken) return '0';
    return (parseFloat(fromAmount) * 0.003).toFixed(6);
  };

  const getMinimumReceived = () => {
    if (!toAmount) return '0';
    return (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return fromToken !== null && toToken !== null;
      case 2:
        const cleanBalance = fromToken?.balance.replace(/,/g, '') || '0';
        return fromAmount && parseFloat(fromAmount) > 0 &&
          parseFloat(fromAmount) <= parseFloat(cleanBalance);
      case 3:
        return true;
      default:
        return false;
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
      setError(null);
    }
  };

  const handleConfirmSwap = async () => {

    if (!account || !fromToken || !toToken || !fromAmount) return;

    setIsSwapping(true);
    setError(null);

    try {
      // TODO: Implement actual swap logic with DragonSwap
      console.log('Swapping:', {
        from: fromToken.symbol,
        to: toToken.symbol,
        amount: fromAmount,
        slippage,
        account
      });

      // Mock transaction - replace with actual swap
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success
      setTxHash('0x' + Math.random().toString(16).substring(2, 66));
      setCurrentStep(3);

    } catch (err) {
      console.error('Swap failed:', err);
      setError((err as Error).message || 'Swap transaction failed');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleViewTransaction = () => {
    if (!txHash) return;

    const txUrl = `${KAIA_SCAN_URL}/tx/${txHash}`;

    if (liff.isInClient()) {
      liff.openWindow({
        url: txUrl,
        external: true,
      });
    } else {
      window.open(txUrl, "_blank");
    }
  };

  const renderStepContent = () => {
    // Token Selection Modal
    if (selectingToken) {
      return (
        <>
          <SectionTitle>
            Select Token {selectingToken === 'from' ? '(From)' : '(To)'}
          </SectionTitle>

          <SearchInput
            type="text"
            placeholder="Search by name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <TokenList>
            {filteredTokens.map((token) => (
              <TokenCard
                key={token.symbol}
                onClick={() => handleTokenSelect(token)}
                $selected={
                  selectingToken === 'from'
                    ? fromToken?.symbol === token.symbol
                    : toToken?.symbol === token.symbol
                }
              >
                <TokenInfo>
                  <TokenIcon src={token.icon} alt={token.symbol} />
                  <TokenDetails>
                    <TokenSymbol>{token.symbol}</TokenSymbol>
                    <TokenName>{token.name}</TokenName>
                  </TokenDetails>
                </TokenInfo>
                <TokenBalance>
                  <BalanceAmount>{token.balance}</BalanceAmount>
                  <BalanceUSD>{token.balanceUSD}</BalanceUSD>
                </TokenBalance>
              </TokenCard>
            ))}
          </TokenList>
        </>
      );
    }

    // Step Content
    switch (currentStep) {
      case 1:
        return (
          <>
            <InfoBanner $type="info">
              <Info size={16} />
              <div>
                Powered by <strong>DragonSwap</strong> (Uniswap V2 on KAIA).
                Select which tokens you want to swap.
              </div>
            </InfoBanner>

            <TokenSection>
              <SectionTitle>From</SectionTitle>
              {fromToken ? (
                <SelectedTokenBox>
                  <TokenInfo>
                    <TokenIcon src={fromToken.icon} alt={fromToken.symbol} />
                    <TokenDetails>
                      <TokenSymbol>{fromToken.symbol}</TokenSymbol>
                      <TokenName>Balance: {fromToken.balance}</TokenName>
                    </TokenDetails>
                  </TokenInfo>
                  <ChangeButton onClick={() => setSelectingToken('from')}>
                    Change
                  </ChangeButton>
                </SelectedTokenBox>
              ) : (
                <NavButton onClick={() => setSelectingToken('from')}>
                  Select Token
                </NavButton>
              )}
            </TokenSection>

            <SwapDirectionButton onClick={handleSwapDirection}>
              ⇅
            </SwapDirectionButton>

            <TokenSection>
              <SectionTitle>To</SectionTitle>
              {toToken ? (
                <SelectedTokenBox>
                  <TokenInfo>
                    <TokenIcon src={toToken.icon} alt={toToken.symbol} />
                    <TokenDetails>
                      <TokenSymbol>{toToken.symbol}</TokenSymbol>
                      <TokenName>Balance: {toToken.balance}</TokenName>
                    </TokenDetails>
                  </TokenInfo>
                  <ChangeButton onClick={() => setSelectingToken('to')}>
                    Change
                  </ChangeButton>
                </SelectedTokenBox>
              ) : (
                <NavButton onClick={() => setSelectingToken('to')}>
                  Select Token
                </NavButton>
              )}
            </TokenSection>
          </>
        );

      case 2:
        return fromToken && toToken ? (
          <>
            <InputSection>
              <InputLabel>
                <span>From</span>
                <BalanceText>Balance: {fromToken.balance}</BalanceText>
              </InputLabel>
              <AmountInputWrapper>
                <AmountInput
                  type="number"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.00"
                  step="any"
                />
                <MaxButton onClick={handleMaxAmount}>MAX</MaxButton>
                <InputTokenLabel>{fromToken.symbol}</InputTokenLabel>
              </AmountInputWrapper>
            </InputSection>

            <InputSection>
              <InputLabel>
                <span>To (estimated)</span>
                <BalanceText>Balance: {toToken.balance}</BalanceText>
              </InputLabel>
              <AmountInputWrapper>
                <AmountInput
                  type="number"
                  value={toAmount}
                  readOnly
                  placeholder="0.00"
                  style={{ background: '#f8fafc' }}
                />
                <InputTokenLabel>{toToken.symbol}</InputTokenLabel>
              </AmountInputWrapper>
            </InputSection>

            {fromAmount && parseFloat(fromAmount) > 0 && (
              <>
                <SwapDetailsBox>
                  <DetailRow>
                    <DetailLabel>Exchange Rate</DetailLabel>
                    <DetailValue>
                      1 {fromToken.symbol} = {getExchangeRate()} {toToken.symbol}
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Price Impact</DetailLabel>
                    <DetailValue $warning={getPriceImpact() > 1}>
                      ~{getPriceImpact().toFixed(2)}%
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Trading Fee (0.3%)</DetailLabel>
                    <DetailValue>
                      {getTradingFee()} {fromToken.symbol}
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Minimum Received</DetailLabel>
                    <DetailValue>
                      {getMinimumReceived()} {toToken.symbol}
                    </DetailValue>
                  </DetailRow>
                </SwapDetailsBox>

                <SlippageSettings>
                  <SlippageTitle>Slippage Tolerance</SlippageTitle>
                  <SlippageOptions>
                    {SLIPPAGE_PRESETS.map((preset) => (
                      <SlippageOption
                        key={preset}
                        $selected={slippage === preset}
                        onClick={() => setSlippage(preset)}
                      >
                        {preset}%
                      </SlippageOption>
                    ))}
                  </SlippageOptions>
                </SlippageSettings>
              </>
            )}
          </>
        ) : null;

      case 3:
        return (
          <SuccessContainer>
            <SuccessIcon>
              <CheckCircle size={40} color="white" />
            </SuccessIcon>
            <SuccessTitle>Swap Successful!</SuccessTitle>
            <SuccessMessage>
              Your tokens have been swapped successfully
            </SuccessMessage>

            <SwapSummaryBox>
              <SwapSummaryRow>
                <SwapSummaryLabel>You Swapped</SwapSummaryLabel>
                <SwapSummaryValue>
                  {fromAmount} {fromToken?.symbol}
                </SwapSummaryValue>
              </SwapSummaryRow>
              <SwapSummaryRow>
                <SwapSummaryLabel>You Received</SwapSummaryLabel>
                <SwapSummaryValue>
                  {toAmount} {toToken?.symbol}
                </SwapSummaryValue>
              </SwapSummaryRow>
            </SwapSummaryBox>

            {txHash && (
              <TransactionLink onClick={handleViewTransaction}>
                <ExternalLink size={16} />
                View on Block Explorer
              </TransactionLink>
            )}

            <NavButton $primary onClick={onClose}>
              Close
            </NavButton>
          </SuccessContainer>
        );

      default:
        return null;
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    return () => {
      setCurrentStep(1);
      setFromToken(null);
      setToToken(null);
      setFromAmount('');
      setToAmount('');
      setSlippage(0.5);
      setError(null);
      setTxHash(null);
    };
  }, []);

  return (
    <BaseModal isOpen={true} onClose={onClose} title="🔄 Swap Tokens">
      <Container>
        {!selectingToken && (
          <StepProgress>
            {Array.from({ length: totalSteps }, (_, i) => (
              <StepDot
                key={i}
                $active={i + 1 === currentStep}
                $completed={i + 1 < currentStep}
              />
            ))}
          </StepProgress>
        )}

        <StepContent>
          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}

          {renderStepContent()}
        </StepContent>

        {!selectingToken && currentStep < 3 && (
          <NavigationContainer>
            {currentStep > 1 && (
              <NavButton onClick={handleBack} disabled={isSwapping}>
                Back
              </NavButton>
            )}
            <NavButton
              $primary
              disabled={!canProceed() || isSwapping}
              onClick={currentStep === 2 ? handleConfirmSwap : handleNext}
            >
              {currentStep === 2 ? (
                isSwapping ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    Swapping...
                  </>
                ) : (
                  '🔄 Confirm Swap'
                )
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </NavButton>
          </NavigationContainer>
        )}

        {selectingToken && (
          <NavigationContainer>
            <NavButton onClick={() => {
              setSelectingToken(null);
              setSearchQuery('');
            }}>
              Cancel
            </NavButton>
          </NavigationContainer>
        )}
      </Container>
    </BaseModal>
  );
};
