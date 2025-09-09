'use client';

import styled from 'styled-components';
import { CheckCircle, ExternalLink } from 'react-feather';

const Container = styled.div`
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

const SuccessTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const SuccessMessage = styled.p`
  font-size: 16px;
  color: #64748b;
  margin: 0 0 32px 0;
  line-height: 1.5;
`;

const DetailsSection = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    font-weight: 600;
  }
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const DetailValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const TransactionLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #06C755;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const NextStepsSection = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const NextStepsTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #0369a1;
  margin: 0 0 12px 0;
`;

const NextStepsList = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: #0369a1;
`;

const NextStepsItem = styled.li`
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const WarningSection = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  text-align: left;
`;

const WarningText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #92400e;
  line-height: 1.4;
`;

interface BorrowSuccessProps {
  transactionHash?: string;
  amount: string;
  asset: string;
  borrowAPR: number;
}

export const BorrowSuccess = ({
  transactionHash,
  amount,
  asset,
  borrowAPR
}: BorrowSuccessProps) => {
  const yearlyInterest = parseFloat(amount) * (borrowAPR / 100);
  // const explorerUrl = transactionHash ? `https://kairos.kaiascan.io/tx/${transactionHash}` : null;

  return (
    <Container>
      <SuccessIcon>
        <CheckCircle size={40} color="white" />
      </SuccessIcon>
      
      <SuccessTitle>Borrow Successful!</SuccessTitle>
      <SuccessMessage>
        You have successfully borrowed {amount} {asset}. The tokens have been sent to your wallet.
      </SuccessMessage>

      {/* {explorerUrl && (
        <TransactionLink href={explorerUrl} target="_blank" rel="noopener noreferrer">
          View Transaction <ExternalLink size={16} />
        </TransactionLink>
      )} */}

      <DetailsSection>
        <DetailRow>
          <DetailLabel>Borrowed Amount</DetailLabel>
          <DetailValue>{amount} {asset}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Borrow APR</DetailLabel>
          <DetailValue>{borrowAPR.toFixed(2)}%</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Estimated Yearly Interest</DetailLabel>
          <DetailValue>{yearlyInterest.toFixed(4)} {asset}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Status</DetailLabel>
          <DetailValue>Active Loan</DetailValue>
        </DetailRow>
      </DetailsSection>

      {/* <NextStepsSection>
        <NextStepsTitle>Important Reminders</NextStepsTitle>
        <NextStepsList>
          <NextStepsItem>
            Interest accrues continuously on your borrowed amount
          </NextStepsItem>
          <NextStepsItem>
            Monitor your health factor to avoid liquidation
          </NextStepsItem>
          <NextStepsItem>
            You can repay anytime to reduce interest costs
          </NextStepsItem>
          <NextStepsItem>
            Consider setting up alerts for health factor changes
          </NextStepsItem>
        </NextStepsList>
      </NextStepsSection> */}

      {/* <WarningSection>
        <WarningText>
          <strong>⚠️ Important:</strong> Your debt will increase over time due to interest. 
          Make sure to repay your loan or maintain sufficient collateral to avoid liquidation. 
          You can monitor your position in the dashboard.
        </WarningText>
      </WarningSection> */}
    </Container>
  );
};
