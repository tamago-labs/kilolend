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

// Step 1: Welcome
export const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, #06C755, #059669);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  color: white;
  position: relative;
`;

export const WelcomeIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

export const WelcomeTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
`;

export const WelcomeSubtitle = styled.p`
  font-size: 16px;
  margin: 0;
  opacity: 0.95;
  line-height: 1.6;
`;

export const SkipButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const InfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
`;

export const InfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const BenefitItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
`;

export const BenefitIcon = styled.div`
  width: 20px;
  height: 20px;
  background: #dcfce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #166534;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 2px;
`;

export const ComparisonBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
`;

export const ComparisonTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
`;

export const ComparisonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

export const ComparisonLabel = styled.span`
  color: #64748b;
`;

export const ComparisonValue = styled.span`
  color: #1e293b;
  font-weight: 600;
`;

// Step 2: Package Selection
export const PackageSection = styled.div`
  margin-bottom: 20px;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

export const PackageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export const PackageCard = styled.div<{ $selected?: boolean; $popular?: boolean }>`
  background: ${props => props.$selected ? '#f0fdf4' : 'white'};
  border: 2px solid ${props => props.$selected ? '#06C755' : '#e2e8f0'};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  ${props => props.$popular && `
    &::before {
      content: '⭐';
      position: absolute;
      top: -8px;
      right: 8px;
      font-size: 20px;
    }
  `}

  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.$selected ? '#06C755' : '#cbd5e1'};
  }
`;

export const PackageAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

export const PackageValue = styled.div`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
`;

export const PackageBonus = styled.div`
  display: inline-block;
  background: #dcfce7;
  color: #166534;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
`;

export const LockPeriodBox = styled.div`
  background: #f8fafc;
  border: 2px solid #06C755;
  border-radius: 12px;
  padding: 16px;
`;

export const LockPeriodHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const LockPeriodInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const LockPeriodDays = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
`;

export const LockPeriodAPY = styled.div`
  font-size: 14px;
  color: #06C755;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
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
  margin-top: 12px;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

export const ExpectedReturns = styled.div`
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 12px;
  padding: 16px;
`;

export const ReturnsRow = styled.div`
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

export const ReturnLabel = styled.div`
  font-size: 13px;
  color: #166534;
`;

export const ReturnValue = styled.div<{ $large?: boolean }>`
  font-size: ${props => props.$large ? '20px' : '16px'};
  font-weight: 700;
  color: #166534;
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

export const TimelineBox = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: left;
`;

export const TimelineTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
`;

export const TimelineStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const TimelineNumber = styled.div`
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

export const TimelineText = styled.div`
  flex: 1;
  font-size: 13px;
  color: #475569;
  padding-top: 4px;
  line-height: 1.5;
`;

export const UnlockDateBox = styled.div`
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 2px solid #86efac;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

export const UnlockLabel = styled.div`
  font-size: 12px;
  color: #166534;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const UnlockDate = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #166534;
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
