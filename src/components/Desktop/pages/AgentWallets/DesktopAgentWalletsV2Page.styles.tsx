import styled from 'styled-components';

export const PortfolioContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

export const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
`;

export const LoadingState = styled.div`
  text-align: center;
  padding: 80px 24px;
  color: #64748b;
  font-size: 16px;
`;

export const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #06C755;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

export const LoadingSubtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 32px;
`;

// Side Tab Navigation
export const SideTabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 32px;
  min-height: 600px;
`;

export const SideTabNavigation = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
`;

export const SideTabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: ${({ $active }) => $active ? 'rgba(6, 199, 85, 0.1)' : 'transparent'};
  color: ${({ $active }) => $active ? '#06C755' : '#64748b'};
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid ${({ $active }) => $active ? '#06C755' : 'transparent'};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${({ $active }) => $active ? 'rgba(6, 199, 85, 0.15)' : '#f1f5f9'};
    color: ${({ $active }) => $active ? '#06C755' : '#1e293b'};
  }

  &:first-child {
    border-top-left-radius: 16px;
  }
`;

export const SideTabContent = styled.div`
  flex: 1;
  padding: 32px;
  background: white;
  overflow-y: auto;
`;

export const ContentTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ContentSubtitle = styled.p`
  font-size: 16px;
  color: #64748b;
  margin-bottom: 32px;
  line-height: 1.6;
`;

// Card styles for content sections
export const ContentCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  margin-bottom: 20px;
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

export const CardValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

export const CardLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

// Chain selector styles
export const ChainSelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 24px;
`;

export const ChainSelectorLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
`;

export const ChainSelect = styled.select`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

export const ChainIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

// Balance card styles
export const BalanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

export const BalanceCard = styled(ContentCard)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const TokenRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 12px;
`;

export const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const TokenIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;

export const TokenDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TokenSymbol = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

export const TokenName = styled.span`
  font-size: 13px;
  color: #64748b;
`;

export const TokenAmount = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

export const TokenUSD = styled.span`
  font-size: 14px;
  color: #64748b;
  text-align: right;
`;

// Form styles
export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

export const FormInput = styled.input`
  padding: 12px 16px;
  font-size: 16px;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

export const FormSelect = styled.select`
  padding: 12px 16px;
  font-size: 16px;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $variant }) => $variant === 'primary' ? `
    background: #06C755;
    color: white;
    &:hover {
      background: #059669;
      box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
    }
  ` : $variant === 'secondary' ? `
    background: #f1f5f9;
    color: #1e293b;
    &:hover {
      background: #e2e8f0;
    }
  ` : $variant === 'danger' ? `
    background: #fef2f2;
    color: #dc2626;
    &:hover {
      background: #fee2e2;
    }
  ` : `
    background: #06C755;
    color: white;
  `}
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

// API Keys styles
export const APIKeyRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 12px;
`;

export const APIKeyItem = styled(APIKeyRow)`
`;

export const APIKeyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const APIKeyName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

export const APIKeyDetails = styled.div`
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
`;

export const APIKeyBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: #f0fdf4;
  color: #166534;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const KeyValue = styled.code`
  font-size: 14px;
  color: #64748b;
  background: #f1f5f9;
  padding: 6px 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
`;

export const KeyActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const APIKeyMasked = styled.code`
  font-size: 14px;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
`;

export const APIKeyDate = styled.span`
  font-size: 12px;
  color: #94a3b8;
`;

// Activity Log styles
export const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 12px;
`;

export const ActivityInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ActivityType = styled.span<{ $type: 'deposit' | 'withdraw' | 'trade' | 'error' }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $type }) => 
    $type === 'deposit' ? '#06C755' :
    $type === 'withdraw' ? '#f59e0b' :
    $type === 'trade' ? '#3b82f6' :
    '#dc2626'
  };
`;

export const ActivityDetails = styled.span`
  font-size: 13px;
  color: #64748b;
`;

export const ActivityDate = styled.span`
  font-size: 12px;
  color: #94a3b8;
  text-align: right;
`;

// Skills styles
export const SkillItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 12px;
`;

export const SkillInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SkillName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

export const SkillDescription = styled.span`
  font-size: 14px;
  color: #64748b;
`;

// Security styles
export const SecurityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 12px;
`;

export const SecurityInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SecurityLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

export const SecurityDescription = styled.span`
  font-size: 14px;
  color: #64748b;
`;

export const Toggle = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

export const ToggleSwitch = styled.div<{ $checked: boolean }>`
  width: 48px;
  height: 24px;
  background: ${({ $checked }) => $checked ? '#06C755' : '#cbd5e1'};
  border-radius: 12px;
  position: relative;
  transition: background 0.2s;
`;

export const ToggleKnob = styled.div<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: ${({ $checked }) => $checked ? '26px' : '2px'};
  transition: left 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const ToggleInput = styled.input`
  display: none;
`;

export const StatusBadge = styled.span<{ $status: 'active' | 'inactive' | 'warning' }>`
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ $status }) =>
    $status === 'active' ? '#f0fdf4' :
    $status === 'warning' ? '#fef3c7' :
    '#f1f5f9'
  };
  color: ${({ $status }) =>
    $status === 'active' ? '#166534' :
    $status === 'warning' ? '#92400e' :
    '#64748b'
  };
`;