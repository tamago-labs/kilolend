'use client';

import { BaseModal } from '../BaseModal';
import { useState, useEffect } from 'react';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { liff } from "@/utils/liff";
import { AlertCircle } from 'react-feather';
import {
  InviteContent,
  MultiplierBanner,
  MultiplierHeader,
  MultiplierValue,
  NextTarget,
  ProgressContainer,
  ProgressTrack,
  ProgressBar,
  ProgressLabel,
  ProgressLabels,
  InfoCard,
  InfoHeader,
  InfoIcon,
  InfoTitle,
  InfoText,
  BenefitIcon,
  BenefitItem,
  BenefitsList,
  LineStatusCard,
  StatusIcon,
  StatusTitle,
  StatusText,
  ShareButton,
  OpenLineButton,
  SuccessMessage,
  LoadingSpinner,
  DisclaimerSection,
  DisclaimerText,
  WalletWarning,
  CountdownTimer,
  CountdownText
} from "./styled"

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InviteData {
  multiplier: number;
  totalInvites: number;
  lastInviteAt?: string;
  isNewUser?: boolean;
}

const API_BASE_URL = 'https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ""

export const InviteModal = ({ isOpen, onClose }: InviteModalProps) => {
  const { account } = useWalletAccountStore();
  const [inviteData, setInviteData] = useState<InviteData>({ multiplier: 1.0, totalInvites: 0 });
  const [lineInfo, setLineInfo] = useState<{ isLineConnected: boolean }>({ isLineConnected: false });
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);

  // Load user invite data
  const loadInviteData = async () => {
    if (!account) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/invite/${account}`);
      const data = await response.json();

      if (data.success) {
        setInviteData(data.data);
      } else {
        setError('Failed to load invite data');
      }
    } catch (err) {
      console.error('Error loading invite data:', err);
      setError('Failed to load invite data');
    } finally {
      setLoading(false);
    }
  };

  // Update multiplier after successful invite
  const updateMultiplier = async () => {
    if (!account) return;

    try {
      const response = await fetch(`${API_BASE_URL}/invite/${account}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': API_KEY
        },
        body: JSON.stringify({
          multiplierIncrease: 0.02
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state with new multiplier
        setInviteData(prev => ({
          ...prev,
          multiplier: data.data.multiplier,
          totalInvites: data.data.totalInvites
        }));

        // Start cooldown timer (1 minute)
        setIsInCooldown(true);
        setCountdown(60);

        return true;
      } else if (response.status === 429) {
        // Handle cooldown period
        setIsInCooldown(true);
        setCountdown(data.remainingCooldownSeconds || 60);
        return false;
      } else {
        throw new Error(data.error || 'Failed to update multiplier');
      }
    } catch (err) {
      console.error('Error updating multiplier:', err);
      throw err;
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdown === 0 && isInCooldown) {
      setIsInCooldown(false);
    }
  }, [countdown, isInCooldown]);

  useEffect(() => {
    const checkLineStatus = async () => {
      try {
        if (liff.isInClient()) {
          setLineInfo({ isLineConnected: true });
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
      loadInviteData();
      setShareSuccess(false);
    }
  }, [isOpen, account]);

  const handleShare = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (isInCooldown) {
      return; // Button should be disabled, but extra safety
    }

    setIsSharing(true);
    setShareSuccess(false);
    setError('');

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

        // Update multiplier on backend
        const success = await updateMultiplier();

        if (success) {
          setShareSuccess(true);
        }
      } else {
        console.log("Share canceled");
      }
    } catch (error) {
      console.error('Share error:', error);
      setError('Failed to process invite. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  // Format countdown timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress values
  const maxMultiplier = 2.0;
  const progress = Math.min(inviteData.multiplier - 1.0, maxMultiplier - 1.0) / (maxMultiplier - 1.0);
  const nextTarget = Math.ceil(inviteData.multiplier * 50) / 50;
  const invitesNeeded = Math.max(0, Math.round((nextTarget - inviteData.multiplier) / 0.02));

  // Determine if invite button should be disabled
  const isInviteDisabled = !account || !lineInfo.isLineConnected || isSharing || isInCooldown;

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
            <MultiplierValue>{inviteData.multiplier.toFixed(2)}x</MultiplierValue>
            <NextTarget>
              {loading ? 'Loading...' :
                invitesNeeded > 0 ? `${invitesNeeded} more invites → ${nextTarget.toFixed(2)}x` : 'Max Multiplier Reached'}
            </NextTarget>
          </MultiplierHeader>
          <ProgressContainer>
            <ProgressTrack>
              <ProgressBar $progress={progress} />
            </ProgressTrack>
            <ProgressLabels>
              <ProgressLabel $active={inviteData.multiplier >= 1.0}>1.0x</ProgressLabel>
              <ProgressLabel $active={inviteData.multiplier >= 1.2}>1.2x</ProgressLabel>
              <ProgressLabel $active={inviteData.multiplier >= 1.4}>1.4x</ProgressLabel>
              <ProgressLabel $active={inviteData.multiplier >= 1.6}>1.6x</ProgressLabel>
              <ProgressLabel $active={inviteData.multiplier >= 1.8}>1.8x</ProgressLabel>
              <ProgressLabel $active={inviteData.multiplier >= 2.0}>2.0x</ProgressLabel>
            </ProgressLabels>
          </ProgressContainer>
        </MultiplierBanner>

        {/* Countdown Timer */}
        {isInCooldown && countdown > 0 && (
          <CountdownTimer>
            <CountdownText>
              ⏱️ Cooldown active: {formatTime(countdown)} remaining
            </CountdownText>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
              You can send another invite when the timer reaches zero
            </div>
          </CountdownTimer>
        )}

        {/* Success Message */}
        {shareSuccess && (
          <SuccessMessage>
            <span>✅</span>
            <span>Invitation sent successfully! Your multiplier has been updated to {inviteData.multiplier.toFixed(2)}x</span>
          </SuccessMessage>
        )}

        {/* Wallet Connection Warning */}
        {!account && (
          <WalletWarning>
            <AlertCircle size={16} color="#3b82f6" />
            <span style={{ color: '#1e40af' }}>Please connect your wallet</span>
          </WalletWarning>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}


        {account && (
          <LineStatusCard $connected={lineInfo.isLineConnected}>
            {lineInfo.isLineConnected ? (
              <>
                <StatusTitle style={{ color: account ? '#065f46' : '#b45309' }}>
                  {account ? 'Ready to Invite' : 'Wallet Required'}
                </StatusTitle>
                {account ? (
                  <StatusText>
                    You can now share KiloLend with your LINE friends and start earning bonus multipliers!
                    {inviteData.totalInvites > 0 && (
                      <div style={{ marginTop: '8px', fontWeight: '600' }}>
                        Total successful invites: {inviteData.totalInvites}
                      </div>
                    )}
                  </StatusText>
                ) : (
                  <StatusText style={{ color: '#b45309' }}>
                    Please connect your wallet to start inviting friends and earning multiplier bonuses.
                  </StatusText>
                )}
                <ShareButton
                  onClick={handleShare}
                  disabled={isInviteDisabled}
                >
                  {isSharing ? (
                    <>
                      <LoadingSpinner />
                      Inviting...
                    </>
                  ) : isInCooldown ? (
                    `Cooldown: ${formatTime(countdown)}`
                  ) : !account ? (
                    'Connect Wallet First'
                  ) : (
                    'Invite Now'
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
        )

        }

        <DisclaimerSection>
          <DisclaimerText>
            <b>Please note:</b> We may reset multipliers from time to time and update the rules as necessary to maintain fairness.
          </DisclaimerText>
        </DisclaimerSection>

      </InviteContent>
    </BaseModal>
  );
};