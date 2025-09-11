'use client';

import { BaseModal } from './BaseModal';
import styled, { keyframes } from 'styled-components';
import { useState, useEffect } from 'react';
import { liff } from "@/utils/liff";
import { Share2, Gift } from 'react-feather';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const fillProgress = keyframes`
  from {
    width: 0%;
  }
  to {
    width: var(--target-width);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const InviteContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const MultiplierBanner = styled.div`
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

const MultiplierHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
`;

const MultiplierValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  animation: ${pulse} 2s ease-in-out infinite;
  
  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

const NextTarget = styled.div`
  font-size: 12px;
  opacity: 0.8;
  font-weight: 500;
`;

const ProgressContainer = styled.div`
  position: relative;
  z-index: 1;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressBar = styled.div<{ $progress: number }>`
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

const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 10px;
  opacity: 0.7;
`;

const ProgressLabel = styled.span<{ $active?: boolean }>`
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  opacity: ${({ $active }) => $active ? '1' : '0.6'};
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const InfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #ecfdf5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
`;

const InfoTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 16px 0;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
`;

const BenefitIcon = styled.div`
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

const LineStatusCard = styled.div<{ $connected: boolean }>`
  background: ${({ $connected }) => $connected ? '#ecfdf5' : '#ffedd5'};
  border: 1px solid ${({ $connected }) => $connected ? '#10b981' : '#f97316'};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
`;

const StatusIcon = styled.div<{ $connected: boolean }>`
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

const StatusTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const StatusText = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.4;
`;

const ShareButton = styled.button`
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

const OpenLineButton = styled.a`
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

const SuccessMessage = styled.div`
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

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff40;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const DisclaimerSection = styled.div` 
  padding: 20px; 
  text-align: center;
  background: linear-gradient(135deg, #fff7ed, #ffedd5); /* warm orange gradient */
  border-radius: 8px;
  border: 1px solid #f97316; /* orange border */
`;

const DisclaimerText = styled.p`
  font-size: 14px;
  color: #b45309; /* deep orange for readability */ 
`;


interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal = ({ isOpen, onClose }: InviteModalProps) => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [lineInfo, setLineInfo] = useState<{
    isLineConnected: boolean;
  }>({ isLineConnected: false });
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    const checkLineStatus = async () => {
      try {
        if (liff.isInClient()) {
          setLineInfo({
            isLineConnected: true
          });
        } else {
          setLineInfo({ isLineConnected: false });
        }
      } catch (error) {
        console.error('Error checking LINE status:', error);
        setLineInfo({ isLineConnected: false });
      }
    };

    if (isOpen) {
      checkLineStatus();
      setShareSuccess(false);
    }
  }, [isOpen]);

  const handleShare = async () => {
    setIsSharing(true);
    setShareSuccess(false);

    try {
      const result = await liff.shareTargetPicker(
        [
          {
            "type": "text",
            "text": "🌐 Join me on KiloLend — the first DeFi lending platform on LINE! \n\n🌱 Earn KILO points by lending and borrowing\n🎉 Boost your rewards with bonus multipliers when you invite friends\n\nStart earning today: https://liff.line.me/2007932254-AVnKMMp9"
          }
        ],
        {
          isMultiple: false,
        }
      );

      if (result) {
        console.log(`[${result.status}] Message sent!`);
        setShareSuccess(true);
        // Simulate multiplier increase (you can replace this with actual API call)
        setMultiplier(prev => prev + 0.02);
      } else {
        console.log("Share canceled");
      }
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  // Calculate progress values
  const maxMultiplier = 2.0;
  const progress = Math.min(multiplier - 1.0, maxMultiplier - 1.0) / (maxMultiplier - 1.0); // 0-1
  const nextTarget = Math.ceil(multiplier * 50) / 50; // Round to nearest 0.02
  const invitesNeeded = Math.max(0, Math.round((nextTarget - multiplier) / 0.02));

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Invite Friends">
      <InviteContent>
        <InfoCard>
          <InfoText>
            Invite friends to KiloLend and boost your KILO point earnings! Each successful invite increases your multiplier.
          </InfoText>
          <BenefitsList>
            <BenefitItem>
              <BenefitIcon>+</BenefitIcon>
              <span><strong>2% multiplier increase</strong> per successful invite</span>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon>+</BenefitIcon>
              <span><strong>No limit</strong> on invites - keep growing your multiplier</span>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon>+</BenefitIcon>
              <span><strong>Instant boost</strong> to your daily KILO point earnings</span>
            </BenefitItem>
          </BenefitsList>
        </InfoCard>

        <MultiplierBanner>
          <MultiplierHeader>
            <MultiplierValue>{multiplier.toFixed(2)}x</MultiplierValue>
            <NextTarget>
              {invitesNeeded > 0 ? `${invitesNeeded} more invites → ${nextTarget.toFixed(1)}x` : 'Current Multiplier'}
            </NextTarget>
          </MultiplierHeader>
          <ProgressContainer>
            <ProgressTrack>
              <ProgressBar $progress={progress} />
            </ProgressTrack>
            <ProgressLabels>
              <ProgressLabel $active={multiplier >= 1.0}>1.0x</ProgressLabel>
              <ProgressLabel $active={multiplier >= 1.2}>1.2x</ProgressLabel>
              <ProgressLabel $active={multiplier >= 1.4}>1.4x</ProgressLabel>
              <ProgressLabel $active={multiplier >= 1.6}>1.6x</ProgressLabel>
              <ProgressLabel $active={multiplier >= 1.8}>1.8x</ProgressLabel>
              <ProgressLabel $active={multiplier >= 2.0}>2.0x</ProgressLabel>
            </ProgressLabels>
          </ProgressContainer>
        </MultiplierBanner>

        {shareSuccess && (
          <SuccessMessage>
            <span>✅</span>
            <span>Invitation sent successfully! Your multiplier has been updated.</span>
          </SuccessMessage>
        )}

        <LineStatusCard $connected={lineInfo.isLineConnected}>
          {lineInfo.isLineConnected ? (
            <>
              <StatusTitle style={{ color: '#065f46' }}>LINE Connected</StatusTitle>
              <StatusText>You can now share KiloLend with your LINE friends and start earning bonus multipliers!</StatusText>
              <ShareButton
                onClick={handleShare}
                disabled={isSharing}
              >
                {isSharing ? (
                  <>
                    <LoadingSpinner />
                    Inviting...
                  </>
                ) : (
                  <>
                    Invite Now
                  </>
                )}
              </ShareButton>
            </>
          ) : (
            <>
              <StatusTitle style={{ color: '#b45309' }}>LINE Not Connected</StatusTitle>
              <StatusText style={{ color: '#b45309' }}>To share invitations and earn multiplier bonuses, please open KiloLend in the LINE app.</StatusText>
              <OpenLineButton
                href="https://liff.line.me/2007932254-AVnKMMp9"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in LINE
              </OpenLineButton>
            </>
          )}
        </LineStatusCard>

        <DisclaimerSection>
          <DisclaimerText>
            <b>Please note:</b> We may reset multipliers from time to time and update the rules as necessary to maintain fairness.
          </DisclaimerText>
        </DisclaimerSection>

      </InviteContent>
    </BaseModal>
  );
};