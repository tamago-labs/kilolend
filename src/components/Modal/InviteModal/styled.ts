import styled, { keyframes } from 'styled-components';


export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const fillProgress = keyframes`
  from {
    width: 0%;
  }
  to {
    width: var(--target-width);
  }
`;

export const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

export const InviteContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const MultiplierBanner = styled.div`
background: linear-gradient(135deg, #06C755, #3B82F6);
  padding: 20px 24px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  color: white;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    top: -10%;
    right: -10%;
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    z-index: 0;
  }
`;

export const MultiplierHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
`;

export const MultiplierValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  animation: ${pulse} 2s ease-in-out infinite;
  
  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

export const NextTarget = styled.div`
  font-size: 12px;
  opacity: 0.8;
  font-weight: 500;
`;

export const ProgressContainer = styled.div`
  position: relative;
  z-index: 1;
`;

export const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

export const ProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #06C755, #fbbf24);
  border-radius: 4px;
  width: ${({ $progress }) => $progress * 100}%;
  transition: width 0.8s ease-in-out;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 4px;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 0 4px 4px 0;
  }
`;

export const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 10px;
  opacity: 0.7;
`;

export const ProgressLabel = styled.span<{ $active?: boolean }>`
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  opacity: ${({ $active }) => $active ? '1' : '0.6'};
`;

export const InfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

export const InfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

export const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #ecfdf5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
`;

export const InfoTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

export const InfoText = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 16px 0;
`;

export const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
`;

export const BenefitIcon = styled.div`
  width: 16px;
  height: 16px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
`;

export const LineStatusCard = styled.div<{ $connected: boolean }>`
  background: ${({ $connected }) => $connected ? '#ecfdf5' : '#ffedd5'};
  border: 1px solid ${({ $connected }) => $connected ? '#10b981' : '#f97316'};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
`;

export const StatusIcon = styled.div<{ $connected: boolean }>`
  width: 48px;
  height: 48px;
  background: ${({ $connected }) => $connected ? '#10b981' : '#ef4444'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
`;

export const StatusTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

export const StatusText = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.4;
`;

export const ShareButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  background: #06C755;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  
  &:hover {
    background: #05b648;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const OpenLineButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  background: #06C755;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.2s;
  width: 100%;
  margin-top: 8px;

  &:hover {
    background: #05b648;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SuccessMessage = styled.div`
  background: #ecfdf5;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #065f46;
  font-size: 14px;
  font-weight: 500;
`;

export const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff40;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const DisclaimerSection = styled.div` 
  padding: 20px; 
  text-align: center;
  background: linear-gradient(135deg, #fff7ed, #ffedd5); /* warm orange gradient */
  border-radius: 8px;
  border: 1px solid #f97316; /* orange border */
`;

export const DisclaimerText = styled.p`
  font-size: 14px;
  color: #b45309; /* deep orange for readability */ 
`;

export const WalletWarning = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #dbeafe;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

export const CountdownTimer = styled.div`
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  margin: 16px 0;
  animation: ${pulse} 2s ease-in-out infinite;
`;

export const CountdownText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #92400e;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
