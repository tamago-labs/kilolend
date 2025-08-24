import styled from 'styled-components';

export const ModalOverlay = styled.div`
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

export const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

export const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const BotIcon = styled.div`
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

export const ModalForm = styled.div`
  margin-bottom: 20px;
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

export const Input = styled.input`
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

export const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
`;

export const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const ChatDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
`;

export const BalanceSection = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
`;

export const BalanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const BalanceTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

export const BalanceRefresh = styled.button`
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

export const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const BalanceAmount = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
`;

export const BalanceUSD = styled.span`
  font-size: 12px;
  color: #64748b;
`;

export const WalletConnectPrompt = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  text-align: center;
`;

export const ConnectText = styled.p`
  font-size: 14px;
  color: #92400e;
  margin-bottom: 8px;
`;

export const ConnectButton = styled.button`
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

export const ValidationMessage = styled.div<{ $error?: boolean }>`
  font-size: 12px;
  color: ${props => props.$error ? '#ef4444' : '#00C300'};
  margin-top: 4px;
  padding: 4px 0;
`;

export const MaxButton = styled.button`
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

export const TransactionDetails = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border-left: 3px solid #00C300;
`;

export const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const DetailLabel = styled.span`
  font-size: 12px;
  color: #64748b;
`;

export const DetailValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
`;

export const NetworkFee = styled.div`
  background: #fef3c7;
  border-radius: 6px;
  padding: 8px;
  margin-top: 12px;
  font-size: 11px;
  color: #92400e;
  text-align: center;
`;
