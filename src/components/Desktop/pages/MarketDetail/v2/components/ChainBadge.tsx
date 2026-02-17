"use client"

import styled from 'styled-components';

const ChainBadgeContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
`;

const ChainIcon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
`;

const ChainName = styled.span`
  color: #1e293b;
`;

const ChainId = styled.span`
  font-size: 12px;
  color: #94a3b8;
  font-weight: 400;
`;

interface ChainBadgeProps {
  chainName: string;
  chainId: number;
  iconUrl: string;
}

export const ChainBadge = ({ chainName, chainId, iconUrl }: ChainBadgeProps) => {
  return (
    <ChainBadgeContainer>
      <ChainIcon src={iconUrl} alt={chainName} />
      <ChainName>{chainName}</ChainName>
      <ChainId>#{chainId}</ChainId>
    </ChainBadgeContainer>
  );
};