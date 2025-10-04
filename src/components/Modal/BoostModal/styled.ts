import styled from 'styled-components';

// Main Container (same as Supply/Borrow)
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

export const NavButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
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

// Tabs for Step 1
export const TabContainer = styled.div`
  display: flex;
  background: #f8fafc;
  border-radius: 12px;
  padding: 4px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
`;

export const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  background: ${props => props.$active ? '#06C755' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${props => props.$active ? '#06C755' : '#f1f5f9'};
  }
`;

// Vault Selection
export const VaultGrid = styled.div`
  display: grid;
  gap: 16px;
`;

export const VaultCard = styled.div<{ $selected?: boolean; $disabled?: boolean }>`
  background: ${props => props.$selected ? '#f0fdf4' : 'white'};
  border: 2px solid ${props => props.$selected ? '#06C755' : '#e2e8f0'};
  border-radius: 16px;
  padding: 20px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  
  ${props => !props.$disabled && `
    &:hover {
      transform: translateY(-2px);
      border-color: ${props.$selected ? '#06C755' : '#cbd5e1'};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  `}
`;

export const VaultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

export const VaultIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #06C755, #059669);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

export const VaultInfo = styled.div`
  flex: 1;
`;

export const VaultName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

export const VaultAsset = styled.div`
  font-size: 14px;
  color: #64748b;
`;

export const VaultAPY = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 8px;
  margin-bottom: 12px;
`;

export const APYItem = styled.div`
  flex: 1;
  text-align: center;
`;

export const APYLabel = styled.div`
  font-size: 11px;
  color: #166534;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const APYValue = styled.div<{ $boosted?: boolean }>`
  font-size: ${props => props.$boosted ? '20px' : '16px'};
  font-weight: 700;
  color: ${props => props.$boosted ? '#059669' : '#166534'};
`;

export const VaultStrategy = styled.div`
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
`;

export const ComingSoonBadge = styled.div`
  display: inline-block;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
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

export const QuickAmountButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

export const QuickAmountButton = styled.button<{ $selected?: boolean }>`
  padding: 10px;
  background: ${props => props.$selected ? '#06C755' : 'white'};
  color: ${props => props.$selected ? 'white' : '#64748b'};
  border: 2px solid ${props => props.$selected ? '#06C755' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #06C755;
    background: ${props => props.$selected ? '#059669' : '#f0fdf4'};
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

// Activity Feed in Step 2
export const ActivitySection = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

export const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ActivityFeed = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  max-height: 240px;
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

export const ActivityItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
`;

export const ActivityHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

export const ActivityAction = styled.div<{ $status: 'pending' | 'success' | 'failed' }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props =>
    props.$status === 'success' ? '#059669' :
    props.$status === 'failed' ? '#dc2626' : '#f59e0b'
  };
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const ActivityTime = styled.div`
  font-size: 11px;
  color: #94a3b8;
`;

export const ActivityDetails = styled.div`
  font-size: 11px;
  color: #64748b;
  line-height: 1.4;
`;

export const ActivityLink = styled.a`
  font-size: 11px;
  color: #06C755;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

export const EmptyActivity = styled.div`
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
`;

// Withdraw: Position List
export const PositionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PositionCard = styled.div<{ $selected?: boolean }>`
  background: ${props => props.$selected ? '#f0fdf4' : 'white'};
  border: 2px solid ${props => props.$selected ? '#06C755' : '#e2e8f0'};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #06C755;
    transform: translateY(-1px);
  }
`;

export const PositionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const PositionAmount = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
`;

export const PositionStatus = styled.div<{ $unlocked?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${props => props.$unlocked ? '#dcfce7' : '#fef3c7'};
  color: ${props => props.$unlocked ? '#166534' : '#92400e'};
`;

export const PositionDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
`;

export const PositionDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const PositionDetailLabel = styled.span`
  font-size: 11px;
  color: #94a3b8;
`;

export const PositionDetailValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
`;

// Review & Confirm
export const ReviewSection = styled.div`
  margin-bottom: 20px;
`;

export const ReviewTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

export const SummaryBox = styled.div`
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 2px solid #86efac;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

export const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
    padding-top: 12px;
    border-top: 1px solid #86efac;
  }
`;

export const SummaryLabel = styled.div`
  font-size: 13px;
  color: #166534;
  font-weight: 500;
`;

export const SummaryValue = styled.div<{ $large?: boolean }>`
  font-size: ${props => props.$large ? '20px' : '16px'};
  font-weight: 700;
  color: #166534;
`;

export const StrategySteps = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

export const StrategyStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const StepNumber = styled.div`
  width: 28px;
  height: 28px;
  background: #06C755;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
`;

export const StepText = styled.div`
  flex: 1;
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
  padding-top: 4px;
`;

export const RiskBox = styled.div`
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 12px;
`;

export const RiskTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const RiskList = styled.ul`
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #92400e;
  line-height: 1.6;
`;

// Success
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
