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

// Enhanced Stats Grid for PortfolioV2
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

export const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover { 
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
`;

export const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
`;

export const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

export const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $positive }) => $positive ? '#06C755' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const DebtBadge = styled.span<{ $hasDebt: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $hasDebt }) => $hasDebt ? '#fef3c7' : '#f0fdf4'};
  color: ${({ $hasDebt }) => $hasDebt ? '#92400e' : '#166534'};
  border: 1px solid ${({ $hasDebt }) => $hasDebt ? 'transparent' : 'transparent'};
`;

export const HealthIndicator = styled.div<{ $level: 'safe' | 'warning' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $level }) =>
    $level === 'safe' ? '#f0fdf4' :
      $level === 'warning' ? '#fef3c7' :
        '#fef2f2'
  };
  color: ${({ $level }) =>
    $level === 'safe' ? '#166534' :
      $level === 'warning' ? '#92400e' :
        '#991b1b'
  };
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
`;

export const SideTabNavigation = styled.div`
  display: flex;
  flex-direction: column;
  width: 250px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
`;

export const SideTabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
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
`;

export const ContentContainer = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 32px;
  min-height: 400px;
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

export const ChainIndicator = styled.div<{ $supported: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
  background: ${({ $supported }) => $supported ? '#f0fdf4' : '#fef2f2'};
  color: ${({ $supported }) => $supported ? '#166534' : '#991b1b'};
  border: 1px solid ${({ $supported }) => $supported ? '#bbf7d0' : '#fecaca'};
`;

export const ChainIcon = styled.div<{ $supported: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ $supported }) => $supported ? '#06C755' : '#ef4444'};
`;

// Skeleton Loading Components
export const SkeletonWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SkeletonPulse = styled.div<{ width?: string; height?: string; $marginBottom?: string }>`
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '16px'};
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: ${({ $marginBottom }) => $marginBottom || '0'};
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export const SkeletonStatCard = styled(StatCard)`
  padding: 24px;
`;

export const SkeletonStatLabel = styled(SkeletonPulse)`
  width: 120px;
  height: 14px;
  margin-bottom: 12px;
`;

export const SkeletonStatValue = styled(SkeletonPulse)`
  width: 180px;
  height: 28px;
  margin-bottom: 8px;
`;

export const SkeletonStatChange = styled(SkeletonPulse)`
  width: 100px;
  height: 14px;
`;
