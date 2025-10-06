'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BaseModal } from '../BaseModal';
import { ChevronRight, AlertCircle, CheckCircle, ExternalLink, Repeat } from 'react-feather';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { KAIA_SCAN_URL } from '@/utils/tokenConfig';
import { liff } from '@/utils/liff';
import {
  getAllSwapTokens,
  searchTokens,
  getTokenBySymbol,
  DragonSwapToken,
  isMainToken,
} from '@/utils/dragonSwapTokenAdapter';
import { useDragonSwap, useDragonSwapBalances } from '@/hooks/useDragonSwap';
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
  SelectTokenButton,
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
  SearchInput,
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
  isSwapOnly?: boolean;
  isNative?: boolean;
}

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0, 3.0];

export const SwapModal: React.FC<SwapModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(1);
  const [selectingToken, setSelectingToken] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { account } = useWalletAccountStore();

  // DragonSwap integration
  const dragonSwap = useDragonSwap();
  const { balances, isLoading: balancesLoading, error: balanceError } = useDragonSwapBalances(
    getAllSwapTokens()
  );

  const totalSteps = 3;

  // Show balance error if exists
  useEffect(() => {
    if (balanceError) {
      console.log(`[SwapModal] Balance fetch error: ${balanceError}`);
      setError(`Failed to fetch balances: ${balanceError}`);
    }
  }, [balanceError]);

  // Memoize available tokens to prevent unnecessary recalculations
  const availableTokens: Token[] = useMemo(() => {
    return getAllSwapTokens().map((token) => {
      const balance = balances[token.symbol] || '0';
      const balanceNum = parseFloat(balance);
      const price = 1; // Mock price for now
      const balanceUSD = isNaN(balanceNum) ? '$0.00' : `$${(balanceNum * price).toFixed(2)}`;

      return {
        symbol: token.symbol,
        name: token.name,
        icon: token.icon,
        balance: balanceNum.toFixed(6),
        balanceUSD,
        decimals: token.decimals,
        price,
        isSwapOnly: token.isSwapOnly,
        isNative: token.isNative,
      };
    });
  }, [balances]); // Only recalculate when balances change

  // Filter tokens based on search
  const filteredTokens = useMemo(() => {
    return searchTokens(searchQuery, 'swap').map((token) => {
      const tokenData = availableTokens.find((t) => t.symbol === token.symbol);
      return {
        ...token,
        balance: tokenData?.balance || '0.000000',
        balanceUSD: tokenData?.balanceUSD || '$0.00',
        price: tokenData?.price || 0,
      };
    });
  }, [searchQuery, availableTokens]);

  // Auto-select KAIA as from token ONLY after balances are loaded
  useEffect(() => {
    if (!fromToken && !balancesLoading && Object.keys(balances).length > 0) {
      const kaia = availableTokens.find((t) => t.symbol === 'KAIA');
      if (kaia) {
        console.log(`[SwapModal] Auto-selected KAIA with balance: ${kaia.balance}`);
        setFromToken(kaia);
      }
    }
  }, [balancesLoading, balances, availableTokens, fromToken]);

  // Update fromToken and toToken balances when balances change
  useEffect(() => {
    if (fromToken && !balancesLoading) {
      const updatedToken = availableTokens.find((t) => t.symbol === fromToken.symbol);
      if (updatedToken && updatedToken.balance !== fromToken.balance) {
        console.log(`[SwapModal] Updating ${fromToken.symbol} balance from ${fromToken.balance} to ${updatedToken.balance}`);
        setFromToken(updatedToken);
      }
    }

    if (toToken && !balancesLoading) {
      const updatedToken = availableTokens.find((t) => t.symbol === toToken.symbol);
      if (updatedToken && updatedToken.balance !== toToken.balance) {
        console.log(`[SwapModal] Updating ${toToken.symbol} balance from ${toToken.balance} to ${updatedToken.balance}`);
        setToToken(updatedToken);
      }
    }
  }, [availableTokens, balancesLoading]);

  // Update toAmount when quote changes
  useEffect(() => {
    if (dragonSwap.state.quote && fromToken && toToken && fromAmount) {
      const newToAmount = dragonSwap.state.quote.outputAmount;
      console.log(`[SwapModal] Updating toAmount from quote: ${newToAmount} ${toToken.symbol}`);
      setToAmount(newToAmount);
    } else if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
    }
  }, [dragonSwap.state.quote, fromToken, toToken, fromAmount]);

  // Refetch quote when slippage changes
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      console.log(`[SwapModal] Slippage changed to ${slippage}%, refetching quote`);
      handleFromAmountChange(fromAmount);
    }
  }, [slippage]);

  const handleTokenSelect = (token: Token) => {
    if (selectingToken === 'from') {
      if (toToken && token.symbol === toToken.symbol) {
        setError(`You cannot swap ${token.symbol} for ${token.symbol}`);
        return;
      }
      setFromToken(token);
      setFromAmount('');
      setToAmount('');
      console.log(`[SwapModal] Selected from token: ${token.symbol} (balance: ${token.balance})`);
    } else if (selectingToken === 'to') {
      if (fromToken && token.symbol === fromToken.symbol) {
        setError(`You cannot swap ${token.symbol} for ${token.symbol}`);
        return;
      }
      setToToken(token);
      setToAmount('');
      console.log(`[SwapModal] Selected to token: ${token.symbol} (balance: ${token.balance})`);
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

    console.log('[SwapModal] Swapped token direction');
  };

  const handleMaxAmount = () => {
    if (fromToken) {
      const cleanBalance = fromToken.balance.replace(/,/g, '');
      setFromAmount(cleanBalance);
      handleFromAmountChange(cleanBalance);
      console.log(`[SwapModal] Set max amount: ${cleanBalance}`);
    }
  };

  const handleFromAmountChange = async (value: string) => {
    setFromAmount(value);
    setError(null);

    if (!fromToken || !toToken || !value || parseFloat(value) <= 0) {
      setToAmount('');
      return;
    }

    console.log(`[SwapModal] Getting quote for ${value} ${fromToken.symbol} -> ${toToken.symbol}`);

    try {
      await dragonSwap.getQuote(fromToken.symbol, toToken.symbol, value, slippage);
      
      // The toAmount will be updated by the useEffect hook watching dragonSwap.state.quote
      console.log(`[SwapModal] Quote request sent for ${value} ${fromToken.symbol} -> ${toToken.symbol}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get quote';
      console.log(`[SwapModal] Quote exception: ${errorMsg}`);
      setError(errorMsg);
    }
  };

  const getExchangeRate = () => {
    if (dragonSwap.state.quote && fromToken && toToken) {
      const inputAmount = parseFloat(dragonSwap.state.quote.inputAmount);
      const outputAmount = parseFloat(dragonSwap.state.quote.outputAmount);
      if (inputAmount > 0) {
        return (outputAmount / inputAmount).toFixed(6);
      }
    }
    return '0';
  };

  const getPriceImpact = () => {
    return dragonSwap.state.quote?.priceImpact || 0.1;
  };

  const getTradingFee = () => {
    if (!fromAmount || !fromToken) return '0';
    return (parseFloat(fromAmount) * 0.003).toFixed(6);
  };

  const getMinimumReceived = () => {
    if (dragonSwap.state.quote) {
      const outputAmount = parseFloat(dragonSwap.state.quote.outputAmount);
      return (outputAmount * (1 - slippage / 100)).toFixed(6);
    }
    return '0';
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return fromToken !== null && toToken !== null;
      case 2:
        const cleanBalance = fromToken?.balance.replace(/,/g, '') || '0';
        return (
          fromAmount &&
          parseFloat(fromAmount) > 0 &&
          parseFloat(fromAmount) <= parseFloat(cleanBalance) &&
          dragonSwap.state.quote !== null
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      console.log(`[SwapModal] Advanced to step ${currentStep + 1}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
      console.log(`[SwapModal] Went back to step ${currentStep - 1}`);
    }
  };

  const handleConfirmSwap = async () => {
    if (!account || !fromToken || !toToken || !fromAmount) {
      console.log('[SwapModal] Missing required data for swap');
      return;
    }

    setIsSwapping(true);
    setError(null);
    console.log(`[SwapModal] Starting swap: ${fromAmount} ${fromToken.symbol} -> ${toToken.symbol}`);

    try {
      // Check if approval is needed
      if (dragonSwap.state.needsApproval) {
        console.log(`[SwapModal] Approval needed for ${fromToken.symbol}`);
        const approvalResult = await dragonSwap.approveToken(fromToken.symbol);

        if (!approvalResult.success) {
          throw new Error(approvalResult.error || 'Approval failed');
        }
        console.log('[SwapModal] Approval successful');
      }

      // Execute swap
      console.log('[SwapModal] Executing swap transaction');
      const swapResult = await dragonSwap.executeSwap(
        fromToken.symbol,
        toToken.symbol,
        fromAmount,
        slippage
      );

      if (swapResult.success) {
        console.log('[SwapModal] Swap successful');
        setTxHash('0x' + Math.random().toString(16).substring(2, 66));
        setCurrentStep(3);
      } else {
        throw new Error(swapResult.error || 'Swap failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Swap transaction failed';
      console.log(`[SwapModal] Swap failed: ${errorMsg}`);
      setError(errorMsg);
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
      window.open(txUrl, '_blank');
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

          {balancesLoading && <div>Loading balances...</div>}

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
              <AlertCircle size={16} />
              <div>
                <strong>Powered by DragonSwap:</strong> This swap is processed externally. No
                KILO points will be earned.
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
                  <ChangeButton onClick={() => setSelectingToken('from')}>Change</ChangeButton>
                </SelectedTokenBox>
              ) : (
                <SelectTokenButton onClick={() => setSelectingToken('from')}>
                  Select Token
                </SelectTokenButton>
              )}
            </TokenSection>

            <SwapDirectionButton onClick={handleSwapDirection}>
              <Repeat />
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
                  <ChangeButton onClick={() => setSelectingToken('to')}>Change</ChangeButton>
                </SelectedTokenBox>
              ) : (
                <SelectTokenButton onClick={() => setSelectingToken('to')}>
                  Select Token
                </SelectTokenButton>
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

            {dragonSwap.state.isLoading && <div>Getting quote...</div>}

            {fromAmount && parseFloat(fromAmount) > 0 && dragonSwap.state.quote && (
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
            <SuccessMessage>Your tokens have been swapped successfully</SuccessMessage>

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

            <NavButton $primary $fullWidth onClick={onClose}>
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
      setSlippage(1);
      setError(null);
      setTxHash(null);
      dragonSwap.resetState();
    };
  }, []);

  return (
    <BaseModal isOpen={true} onClose={onClose} title="Swap Tokens">
      <Container>
        {!selectingToken && (
          <StepProgress>
            {Array.from({ length: totalSteps }, (_, i) => (
              <StepDot key={i} $active={i + 1 === currentStep} $completed={i + 1 < currentStep} />
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

          {dragonSwap.state.error && dragonSwap.state.error !== error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {dragonSwap.state.error}
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
              disabled={!canProceed() || isSwapping || dragonSwap.state.isLoading}
              onClick={currentStep === 2 ? handleConfirmSwap : handleNext}
            >
              {currentStep === 2 ? (
                isSwapping ? (
                  <>Swapping...</>
                ) : dragonSwap.state.needsApproval ? (
                  'Approve & Swap'
                ) : (
                  'Confirm Swap'
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
            <NavButton
              onClick={() => {
                setSelectingToken(null);
                setSearchQuery('');
              }}
            >
              Cancel
            </NavButton>
          </NavigationContainer>
        )}
      </Container>
    </BaseModal>
  );
};
