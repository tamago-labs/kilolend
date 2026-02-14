import styled from 'styled-components';

export const ModalContent = styled.div` 
  max-width: 520px;
  width: 100%;
`;

export const ModalSubtitle = styled.p`
  font-size: 16px;
  color: #64748b;
  text-align: center;
  margin-bottom: 32px;
`;

export const MarketSelector = styled.div`
  margin-bottom: 24px;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  color: #1e293b;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

export const AmountInput = styled.div`
  margin-bottom: 24px;
`;

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const Input = styled.input`
  width: 100%;
  padding: 16px 80px 16px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  background: white;
  color: #1e293b;

  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

export const MaxButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #e2e8f0;
    color: #475569;
  }
`;

export const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 14px;
  color: #64748b;
`;

export const PreviewSection = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

export const PreviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
  }
`;

export const PreviewLabel = styled.div`
  font-size: 14px;
  color: #64748b;
`;

export const PreviewValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

export const SuccessBox = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

export const SuccessText = styled.div`
  font-size: 14px;
  color: #166534;
  line-height: 1.5;
`;

export const WarningBox = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

export const WarningText = styled.div`
  font-size: 14px;
  color: #92400e;
  line-height: 1.5;
`;

export const ActionButton = styled.button<{ $primary?: boolean; $disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  margin-top: 24px;
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
  margin-bottom: 12px;

  &:hover {
    background: ${({ $primary, $disabled }) => 
      $disabled ? '#e2e8f0' : $primary ? '#059669' : '#06C755'};
    color: ${({ $disabled }) => $disabled ? '#94a3b8' : 'white'};
  }
`;

export const CancelButton = styled.button`
  width: 100%;
  padding: 16px;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f8fafc;
  }
`;

export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #06C755;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
  color: white;
`;

export const SuccessMessage = styled.div`
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

export const SuccessSubtext = styled.div`
  text-align: center;
  font-size: 16px;
  color: #64748b;
  margin-bottom: 32px;
  line-height: 1.5;
`;

export const TransactionDetails = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  text-align: left;
`;

export const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const DetailLabel = styled.span`
  font-size: 14px;
  color: #166534;
`;

export const DetailValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #166534;
`;

export const ClickableTransactionHash = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #059669;
    text-decoration: underline;
  }
`;