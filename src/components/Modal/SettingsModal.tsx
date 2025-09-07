'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { BaseModal } from './BaseModal';
import { useAppStore } from '@/stores/appStore';
import { liff } from "@/utils/liff";

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
`;

const SettingLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const SettingValue = styled.div`
  font-size: 14px;
  color: #6b7280;
  text-align: right;
  flex: 1;
  margin-left: 16px;
`;

const GasLimitSelector = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const GasOption = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ $active }) => ($active ? '#06C755' : '#e2e8f0')};
  background: ${({ $active }) => ($active ? '#06C755' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#374151')};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $active }) => ($active ? '#05b648' : '#f8fafc')};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
`;

const InfoLabel = styled.span`
  color: #6b7280;
`;

const InfoValue = styled.span`
  color: #374151;
  font-weight: 500;
`;

const OpenLineButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: #06C755;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  margin-top: 16px;

  &:hover {
    background: #05b648;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ModeTag = styled.span<{ $isLine: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: ${({ $isLine }) => ($isLine ? '#06C755' : '#f1f5f9')};
  color: ${({ $isLine }) => ($isLine ? '#ffffff' : '#64748b')};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { gasLimit, setGasLimit } = useAppStore();
  const [lineInfo, setLineInfo] = useState<{
    isLineConnected: boolean;
    lineVersion?: string;
    liffVersion?: string;
    os?: string;
  }>({ isLineConnected: false });

  const gasOptions = [300000, 600000, 1000000];

  useEffect(() => {
    const checkLineStatus = async () => {
      try {

        if (liff.isInClient()) {
          setLineInfo({
            isLineConnected: true,
            lineVersion: liff.getLineVersion() || "Unknown",
            liffVersion: liff.getVersion(),
            os: liff.getOS()
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
    }
  }, [isOpen]);

  const handleGasLimitChange = (newGasLimit: number) => {
    setGasLimit(newGasLimit);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Settings">
      <SettingsContainer>
        <Section>
          {/* <SectionTitle>Transaction Settings</SectionTitle> */}
          <SettingItem>
            <SettingLabel>Gas Limit</SettingLabel>
          </SettingItem>
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
        </Section>

        <Section>
          {/* <SectionTitle>Application Info</SectionTitle> */}
          <InfoRow>
            <InfoLabel>DApp Version</InfoLabel>
            <InfoValue>0.2.0</InfoValue>
          </InfoRow>
          {/* <InfoRow>
            <InfoLabel>Support Email</InfoLabel>
            <InfoValue>support@tamagolabs.com</InfoValue>
          </InfoRow> */}
          <InfoRow>
            <InfoLabel>Access Mode</InfoLabel>
            <InfoValue>
              <ModeTag $isLine={lineInfo.isLineConnected}>
                {lineInfo.isLineConnected ? 'LINE Mini DApp' : 'Web Access'}
              </ModeTag>
            </InfoValue>
          </InfoRow>
        </Section>

        {lineInfo.isLineConnected ? (
          <Section>
            {/* <SectionTitle>LINE Environment</SectionTitle> */}
            {lineInfo.lineVersion && (
              <InfoRow>
                <InfoLabel>LINE Version</InfoLabel>
                <InfoValue>{lineInfo.lineVersion}</InfoValue>
              </InfoRow>
            )}
            {lineInfo.liffVersion && (
              <InfoRow>
                <InfoLabel>LIFF Version</InfoLabel>
                <InfoValue>{lineInfo.liffVersion}</InfoValue>
              </InfoRow>
            )}
            {lineInfo.os && (
              <InfoRow>
                <InfoLabel>Operating System</InfoLabel>
                <InfoValue>{lineInfo.os}</InfoValue>
              </InfoRow>
            )}
          </Section>
        ) : (
          <Section>
            {/* <SectionTitle>LINE Integration</SectionTitle> */}
            <InfoRow>
              <InfoLabel>Status</InfoLabel>
              <InfoValue>Not connected to LINE</InfoValue>
            </InfoRow>
            <OpenLineButton
              href="https://liff.line.me/2007932254-AVnKMMp9"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in LINE
            </OpenLineButton>
          </Section>
        )}
      </SettingsContainer>
    </BaseModal>
  );
};
