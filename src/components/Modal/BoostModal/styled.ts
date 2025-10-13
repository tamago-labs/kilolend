import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const TabContainer = styled.div`
  display: flex;
  background: #f8fafc;
  border-radius: 12px;
  padding: 4px;
  border: 1px solid #e2e8f0;
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

  &:hover {
    background: ${props => props.$active ? '#06C755' : '#f1f5f9'};
  }
`;

export const StepProgress = styled.div`
  display: flex;
  justify-content: center;
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
    
    &:hover:not(:disabled) {
      background: #059669;
      border-color: #059669;
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

// Vault Cards
export const VaultGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const VaultCard = styled.div<{ $selected?: boolean }>`
  background: ${props => props.$selected ? '#f0fdf4' : 'white'};
  border: 2px solid ${props => props.$selected ? '#06C755' : '#e2e8f0'};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    border-color: ${props => props.$selected ? '#06C755' : '#cbd5e1'};
  }
`;

export const VaultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

export const VaultIcon = styled.div`
  font-size: 32px;
  flex-shrink: 0;
`;

export const VaultInfo = styled.div`
  flex: 1;
`;

export const VaultName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
`;

export const VaultAsset = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
`;

export const VaultStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

export const VaultStat = styled.div`
  text-align: center;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
`;

export const StatLabel = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
`;

export const StatValue = styled.div<{ $highlight?: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.$highlight ? '#06C755' : '#1e293b'};
`;

export const VaultDescription = styled.div`
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 8px;
`;

export const VaultStrategy = styled.div`
  font-size: 12px;
  color: #64748b;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 10px;
  line-height: 1.5;
`;

export const RiskBadge = styled.div<{ $risk: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => {
    switch (props.$risk) {
      case 'Low': return '#dcfce7';
      case 'Medium': return '#fef3c7';
      case 'Medium-High': return '#fed7aa';
      case 'High': return '#fecaca';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$risk) {
      case 'Low': return '#166534';
      case 'Medium': return '#92400e';
      case 'Medium-High': return '#9a3412';
      case 'High': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

export const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

export const InfoBanner = styled.div<{ $type: 'info' | 'warning' | 'success' }>`
  background: ${props => {
    switch (props.$type) {
      case 'warning': return '#fffbeb';
      case 'success': return '#f0fdf4';
      default: return '#f0f9ff';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$type) {
      case 'warning': return '#fbbf24';
      case 'success': return '#86efac';
      default: return '#bae6fd';
    }
  }};
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  color: ${props => {
    switch (props.$type) {
      case 'warning': return '#92400e';
      case 'success': return '#166534';
      default: return '#075985';
    }
  }};
  line-height: 1.6;
  display: flex;
  gap: 8px;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

// Input Components
export const InputGroup = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

export const BalanceText = styled.span`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const Input = styled.input`
  width: 100%;
  padding: 16px 80px 16px 16px;
  font-size: 18px;
  font-weight: 600;
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

export const InputLabel = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
`;

export const MaxButton = styled.button`
  margin-top: 8px;
  background: none;
  border: none;
  color: #06C755;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    color: #94a3b8;
    cursor: not-allowed;
  }
`;

export const ExpectedResults = styled.div`
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 12px;
  padding: 16px;
`;

export const ResultRow = styled.div`
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

export const ResultLabel = styled.div`
  font-size: 12px;
  color: #166534;
  font-weight: 500;
`;

export const ResultValue = styled.div<{ $large?: boolean; $highlight?: boolean; $profit?: boolean; $loss?: boolean }>`
  font-size: ${props => props.$large ? '20px' : '16px'};
  font-weight: 700;
  color: ${props => {
    if (props.$highlight) return '#06C755';
    if (props.$profit) return '#16a34a';
    if (props.$loss) return '#dc2626';
    return '#166534';
  }};
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  background: ${props => props.$variant === 'secondary' ? 'white' : '#06C755'};
  color: ${props => props.$variant === 'secondary' ? '#64748b' : 'white'};
  border: 2px solid ${props => props.$variant === 'secondary' ? '#e2e8f0' : '#06C755'};
  padding: 18px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: ${props => props.$variant === 'secondary' ? '#f8fafc' : '#059669'};
    border-color: ${props => props.$variant === 'secondary' ? '#cbd5e1' : '#059669'};
  }

  &:disabled {
    background: #94a3b8;
    border-color: #94a3b8;
    color: white;
    cursor: not-allowed;
    transform: none;
    opacity: 0.6;
  }
`;

// Activity Feed
export const ActivityFeed = styled.div`
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

export const ActivityItem = styled.div<{ $status: string }>`
  background: white;
  border: 1px solid #e2e8f0;
  border-left: 3px solid ${props => {
    switch (props.$status) {
      case 'success': return '#06C755';
      case 'warning': return '#f59e0b';
      case 'pending': return '#3b82f6';
      default: return '#64748b';
    }
  }};
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
`;

export const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

export const ActivityAction = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 13px;
`;

export const ActivityTime = styled.div`
  font-size: 11px;
  color: #94a3b8;
`;

export const ActivityReason = styled.div`
  color: #64748b;
  line-height: 1.5;
`;

export const ActivityLink = styled.a`
  color: #06C755;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;

  &:hover {
    text-decoration: underline;
  }
`;

// Positions List
export const PositionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 350px;
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

export const PositionCard = styled.div<{ $canWithdraw?: boolean; $selected?: boolean }>`
  background: ${props => props.$selected ? '#f0fdf4' : 'white'};
  border: 2px solid ${props => 
    props.$selected ? '#06C755' : 
    props.$canWithdraw ? '#86efac' : '#e2e8f0'
  };
  border-radius: 12px;
  padding: 14px;
  cursor: ${props => props.$canWithdraw ? 'pointer' : 'default'};
  transition: all 0.2s;
  opacity: ${props => props.$canWithdraw ? 1 : 0.7};

  ${props => props.$canWithdraw && `
    &:hover {
      transform: translateY(-1px);
      border-color: #06C755;
    }
  `}
`;

export const PositionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const PositionVault = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
`;

export const PositionStatus = styled.div<{ $locked?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${props => props.$locked ? '#fef3c7' : '#dcfce7'};
  color: ${props => props.$locked ? '#92400e' : '#166534'};
`;

export const PositionStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
`;

export const PositionStat = styled.div`
  text-align: center;
  background: #f8fafc;
  padding: 8px;
  border-radius: 6px;
`;

export const PositionStatLabel = styled.div`
  font-size: 10px;
  color: #64748b;
  margin-bottom: 2px;
  font-weight: 500;
`;

export const PositionStatValue = styled.div<{ $profit?: boolean; $loss?: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${props => {
    if (props.$profit) return '#16a34a';
    if (props.$loss) return '#dc2626';
    return '#1e293b';
  }};
`;

export const PositionInfo = styled.div`
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Withdrawal Requests Table
export const RequestsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  margin-top: 12px;
`;

export const RequestToggle = styled.div`
  display: flex;
  gap: 8px;
`;

export const ToggleButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  border: 2px solid ${props => props.$active ? '#06C755' : '#e2e8f0'};
  background: ${props => props.$active ? '#f0fdf4' : 'white'};
  color: ${props => props.$active ? '#06C755' : '#64748b'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #06C755;
    background: ${props => props.$active ? '#f0fdf4' : '#f8fafc'};
  }
`;

export const RequestsTable = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

export const TableRow = styled.div<{ $header?: boolean; $clickable?: boolean }>`
  display: grid;
  grid-template-columns: 60px 1fr 100px 80px 80px;
  gap: 8px;
  padding: 12px;
  font-size: 13px;
  border-bottom: 1px solid #e2e8f0;
  background: ${props => props.$header ? '#f8fafc' : 'white'};
  font-weight: ${props => props.$header ? 600 : 400};
  color: ${props => props.$header ? '#64748b' : '#1e293b'};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  ${props => props.$clickable && `
    &:hover {
      background: #f8fafc;
    }
  `}
`;

export const TableCell = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RequestCard = styled.div<{ $status?: string }>`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const RequestId = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
`;

export const RequestStatus = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${props => {
    switch (props.$status) {
      case 'ready': return '#dcfce7';
      case 'processing': return '#fef3c7';
      case 'claimed': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'ready': return '#166534';
      case 'processing': return '#92400e';
      case 'claimed': return '#64748b';
      default: return '#64748b';
    }
  }};
`;

export const RequestAmount = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

export const RequestInfo = styled.div`
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
`;

export const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const EmptyStateText = styled.div`
  font-size: 14px;
  line-height: 1.6;
  max-width: 300px;
  margin: 0 auto;
`;

export const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 12px 16px;
  color: #dc2626;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Activity Tab Filter
export const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

export const FilterSelect = styled.select`
  flex: 1;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #1e293b;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;

  &:hover {
    border-color: #cbd5e1;
  }

  &:focus {
    border-color: #06C755;
  }
`;


export const TokenIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    margin-right: 10px;
  }
`;

export const TokenIconImage = styled.img`
  width: 75%;
  height: 75%;
  object-fit: contain;
`;