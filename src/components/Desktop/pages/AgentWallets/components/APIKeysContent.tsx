"use client";

import React, { useState } from 'react';
import { AIWalletStatus } from '@/services/aiWalletService';
import {
  ContentCard,
  CardHeader,
  CardTitle,
  Button,
  APIKeyItem,
  APIKeyInfo,
  APIKeyName,
  APIKeyDetails,
  APIKeyBadge,
  KeyValue,
  KeyActions,
  FormContainer,
  FormGroup,
  FormLabel,
  FormInput,
} from '../DesktopAgentWalletsV2Page.styles';

interface APIKeysContentProps {
  aiWalletData: AIWalletStatus | null;
  isLoadingAIWallet: boolean;
}

const MOCK_API_KEYS = [
  {
    id: 1,
    name: 'Production API',
    key: 'kilo_prod_7f8a3d2e... (hidden)',
    permissions: 'Full Access',
    created: '2024-02-10',
    lastUsed: '2 hours ago',
  },
  {
    id: 2,
    name: 'Trading Bot',
    key: 'kilo_bot_9b1c4e5f... (hidden)',
    permissions: 'Trade Only',
    created: '2024-02-05',
    lastUsed: '1 day ago',
  },
];

export const APIKeysContent: React.FC<APIKeysContentProps> = ({ aiWalletData, isLoadingAIWallet }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock create action
    alert(`Creating new API key: ${newKeyName}`);
    setShowCreateForm(false);
    setNewKeyName('');
  };

  return (
    <>
      <ContentCard>
        <CardHeader>
          <CardTitle>API Keys Management</CardTitle>
          <Button $variant="primary" onClick={() => setShowCreateForm(true)}>
            Create New Key
          </Button>
        </CardHeader>
        <p style={{ color: '#64748b', lineHeight: 1.6 }}>
          Manage API keys for programmatic access to your AI wallet and trading operations.
        </p>
      </ContentCard>

      {showCreateForm && (
        <ContentCard>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
          </CardHeader>
          <FormContainer onSubmit={handleCreate}>
            <FormGroup>
              <FormLabel>API Key Name</FormLabel>
              <FormInput
                type="text"
                value={newKeyName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKeyName(e.target.value)}
                placeholder="e.g., My Trading Bot"
              />
            </FormGroup>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Button type="button" $variant="secondary" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button type="submit" $variant="primary">
                Create Key
              </Button>
            </div>
          </FormContainer>
        </ContentCard>
      )}

      {MOCK_API_KEYS.map((apiKey) => (
        <APIKeyItem key={apiKey.id}>
          <APIKeyInfo>
            <APIKeyName>{apiKey.name}</APIKeyName>
            <APIKeyDetails>
              <span>Created: {apiKey.created}</span>
              <span> • </span>
              <span>Last used: {apiKey.lastUsed}</span>
            </APIKeyDetails>
            <KeyValue>{apiKey.key}</KeyValue>
            <APIKeyBadge>{apiKey.permissions}</APIKeyBadge>
          </APIKeyInfo>
          <KeyActions>
            <Button $variant="secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              Revoke
            </Button>
          </KeyActions>
        </APIKeyItem>
      ))}

      <ContentCard style={{ marginTop: '24px' }}>
        <CardHeader>
          <CardTitle>API Key Usage Summary</CardTitle>
        </CardHeader>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Active Keys</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#06C755' }}>
              {MOCK_API_KEYS.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>API Calls (24h)</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>
              1,247
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Success Rate</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#06C755' }}>
              99.8%
            </div>
          </div>
        </div>
      </ContentCard>
    </>
  );
};