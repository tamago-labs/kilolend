import styled from 'styled-components';
import { Plus, Info, AlertCircle, CheckCircle } from 'react-feather';

// Styled components for deposit section
const PortfolioSection = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  padding: 20px 32px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const SecurityAlert = styled.div`
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border: 1px solid #3b82f6;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const AlertIcon = styled.div`
  color: #1e40af;
  flex-shrink: 0;
  margin-top: 2px;
`;

const AlertText = styled.p`
  font-size: 14px;
  color: #1e3a8a;
  line-height: 1.5;
  margin: 0;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const TokenSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const AmountInput = styled.input`
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
`;

const BalanceAmount = styled.span`
  font-weight: 600;
  color: #1e293b;
`;

const MaxButton = styled.button`
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

const SummarySection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
`;

const SummaryRow = styled.div`
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

const SummaryLabel = styled.span`
  color: #64748b;
  font-size: 14px;
`;

const SummaryValue = styled.span`
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #06C755 0%, #059669 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(6, 199, 85, 0.3);
    }
  ` : `
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f8fafc;
      color: #1e293b;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #06C755;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #065f46;
  font-size: 14px;
`;

const WithdrawAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  color: #92400e;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #06C755;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface DepositSectionProps {
  availableTokens: any[];
  selectedToken: string;
  depositAmount: string;
  transactionLoading: boolean;
  transactionError: string | null;
  depositSuccess: string | null;
  aiWalletData: any;
  onTokenChange: (token: string) => void;
  onAmountChange: (amount: string) => void;
  onMaxClick: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
  resetError: () => void;
}

export const DepositSection = ({
  availableTokens,
  selectedToken,
  depositAmount,
  transactionLoading,
  transactionError,
  depositSuccess,
  aiWalletData,
  onTokenChange,
  onAmountChange,
  onMaxClick,
  onSubmit,
  onClear,
  resetError
}: DepositSectionProps) => {
  const selectedTokenBalance = availableTokens.find(token => token.symbol === selectedToken);
  const maxAmount = selectedTokenBalance ? parseFloat(selectedTokenBalance.balance) : 0;

  const validateAmount = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      return 'Please enter a valid amount';
    }
    if (parseFloat(depositAmount) > maxAmount) {
      return 'Insufficient balance';
    }
    return null;
  };

  return (
    <PortfolioSection>
      <SectionHeader>
        <SectionTitle>Deposit to AI Wallet</SectionTitle>
      </SectionHeader>

      <div style={{ padding: '32px' }}>
        <SecurityAlert>
          <AlertIcon>
            <Info size={20} />
          </AlertIcon>
          <AlertText>
            Your AI trading agent uses a secure, isolated wallet to execute transactions on your behalf. To ensure you're fully confident, we suggest starting with a small amount first.
          </AlertText>
        </SecurityAlert>

        {transactionError && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {transactionError}
          </ErrorMessage>
        )}

        {depositSuccess && (
          <SuccessMessage>
            <CheckCircle size={16} />
            {depositSuccess}
          </SuccessMessage>
        )}

        <form onSubmit={onSubmit}>
          <FormRow>
            <FormField>
              <FormLabel>Select Token</FormLabel>
              <TokenSelect
                value={selectedToken}
                onChange={(e) => onTokenChange(e.target.value)}
                disabled={transactionLoading}
              >
                <option value="">Choose a token...</option>
                {availableTokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.name} ({token.symbol})
                  </option>
                ))}
              </TokenSelect>
            </FormField>

            <FormField>
              <FormLabel>Amount</FormLabel>
              <AmountInput
                type="number"
                value={depositAmount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="0.00"
                step="any"
                min="0"
                max={maxAmount}
                disabled={transactionLoading || !selectedToken}
              />
              <BalanceInfo>
                <span>Available: <BalanceAmount>{selectedTokenBalance?.formattedBalance || '0'} {selectedToken}</BalanceAmount></span>
                <MaxButton
                  type="button"
                  onClick={onMaxClick}
                  disabled={transactionLoading || !selectedToken}
                >
                  MAX
                </MaxButton>
              </BalanceInfo>
            </FormField>
          </FormRow>

          {selectedToken && depositAmount && parseFloat(depositAmount) > 0 && (
            <SummarySection>
              <SummaryRow>
                <SummaryLabel>Token</SummaryLabel>
                <SummaryValue>{selectedToken}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Amount</SummaryLabel>
                <SummaryValue>{parseFloat(depositAmount).toFixed(6)} {selectedToken}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>To</SummaryLabel>
                <SummaryValue>{aiWalletData.aiWalletAddress.slice(0, 8)}...{aiWalletData.aiWalletAddress.slice(-6)}</SummaryValue>
              </SummaryRow>
            </SummarySection>
          )}

          <ActionButton
            type="submit"
            $variant="primary"
            disabled={transactionLoading || !selectedToken || !depositAmount || validateAmount() !== null}
          >
            {transactionLoading ? (
              <>
                <LoadingSpinner />
                Depositing...
              </>
            ) : (
              'Deposit to AI Wallet'
            )}
          </ActionButton>

          <WithdrawAlert style={{ marginTop: '16px' }}>
            <AlertIcon style={{ color: '#92400e' }}>
              <Info size={20} />
            </AlertIcon>
            <AlertText style={{ color: '#92400e' }}>
              To withdraw funds from your AI wallet, go to AI Chat and tell your AI agent: 'Withdraw [amount] [token] to my main wallet'.
            </AlertText>
          </WithdrawAlert>
        </form>
      </div>
    </PortfolioSection>
  );
};