"use client";

import styled from 'styled-components';

// Portfolio Section Styles
const PortfolioSectionWrapper = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
`;

const ViewAllButton = styled.button`
  background: none;
  border: 1px solid #06C755;
  color: #06C755;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #06C755;
    color: white;
  }
`;

const AssetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AssetItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    background: #e2e8f0;
  }
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AssetIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #06C755 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
`;

const AssetDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AssetName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const AssetType = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const AssetValue = styled.div`
  text-align: right;
`;

const AssetAmount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const AssetAPY = styled.div`
  font-size: 14px;
  color: #10b981;
  font-weight: 500;
`;

interface Asset {
  symbol: string;
  name: string;
  type: 'Supplied' | 'Borrowed';
  amount: string;
  apy: string;
}

interface PortfolioSectionProps {
  assets: Asset[];
  onViewAllClick: () => void;
}

export const PortfolioSection = ({ assets, onViewAllClick }: PortfolioSectionProps) => {
  return (
    <PortfolioSectionWrapper>
      <SectionHeader>
        <SectionTitle>Your Positions</SectionTitle>
        <ViewAllButton onClick={onViewAllClick}>
          View All
        </ViewAllButton>
      </SectionHeader>
      
      <AssetList>
        {assets.map((asset, index) => (
          <AssetItem key={index}>
            <AssetInfo>
              <AssetIcon>{asset.symbol}</AssetIcon>
              <AssetDetails>
                <AssetName>{asset.name}</AssetName>
                <AssetType>{asset.type}</AssetType>
              </AssetDetails>
            </AssetInfo>
            <AssetValue>
              <AssetAmount>{asset.amount}</AssetAmount>
              <AssetAPY>{asset.apy}</AssetAPY>
            </AssetValue>
          </AssetItem>
        ))}
      </AssetList>
    </PortfolioSectionWrapper>
  );
};
