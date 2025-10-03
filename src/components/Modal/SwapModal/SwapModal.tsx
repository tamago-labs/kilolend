'use client';

import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
`;

const Header = styled.div`
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  padding: 28px;
  color: white;
  position: relative;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 28px;
  font-weight: bold;
`;

const Subtitle = styled.p`
  margin: 8px 0 0;
  opacity: 0.95;
  font-size: 15px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.25);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  position: absolute;
  top: 28px;
  right: 28px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const TokenSelector = styled.div`
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #06b6d4;
  }
`;

const TokenRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TokenIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

const TokenDetails = styled.div``;

const TokenName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const TokenBalance = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const SwapIcon = styled.div`
  text-align: center;
  font-size: 32px;
  margin: 16px 0;
  color: #06b6d4;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  font-size: 18px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: #06b6d4;
  }
`;

const MaxButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: #06b6d4;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #0891b2;
  }
`;

const SwapDetails = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: #6b7280;
`;

const DetailValue = styled.span`
  color: #111827;
  font-weight: 600;
`;

const SwapButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: white;
  border: none;
  padding: 18px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(6, 182, 212, 0.5);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const InfoBanner = styled.div`
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #92400e;
  line-height: 1.5;
`;

interface SwapModalProps {
  onClose: () => void;
}

const MOCK_TOKENS = [
  {
    symbol: 'KAIA',
    name: 'KAIA',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32880.png',
    balance: '1,234.56',
    price: 0.15,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    balance: '500.00',
    price: 1.00,
  },
  {
    symbol: 'SIX',
    name: 'SIX Token',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3327.png',
    balance: '10,000.00',
    price: 0.05,
  },
  {
    symbol: 'BORA',
    name: 'BORA Token',
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3801.png',
    balance: '2,500.00',
    price: 0.10,
  },
];

export const SwapModal: React.FC<SwapModalProps> = ({ onClose }) => {
  const [fromToken, setFromToken] = useState(MOCK_TOKENS[0]);
  const [toToken, setToToken] = useState(MOCK_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  const handleSwap = () => {
    // Swap the tokens
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    
    // Swap amounts
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && parseFloat(value) > 0) {
      // Simple mock calculation (in real app, use DEX pricing)
      const amount = parseFloat(value);
      const rate = fromToken.price / toToken.price;
      const slippage = 0.995; // 0.5% slippage
      setToAmount((amount * rate * slippage).toFixed(6));
    } else {
      setToAmount('');
    }
  };

  const slippageTolerance = 0.5;
  const priceImpact = 0.1;
  const fee = fromAmount ? (parseFloat(fromAmount) * 0.003).toFixed(4) : '0.00';

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>🔄 Swap Tokens</Title>
          <Subtitle>Trade tokens instantly on DragonSwap</Subtitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Content>
          <InfoBanner>
            💡 Powered by DragonSwap (Uniswap V2 on KAIA)
          </InfoBanner>

          {/* From Token */}
          <InputGroup>
            <Label>
              From
              <span style={{ fontSize: '12px', fontWeight: '400' }}>
                Balance: {fromToken.balance}
              </span>
            </Label>
            <TokenSelector>
              <TokenRow>
                <TokenInfo>
                  <TokenIcon src={fromToken.icon} alt={fromToken.symbol} />
                  <TokenDetails>
                    <TokenName>{fromToken.symbol}</TokenName>
                    <TokenBalance>{fromToken.name}</TokenBalance>
                  </TokenDetails>
                </TokenInfo>
              </TokenRow>
            </TokenSelector>
            <InputWrapper>
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                placeholder="0.00"
              />
              <MaxButton onClick={() => handleFromAmountChange(fromToken.balance.replace(/,/g, ''))}>
                MAX
              </MaxButton>
            </InputWrapper>
          </InputGroup>

          {/* Swap Icon */}
          <SwapIcon onClick={handleSwap} style={{ cursor: 'pointer' }}>
            ⇅
          </SwapIcon>

          {/* To Token */}
          <InputGroup>
            <Label>
              To (estimated)
              <span style={{ fontSize: '12px', fontWeight: '400' }}>
                Balance: {toToken.balance}
              </span>
            </Label>
            <TokenSelector>
              <TokenRow>
                <TokenInfo>
                  <TokenIcon src={toToken.icon} alt={toToken.symbol} />
                  <TokenDetails>
                    <TokenName>{toToken.symbol}</TokenName>
                    <TokenBalance>{toToken.name}</TokenBalance>
                  </TokenDetails>
                </TokenInfo>
              </TokenRow>
            </TokenSelector>
            <InputWrapper>
              <Input
                type="number"
                value={toAmount}
                readOnly
                placeholder="0.00"
                style={{ background: '#f9fafb' }}
              />
            </InputWrapper>
          </InputGroup>

          {/* Swap Details */}
          {fromAmount && parseFloat(fromAmount) > 0 && (
            <SwapDetails>
              <DetailRow>
                <DetailLabel>Rate</DetailLabel>
                <DetailValue>
                  1 {fromToken.symbol} = {(fromToken.price / toToken.price).toFixed(4)} {toToken.symbol}
                </DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Price Impact</DetailLabel>
                <DetailValue style={{ color: priceImpact < 1 ? '#10b981' : '#f59e0b' }}>
                  ~{priceImpact}%
                </DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Slippage Tolerance</DetailLabel>
                <DetailValue>{slippageTolerance}%</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Trading Fee (0.3%)</DetailLabel>
                <DetailValue>{fee} {fromToken.symbol}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Minimum Received</DetailLabel>
                <DetailValue>
                  {toAmount ? (parseFloat(toAmount) * (1 - slippageTolerance / 100)).toFixed(6) : '0.00'} {toToken.symbol}
                </DetailValue>
              </DetailRow>
            </SwapDetails>
          )}

          <SwapButton 
            disabled={!fromAmount || parseFloat(fromAmount) <= 0}
          >
            {!fromAmount || parseFloat(fromAmount) <= 0 
              ? 'Enter Amount' 
              : '🔄 Swap Tokens'
            }
          </SwapButton>

          <div style={{ 
            marginTop: '16px', 
            fontSize: '12px', 
            color: '#6b7280', 
            textAlign: 'center' 
          }}>
            Powered by DragonSwap • Audit by CertiK
          </div>
        </Content>
      </ModalContainer>
    </ModalOverlay>
  );
};
