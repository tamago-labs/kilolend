"use client";

import React, { useState } from 'react';
import { AIWalletStatus } from '@/services/aiWalletService';
import {
  ContentCard,
  CardHeader,
  CardTitle,
  FormContainer,
  FormGroup,
  FormLabel,
  FormInput,
  Button,
  SecurityItem,
  SecurityInfo,
  SecurityLabel,
  SecurityDescription,
  Toggle,
  ToggleSwitch,
  ToggleKnob,
  ToggleInput,
} from '../DesktopAgentWalletsV2Page.styles';

interface SecurityLimitsContentProps {
  aiWalletData: AIWalletStatus | null;
  isLoadingAIWallet: boolean;
}

const MOCK_SECURITY_SETTINGS = [
  {
    id: 1,
    label: 'Two-Factor Authentication',
    description: 'Require 2FA for sensitive operations',
    enabled: true,
  },
  {
    id: 2,
    label: 'Daily Withdrawal Limit',
    description: 'Maximum amount that can be withdrawn per day',
    enabled: true,
    limit: '10000',
  },
  {
    id: 3,
    label: 'Auto-Stop on Loss',
    description: 'Automatically stop trading if loss exceeds threshold',
    enabled: true,
    limit: '5000',
  },
  {
    id: 4,
    label: 'Whitelist Mode',
    description: 'Only allow operations with whitelisted addresses',
    enabled: false,
  },
  {
    id: 5,
    label: 'Transaction Notifications',
    description: 'Receive notifications for all transactions',
    enabled: true,
  },
];

export const SecurityLimitsContent: React.FC<SecurityLimitsContentProps> = ({ aiWalletData, isLoadingAIWallet }) => {
  const [settings, setSettings] = useState(MOCK_SECURITY_SETTINGS);

  const handleToggle = (id: number) => {
    setSettings(settings.map(setting =>
      setting.id === id
        ? { ...setting, enabled: !setting.enabled }
        : setting
    ));
  };

  const handleLimitChange = (id: number, value: string) => {
    setSettings(settings.map(setting =>
      setting.id === id
        ? { ...setting, limit: value }
        : setting
    ));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Security settings saved successfully!');
  };

  return (
    <>
      <ContentCard>
        <CardHeader>
          <CardTitle>Security & Limits</CardTitle>
        </CardHeader>
        <p style={{ color: '#64748b', lineHeight: 1.6 }}>
          Configure security settings and trading limits to protect your AI wallet and manage risk.
        </p>
      </ContentCard>

      <FormContainer onSubmit={handleSave}>
        {settings.map((setting) => (
          <SecurityItem key={setting.id}>
            <SecurityInfo>
              <SecurityLabel>{setting.label}</SecurityLabel>
              <SecurityDescription>{setting.description}</SecurityDescription>
              {setting.limit !== undefined && setting.enabled && (
                <div style={{ marginTop: '12px' }}>
                  <FormLabel>Limit (USD)</FormLabel>
                  <FormInput
                    type="number"
                    value={setting.limit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLimitChange(setting.id, e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}
            </SecurityInfo>
            <Toggle $checked={setting.enabled}>
              <ToggleInput
                type="checkbox"
                checked={setting.enabled}
                onChange={() => handleToggle(setting.id)}
              />
              <ToggleSwitch $checked={setting.enabled}>
                <ToggleKnob $checked={setting.enabled} />
              </ToggleSwitch>
            </Toggle>
          </SecurityItem>
        ))}

        <ContentCard style={{ marginTop: '24px' }}>
          <CardHeader>
            <CardTitle>Risk Management Summary</CardTitle>
          </CardHeader>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Daily Limit</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>
                $10,000
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Stop Loss</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>
                $5,000
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Security Level</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#06C755' }}>
                High
              </div>
            </div>
          </div>
        </ContentCard>

        <Button type="submit" $variant="primary" style={{ marginTop: '24px', width: '100%' }}>
          Save Settings
        </Button>
      </FormContainer>
    </>
  );
};