'use client';

import styled from 'styled-components';
import { DesktopBaseModal } from '../shared/DesktopBaseModal';
import { useAppStore } from '@/stores/appStore';
import { APP_VERSION, LINE_LIFF_URL } from '@/config/version';
import QRCode from 'react-qr-code';
import { ExternalLink, Monitor, Settings } from 'react-feather';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border-radius: 8px;
  color: #64748b;
`;

const SettingItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SettingLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const GasLimitSelector = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const GasOption = styled.button<{ $active: boolean }>`
  padding: 12px 20px;
  border: 2px solid ${({ $active }) => ($active ? '#06C755' : '#e2e8f0')};
  background: ${({ $active }) => ($active ? '#06C755' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#374151')};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;

  &:hover {
    background: ${({ $active }) => ($active ? '#05b648' : '#f8fafc')};
    border-color: ${({ $active }) => ($active ? '#05b648' : '#cbd5e1')};
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #64748b;
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: #1e293b;
  font-weight: 600;
`;

const VersionTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: linear-gradient(135deg, #06C755, #05b648);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const DesktopBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const QRSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
`;

const QRContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const QRTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: center;
`;

const QRDescription = styled.div`
  font-size: 12px;
  color: #64748b;
  text-align: center;
  line-height: 1.4;
`;

const OpenLineButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: #06C755;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #05b648;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export interface DesktopSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopSettingsModal = ({ isOpen, onClose }: DesktopSettingsModalProps) => {
  const { gasLimit, setGasLimit } = useAppStore();
  const gasOptions = [300000, 600000, 900000];

  const handleGasLimitChange = (newGasLimit: number) => {
    setGasLimit(newGasLimit);
  };

  return (
    <DesktopBaseModal isOpen={isOpen} onClose={onClose} title="Settings">
      <SettingsContainer>
        <Section>
          {/* <SectionTitle>
            <SectionIcon>
              <Settings size={18} />
            </SectionIcon>
            Transaction Settings
          </SectionTitle> */}
          <SettingItem>
            <SettingLabel>Gas Limit</SettingLabel>
            <GasLimitSelector>
              {gasOptions.map((option) => (
                <GasOption
                  key={option}
                  $active={gasLimit === option}
                  onClick={() => handleGasLimitChange(option)}
                >
                  {option.toLocaleString()}
                </GasOption>
              ))}
            </GasLimitSelector>
          </SettingItem>
        </Section>

        <Section>
          {/* <SectionTitle>
            <SectionIcon>
              <Monitor size={18} />
            </SectionIcon>
            App Information
          </SectionTitle> */}
          <InfoRow>
            <InfoLabel>DApp Version</InfoLabel>
            <InfoValue>
              <VersionTag>v{APP_VERSION}</VersionTag>
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Platform</InfoLabel>
            <InfoValue>
              <DesktopBadge>
                <Monitor size={14} />
                Desktop Version
              </DesktopBadge>
            </InfoValue>
          </InfoRow>
        </Section>

        <Section>
          <SectionTitle> 
            LINE Mini DApp
          </SectionTitle>
          <QRSection>
            <QRTitle>Scan to access LINE Mini DApp</QRTitle> 
            <QRContainer>
              <QRCode 
                value={LINE_LIFF_URL} 
                size={180}
                level="M"
              />
            </QRContainer>
            <OpenLineButton
              href={LINE_LIFF_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={16} />
              Open in LINE
            </OpenLineButton>
          </QRSection>
        </Section>
      </SettingsContainer>
    </DesktopBaseModal>
  );
};
