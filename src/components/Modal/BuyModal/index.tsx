'use client';

import React, { useState, useEffect } from 'react';
import { BaseModal } from '../BaseModal';
import { ChevronRight, Check, Clock, TrendingUp, AlertCircle, CheckCircle, Info, Zap, Lock } from 'react-feather';
import * as S from './styled';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Package {
  amount: string;
  fiatAmount: number;
  kaia: string;
  bonus: string | null;
  popular?: boolean;
  sku: string;
}

const PACKAGES: Package[] = [
  { amount: '$10', fiatAmount: 10, kaia: '50', bonus: '+100 KILO', sku: 'starter_10' },
  { amount: '$25', fiatAmount: 25, kaia: '125', bonus: '+500 KILO', sku: 'starter_25' },
  { amount: '$50', fiatAmount: 50, kaia: '250', bonus: '+1500 KILO', popular: false, sku: 'starter_50' },
  { amount: '$100', fiatAmount: 100, kaia: '500', bonus: '+5000 KILO', sku: 'starter_100' },
];

const LOCK_DAYS = 15;
const APY = 18.5;
const EARLY_WITHDRAWAL_PENALTY = 5;

export const BuyModal = ({ isOpen, onClose }: BuyModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<Package>(PACKAGES[2]); // Default to $50
  const [isTransacting, setIsTransacting] = useState(false);
  const [error, setError] = useState<string>('');

  const totalSteps = 3;

  // Check if user has seen intro before
  const hasSeenIntro = typeof window !== 'undefined' && 
    localStorage.getItem('hasSeenStarterIntro') === 'true';

  // If has seen intro, start at step 2
  useEffect(() => {
    if (isOpen && hasSeenIntro) {
      setCurrentStep(2);
    } else if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen, hasSeenIntro]);

  const handleSkipIntro = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenStarterIntro', 'true');
    }
    setCurrentStep(2);
  };

  const calculateReturns = () => {
    const kaiaAmount = parseFloat(selectedPackage.kaia);
    const dailyRate = APY / 365 / 100;
    const earnings = kaiaAmount * dailyRate * LOCK_DAYS;
    const total = kaiaAmount + earnings;

    return {
      principal: kaiaAmount.toFixed(2),
      earnings: earnings.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const returns = calculateReturns();

  const getUnlockDate = () => {
    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + LOCK_DAYS);
    return unlockDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return selectedPackage !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep < totalSteps) {
      if (currentStep === 2 && hasSeenIntro) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('hasSeenStarterIntro');
        }
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePayment = async () => {
    setIsTransacting(true);
    setError('');

    try {
      // TODO: Integrate LINE Payment SDK
      console.log('Processing payment:', {
        package: selectedPackage,
        lockDays: LOCK_DAYS,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(3);
    } catch (err) {
      console.error('Payment failed:', err);
      setError((err as Error).message || 'Payment failed. Please try again.');
    } finally {
      setIsTransacting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <S.WelcomeContainer>
            <S.WelcomeBanner>
              <S.SkipButton onClick={handleSkipIntro}>
                Skip Intro →
              </S.SkipButton>
              <S.WelcomeIcon>✨</S.WelcomeIcon>
              <S.WelcomeTitle>Starter Package</S.WelcomeTitle>
              <S.WelcomeSubtitle>
                Quick start your DeFi journey on LINE Mini Dapp
              </S.WelcomeSubtitle>
            </S.WelcomeBanner>

            <S.InfoCard>
              {/* <S.InfoTitle>
                <Check size={20} color="#06C755" />
                What You Get
              </S.InfoTitle> */}
              <S.BenefitsList>
                <S.BenefitItem>
                  <S.BenefitIcon>
                    <Check size={14} />
                  </S.BenefitIcon>
                  <span>
                    <strong>Easy Entry:</strong> Get KAIA or USDT with credit card (conditions apply)
                  </span>
                </S.BenefitItem>
                <S.BenefitItem>
                  <S.BenefitIcon>
                    <Check size={14} />
                  </S.BenefitIcon>
                  <span>
                    <strong>Auto-Deposit:</strong> Automatically deposited into a vault
                  </span>
                </S.BenefitItem>
                <S.BenefitItem>
                  <S.BenefitIcon>
                    <Check size={14} />
                  </S.BenefitIcon>
                  <span>
                    <strong>15-Day Lockup:</strong> Withdrawals available after the lockup period
                  </span>
                </S.BenefitItem>
                <S.BenefitItem>
                  <S.BenefitIcon>
                    <Check size={14} />
                  </S.BenefitIcon>
                  <span>
                    <strong>Bonus Rewards:</strong> Get extra KILO points
                  </span>
                </S.BenefitItem>
              </S.BenefitsList>
            </S.InfoCard>

            <S.InfoBanner $type="warning">
              <AlertCircle size={16} />
              <div>
                <strong>Not available yet:</strong> This Starter Package will be available soon. Stay tuned and follow our announcements for updates.
              </div>
            </S.InfoBanner>

            {/* <S.InfoCard>
              <S.InfoTitle>
                <TrendingUp size={20} color="#06C755" />
                Perfect For
              </S.InfoTitle>
              <S.BenefitsList>
                <S.BenefitItem>
                  <S.BenefitIcon>✓</S.BenefitIcon>
                  <span>First-time DeFi users who want a simple start</span>
                </S.BenefitItem>
                <S.BenefitItem>
                  <S.BenefitIcon>✓</S.BenefitIcon>
                  <span>Users who prefer credit card over crypto</span>
                </S.BenefitItem>
                <S.BenefitItem>
                  <S.BenefitIcon>✓</S.BenefitIcon>
                  <span>Those who want guaranteed fixed returns</span>
                </S.BenefitItem>
              </S.BenefitsList>
            </S.InfoCard> */}

            {/* <S.ComparisonBox>
              <S.ComparisonTitle>Quick Comparison</S.ComparisonTitle>
              <S.ComparisonRow>
                <S.ComparisonLabel>Payment Method</S.ComparisonLabel>
                <S.ComparisonValue>Credit Card</S.ComparisonValue>
              </S.ComparisonRow>
              <S.ComparisonRow>
                <S.ComparisonLabel>Lock Period</S.ComparisonLabel>
                <S.ComparisonValue>{LOCK_DAYS} days</S.ComparisonValue>
              </S.ComparisonRow>
              <S.ComparisonRow>
                <S.ComparisonLabel>APY</S.ComparisonLabel>
                <S.ComparisonValue>{APY}% (Fixed)</S.ComparisonValue>
              </S.ComparisonRow>
              <S.ComparisonRow>
                <S.ComparisonLabel>Setup Time</S.ComparisonLabel>
                <S.ComparisonValue>~2 minutes</S.ComparisonValue>
              </S.ComparisonRow>
            </S.ComparisonBox> */}
          </S.WelcomeContainer>
        );

      case 2:
        return (
          <>
            {/* <S.InfoBanner $type="warning">
              <AlertCircle size={16} />
              <div>
                <strong>Coming Soon:</strong> Credit card payment integration is under development. 
                This preview shows how it will work.
              </div>
            </S.InfoBanner> */}

            <S.PackageSection>
              <S.SectionTitle>Choose Your Package</S.SectionTitle>
              <S.PackageGrid>
                {PACKAGES.map((pkg) => (
                  <S.PackageCard
                    key={pkg.sku}
                    $selected={selectedPackage.sku === pkg.sku}
                    $popular={pkg.popular}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <S.PackageAmount>{pkg.amount}</S.PackageAmount>
                    <S.PackageValue>≈ {pkg.kaia} KAIA</S.PackageValue>
                    {pkg.bonus && <S.PackageBonus>{pkg.bonus}</S.PackageBonus>}
                  </S.PackageCard>
                ))}
              </S.PackageGrid>
            </S.PackageSection>

            <S.PackageSection>
              {/* <S.SectionTitle>Lock Period</S.SectionTitle> */}
              <S.InfoBanner $type="warning">
                  <AlertCircle size={16} />
                  <span>
                    <strong>15-Day Lockup:</strong> Withdraw early with a 5% penalty, or wait 15 days to withdraw with no penalty.
                  </span>
                </S.InfoBanner>
              {/* <S.LockPeriodBox>
                <S.LockPeriodHeader>
                  <S.LockPeriodInfo>
                    <Clock size={20} color="#06C755" />
                    <S.LockPeriodDays>{LOCK_DAYS} Days</S.LockPeriodDays>
                  </S.LockPeriodInfo>
                  <S.LockPeriodAPY>
                    <TrendingUp size={16} />
                    {APY}% APY
                  </S.LockPeriodAPY>
                </S.LockPeriodHeader>

                <S.InfoBanner $type="warning">
                  <AlertCircle size={16} />
                  <span>
                    <strong>Early Withdrawal:</strong> Available with {EARLY_WITHDRAWAL_PENALTY}% penalty. 
                    After {LOCK_DAYS} days, withdraw anytime with no penalty.
                  </span>
                </S.InfoBanner>
              </S.LockPeriodBox> */}
            </S.PackageSection>
             {/* <S.InfoBanner $type="info">
              <Info size={16} />
              <div>
                Your KAIA will be automatically deposited into <strong>KAIA Leveraged Vault</strong> and start earning immediately.
              </div>
            </S.InfoBanner>
            <br/> */}

            <S.PackageSection>
              <S.SectionTitle>Expected Returns</S.SectionTitle>
              <S.ExpectedReturns>
                 <S.ReturnsRow>
                  <S.ReturnLabel>Target Vault</S.ReturnLabel>
                  <S.ReturnValue>KAIA Leveraged</S.ReturnValue>
                </S.ReturnsRow>
                <S.ReturnsRow>
                  <S.ReturnLabel>Your Purchase</S.ReturnLabel>
                  <S.ReturnValue>{returns.principal} KAIA</S.ReturnValue>
                </S.ReturnsRow>
                <S.ReturnsRow>
                  <S.ReturnLabel>Est. Earnings ({LOCK_DAYS} days)</S.ReturnLabel>
                  <S.ReturnValue>+{returns.earnings} KAIA</S.ReturnValue>
                </S.ReturnsRow>
                <S.ReturnsRow>
                  <S.ReturnLabel>Total After {LOCK_DAYS} Days</S.ReturnLabel>
                  <S.ReturnValue $large>{returns.total} KAIA</S.ReturnValue>
                </S.ReturnsRow>
              </S.ExpectedReturns>
            </S.PackageSection>

           
          </>
        );

      case 3:
        return (
          <S.SuccessContainer>
            <S.SuccessIcon>
              <CheckCircle size={40} color="white" />
            </S.SuccessIcon>
            <S.SuccessTitle>Payment Successful!</S.SuccessTitle>
            <S.SuccessMessage>
              Your purchase of {selectedPackage.amount} has been processed. 
              Your {selectedPackage.kaia} KAIA will be deposited shortly.
            </S.SuccessMessage>

            <S.UnlockDateBox>
              <S.UnlockLabel>Unlock Date</S.UnlockLabel>
              <S.UnlockDate>{getUnlockDate()}</S.UnlockDate>
            </S.UnlockDateBox>

            <S.TimelineBox>
              <S.TimelineTitle>What Happens Next</S.TimelineTitle>
              <S.TimelineStep>
                <S.TimelineNumber>1</S.TimelineNumber>
                <S.TimelineText>
                  <strong>Check Your Position</strong><br />
                  Tap the vault icon to view your active position
                </S.TimelineText>
              </S.TimelineStep>
              <S.TimelineStep>
                <S.TimelineNumber>2</S.TimelineNumber>
                <S.TimelineText>
                  <strong>Monitor AI-Managed Vault</strong><br />
                  Vault is managed by AI and can monitor its activity
                </S.TimelineText>
              </S.TimelineStep>
              <S.TimelineStep>
                <S.TimelineNumber>3</S.TimelineNumber>
                <S.TimelineText>
                  <strong>Withdraw to LINE Wallet</strong><br />
                  You can initiate a withdrawal request after the lockup
                </S.TimelineText>
              </S.TimelineStep>
              <S.TimelineStep>
                <S.TimelineNumber>4</S.TimelineNumber>
                <S.TimelineText>
                  <strong>AI Approval</strong><br />
                  The AI will process your request
                </S.TimelineText>
              </S.TimelineStep>
            </S.TimelineBox>

            {/* <S.InfoBanner $type="success">
              <CheckCircle size={16} />
              <div>
                You'll receive a notification when your KAIA is deposited and starts earning. 
                Track your position in the AI Boost section.
              </div>
            </S.InfoBanner> */}
          </S.SuccessContainer>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Starter Package">
      <S.Container>
        {currentStep < totalSteps && (
          <S.StepProgress>
            {Array.from({ length: totalSteps }, (_, i) => (
              <S.StepDot
                key={i}
                $active={i + 1 === currentStep}
                $completed={i + 1 < currentStep}
              />
            ))}
          </S.StepProgress>
        )}

        <S.StepContent>
          {error && (
            <S.ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </S.ErrorMessage>
          )}

          {renderStepContent()}
        </S.StepContent>

        {currentStep < totalSteps && (
          <S.NavigationContainer>
            {currentStep > 1 && (
              <S.NavButton onClick={handleBack} disabled={isTransacting}>
                Back
              </S.NavButton>
            )}
            <S.NavButton
              $primary
              disabled={!canProceed() || isTransacting}
              onClick={currentStep === 2 ? handlePayment : handleNext}
            >
              {currentStep === 2 ? (
                isTransacting ? (
                  'Processing...'
                ) : (
                  <>
                    Pay {selectedPackage.amount}
                  </>
                )
              ) : (
                <>
                  Get Started <ChevronRight size={16} />
                </>
              )}
            </S.NavButton>
          </S.NavigationContainer>
        )}

        {currentStep === totalSteps && (
          <S.NavigationContainer>
            <S.NavButton $primary onClick={onClose}>
              Close
            </S.NavButton>
          </S.NavigationContainer>
        )}
      </S.Container>
    </BaseModal>
  );
};
