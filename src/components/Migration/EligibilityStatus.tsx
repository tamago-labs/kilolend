'use client';

import styled from 'styled-components';
import { CheckCircle, XCircle, Clock, Gift } from 'react-feather';

const Container = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;
  margin-bottom: 100px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
`;

const StatusCard = styled.div<{ $eligible: boolean }>`
  background: white;
  border: 2px solid ${({ $eligible }) => $eligible ? '#06C755' : '#ef4444'};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

const StatusIcon = styled.div<{ $eligible: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ $eligible }) => $eligible ? '#dcfce7' : '#fef2f2'};
  color: ${({ $eligible }) => $eligible ? '#06C755' : '#ef4444'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
`;

const StatusTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const StatusDescription = styled.div`
  font-size: 14px;
  color: #64748b;
  line-height: 1.4;
`;

const BonusSection = styled.div<{ $eligible: boolean }>`
  background: ${({ $eligible }) => $eligible ? '#dcfce7' : '#f1f5f9'};
  border: 2px solid ${({ $eligible }) => $eligible ? '#06C755' : '#cbd5e1'};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BonusIcon = styled.div<{ $eligible: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ $eligible }) => $eligible ? '#06C755' : '#94a3b8'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const BonusContent = styled.div`
  flex: 1;
`;

const BonusTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const BonusDescription = styled.div`
  font-size: 14px;
  color: #64748b;
  line-height: 1.4;
`;

const ClaimButton = styled.button<{ $eligible: boolean }>`
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
  white-space: nowrap;

  ${({ $eligible }) => $eligible ? `
    background: linear-gradient(135deg, #06C755 0%, #059212 100%);
    color: white;
    border-color: #06C755;
    
    &:hover {
      background: linear-gradient(135deg, #059212 0%, #047857 100%);
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
    color: #94a3b8;
    border-color: #cbd5e1;
    cursor: not-allowed;
  `}
`;

interface EligibilityStatusProps {
  hackathonEligible: boolean;
  v1Eligible: boolean;
  bonusClaimed: boolean;
  onClaimBonus?: () => void;
  isClaimingBonus?: boolean;
}

export const EligibilityStatus = ({
  hackathonEligible,
  v1Eligible,
  bonusClaimed,
  onClaimBonus,
  isClaimingBonus = false
}: EligibilityStatusProps) => {
  const canClaimBonus = hackathonEligible && v1Eligible && !bonusClaimed;

  return (
    <Container>
      <Title> 
        Bonus Eligibility Status
      </Title>

      <StatusGrid>
        <StatusCard $eligible={hackathonEligible}>
          <StatusIcon $eligible={hackathonEligible}>
            {hackathonEligible ? <CheckCircle size={24} /> : <XCircle size={24} />}
          </StatusIcon>
          <StatusTitle>Hackathon Version</StatusTitle>
          <StatusDescription>
            {hackathonEligible 
              ? 'You are eligible for migration from hackathon version'
              : 'No positions found in hackathon version'
            }
          </StatusDescription>
        </StatusCard>

        <StatusCard $eligible={v1Eligible}>
          <StatusIcon $eligible={v1Eligible}>
            {v1Eligible ? <CheckCircle size={24} /> : <XCircle size={24} />}
          </StatusIcon>
          <StatusTitle>V1 Version</StatusTitle>
          <StatusDescription>
            {v1Eligible 
              ? 'You have successfully migrated to V1'
              : 'Complete migration to V1 to unlock benefits'
            }
          </StatusDescription>
        </StatusCard>
      </StatusGrid>

      <BonusSection $eligible={canClaimBonus}>
        <BonusIcon $eligible={canClaimBonus}>
          {bonusClaimed ? <CheckCircle size={24} /> : <Gift size={24} />}
        </BonusIcon>
        <BonusContent>
          <BonusTitle>100 KAIA Migration Bonus</BonusTitle>
          <BonusDescription>
            {bonusClaimed 
              ? 'You have successfully claimed your migration bonus!'
              : canClaimBonus
                ? 'Complete your migration and claim 100 KAIA as a reward!'
                : hackathonEligible && !v1Eligible
                  ? 'Migrate your assets to V1 to claim the bonus'
                  : 'Complete both hackathon and V1 requirements to claim bonus'
            }
          </BonusDescription>
        </BonusContent>
        <ClaimButton
          $eligible={canClaimBonus}
          onClick={canClaimBonus ? onClaimBonus : undefined}
          disabled={!canClaimBonus || isClaimingBonus}
        >
          {isClaimingBonus ? (
            <>
              <Clock size={16} style={{ marginRight: '8px' }} />
              Claiming...
            </>
          ) : bonusClaimed ? (
            <>
              <CheckCircle size={16} style={{ marginRight: '8px' }} />
              Claimed
            </>
          ) : canClaimBonus ? (
            <>
              <Gift size={16} style={{ marginRight: '8px' }} />
              Claim 100 KAIA
            </>
          ) : (
            'Not Available'
          )}
        </ClaimButton>
      </BonusSection>
    </Container>
  );
};
