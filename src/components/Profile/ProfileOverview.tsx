import styled from 'styled-components';
import Blockies from 'react-blockies';

interface LineProfile {
  displayName: string;
  pictureUrl: string;
  userId: string;
}

interface ProfileOverviewProps {
  lineProfile: LineProfile | null;
  account: string | null;
  totalUSDValue: number;
  onProfileClick: () => void;
}

const ProfileSection = styled.div<{ $clickable?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 24px; 
  margin-bottom: 24px;
  margin-top: -8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: all 0.2s;

  ${({ $clickable }) => $clickable && `
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border-color: #cbd5e1;
    }
  `}

  @media (max-width: 480px) {
    padding: 20px;
    margin-bottom: 20px;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px; 

  @media (max-width: 480px) {
    gap: 12px; 
  }
`;

const ProfileAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00C300, #00A000);

  @media (max-width: 480px) {
    width: 56px;
    height: 56px;
  }
`;

const LineProfilePicture = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const OverviewContainer = styled.div`
  display: flex;
  gap: 12px; 

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftSection = styled.div`
  width: 320px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const RightSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const WalletAddress = styled.div<{ $clickable?: boolean }>`
  font-family: monospace;
  font-size: 14px;
  color: #64748b;
  word-break: break-all;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const TotalBalanceSection = styled.div`
  text-align: center;
  padding-bottom: 3px;
`;

const TotalBalanceLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
`;

const TotalBalanceValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  lineProfile,
  account,
  totalUSDValue,
  onProfileClick
}) => {
  return (
    <OverviewContainer>
      <LeftSection> 
          <ProfileSection
            $clickable={!!account}
            onClick={onProfileClick}
            title={account ? "Click to view wallet address and QR code" : ""}
          >
            <ProfileHeader>
              <ProfileAvatar>
                {lineProfile?.pictureUrl ? (
                  <LineProfilePicture src={lineProfile.pictureUrl} alt="Profile" />
                ) : (
                  <Blockies seed={account || "1234"} size={8} scale={8} />
                )}
              </ProfileAvatar>
              <ProfileInfo>
                <ProfileName>
                  {lineProfile?.displayName || "Wallet User"}
                </ProfileName>
                <WalletAddress>
                  Click to open details
                </WalletAddress>
              </ProfileInfo>
            </ProfileHeader>
          </ProfileSection> 
      </LeftSection> 
        <RightSection>
          <ProfileSection>
            <TotalBalanceSection>
              <TotalBalanceLabel>Total Value</TotalBalanceLabel>
              <TotalBalanceValue>
                ${totalUSDValue.toFixed(2)}
              </TotalBalanceValue>
            </TotalBalanceSection>
          </ProfileSection>
        </RightSection> 
    </OverviewContainer>
  );
};
