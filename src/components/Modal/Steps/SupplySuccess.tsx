'use client';

import styled from 'styled-components';
import { CheckCircle } from 'react-feather';

const SuccessContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
`;


const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
`;

const SuccessTitle = styled.h3`
  color: #1e293b;
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
`;

const SuccessMessage = styled.p`
  color: #64748b;
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
`;

const TransactionDetails = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: #166534;
`;

const DetailValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #166534;
`;

interface SupplySuccessProps {
  transactionHash?: string;
  amount: string;
  asset: string;
  expectedAPY: number;
}

export const SupplySuccess = ({
  transactionHash,
  amount,
  asset,
  expectedAPY
}: SupplySuccessProps) => {
  return (
    <SuccessContainer>
      <SuccessIcon>
       <CheckCircle size={40} color="white" />
      </SuccessIcon>
      <SuccessTitle>Supply Successful!</SuccessTitle>
      <SuccessMessage>
        Your supply transaction has been submitted to the network. You're now earning {expectedAPY.toFixed(2)}% APY!
      </SuccessMessage>
      
      <TransactionDetails>
        <DetailRow>
          <DetailLabel>Amount Supplied</DetailLabel>
          <DetailValue>{amount} {asset}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Current APY</DetailLabel>
          <DetailValue>{expectedAPY.toFixed(2)}%</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Status</DetailLabel>
          <DetailValue>Confirmed</DetailValue>
        </DetailRow>
        {transactionHash && (
          <DetailRow>
            <DetailLabel>Transaction</DetailLabel>
            <DetailValue>{`${transactionHash.slice(0, 6)}...${transactionHash.slice(-4)}`}</DetailValue>
          </DetailRow>
        )}
      </TransactionDetails>
    </SuccessContainer>
  );
};
