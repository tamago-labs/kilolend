import styled from 'styled-components';

// Main Container
export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const StepProgress = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  padding: 0 20px;
`;

export const StepDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active, $completed }) => 
    $completed ? '#06C755' : $active ? '#06C755' : '#e2e8f0'};
  margin: 0 4px;
  transition: all 0.3s ease;
`;

export const StepContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const NavigationContainer = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  margin-top: auto;
`;

export const NavButton = styled.button<{ $primary?: boolean; $fullWidth?: boolean }>`
  flex: ${props => props.$fullWidth ? '0 0 100%' : '1'};
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  ${({ $primary }) => $primary ? `
    background: #06C755;
    color: white;
    border-color: #06C755;
    
    &:hover {
      background: #059212;
      border-color: #059212;
      transform: translateY(-1px);
    }
    
    &:disabled {
      background: #94a3b8;
      border-color: #94a3b8;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: white;
    color: #64748b;
    border-color: #e2e8f0;
    
    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  `}
`;

// Step 1: Token Selection
export const TokenSection = styled.div`
  margin-bottom: 20px;
`;

export const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px; 
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
`;

export const TokenCard = styled.div<{ $selected?: boolean }>`
  background: ${props => props.$selected ? '#f0fdf4' : 'white'};
  border: 2px solid ${props => props.$selected ? '#06C755' : '#e2e8f0'};
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    border-color: #06C755;
    transform: translateX(2px);
  }
`;

export const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const TokenIcon = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
`;

export const TokenDetails = styled.div``;

export const TokenSymbol = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
`;

export const TokenName = styled.div`
  font-size: 12px;
  color: #64748b;
`;

export const TokenBalance = styled.div`
  text-align: right;
`;

export const BalanceAmount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

export const BalanceUSD = styled.div`
  font-size: 11px;
  color: #64748b;
`;

export const SwapDirectionButton = styled.button`
  width: 48px;
  height: 48px;
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  margin: 16px auto;
  transition: all 0.2s;

  &:hover {
    background: #dcfce7;
    transform: rotate(180deg);
  }
`;

export const SelectedTokenBox = styled.div`
  background: #f0fdf4;
  border: 2px solid #06C755;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const SelectTokenButton = styled.button`
  width: 100%;
  background: white;
  border: 2px solid #e2e8f0;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    border-color: #06C755;
    color: #06C755;
    background: #f0fdf4;
  }
`;

export const ChangeButton = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #06C755;
    color: #06C755;
  }
`;

// Step 2: Amount Input
export const InputSection = styled.div`
  margin-bottom: 20px;
`;

export const InputLabel = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
`;

export const BalanceText = styled.span`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
`;

export const AmountInputWrapper = styled.div`
  position: relative;
  margin-bottom: 12px;
`;

export const AmountInput = styled.input`
  width: 100%;
  padding: 20px 80px 20px 20px;
  font-size: 24px;
  font-weight: 700;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: #06C755;
  }

  &::placeholder {
    color: #cbd5e1;
  }

  &:read-only {
    background: #f8fafc;
    cursor: not-allowed;
  }
`;

export const InputTokenLabel = styled.div`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
`;

export const MaxButton = styled.button`
  position: absolute;
  right: 80px;
  top: 50%;
  transform: translateY(-50%);
  background: #06C755;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #059669;
  }
`;

export const SwapDetailsBox = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

export const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;

  &:last-child {
    margin-bottom: 0;
    padding-top: 12px;
    border-top: 1px solid #bae6fd;
  }
`;

export const DetailLabel = styled.span`
  color: #64748b;
`;

export const DetailValue = styled.span<{ $warning?: boolean }>`
  color: ${props => props.$warning ? '#f59e0b' : '#1e293b'};
  font-weight: 600;
`;

export const SlippageSettings = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

export const SlippageTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
`;

export const SlippageOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

export const SlippageOption = styled.button<{ $selected?: boolean }>`
  padding: 10px;
  background: ${props => props.$selected ? '#f0fdf4' : 'white'};
  border: 2px solid ${props => props.$selected ? '#06C755' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$selected ? '#06C755' : '#64748b'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #06C755;
  }
`;

export const InfoBanner = styled.div<{ $type: 'info' | 'success' | 'warning' }>`
  background: ${props => 
    props.$type === 'success' ? '#f0fdf4' :
    props.$type === 'warning' ? '#fffbeb' : '#f0f9ff'
  };
  border: 1px solid ${props =>
    props.$type === 'success' ? '#86efac' :
    props.$type === 'warning' ? '#fbbf24' : '#bae6fd'
  };
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  color: ${props =>
    props.$type === 'success' ? '#166534' :
    props.$type === 'warning' ? '#92400e' : '#075985'
  };
  line-height: 1.6;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 16px;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

// Step 3: Success
export const SuccessContainer = styled.div`
  text-align: center;
  padding: 20px 0;
`;

export const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #06C755, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 40px;
`;

export const SuccessTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

export const SuccessMessage = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

export const SwapSummaryBox = styled.div`
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

export const SwapSummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SwapSummaryLabel = styled.span`
  font-size: 13px;
  color: #166534;
`;

export const SwapSummaryValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #166534;
`;

export const TransactionLink = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  color: #06C755;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  margin-bottom: 12px;
  cursor: pointer;

  &:hover {
    border-color: #06C755;
    background: #f0fdf4;
    transform: translateY(-1px);
  }
`;

export const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    flex-shrink: 0;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  margin-bottom: 12px;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #06C755;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;
