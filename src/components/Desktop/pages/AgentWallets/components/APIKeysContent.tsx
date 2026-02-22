"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Check, Info, AlertTriangle } from 'react-feather';
import styled from 'styled-components';
import { AIWalletStatus } from '@/services/aiWalletService';
import { aiWalletService } from '@/services/aiWalletService';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import {
  ContentCard,
  CardHeader,
  CardTitle,
  Button,
  APIKeyItem,
  APIKeyInfo,
  APIKeyName,
  APIKeyDetails,
  KeyValue,
  KeyActions,
} from '../DesktopAgentWalletsV2Page.styles';

interface APIKeysContentProps {
  aiWalletData: AIWalletStatus | null;
  isLoadingAIWallet: boolean;
}

interface APIKeyData {
  apiKey: string | null;
  apiKeyGeneratedAt: string;
  aiWalletAddress: string;
}

const InfoBanner = styled.div`
  background: linear-gradient(135deg, #fef3c7, #fef9e7);
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CopyButton = styled.button`
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const RevealButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: color 0.2s;

  &:hover {
    color: #3b82f6;
  }
`;

export const APIKeysContent: React.FC<APIKeysContentProps> = ({ aiWalletData, isLoadingAIWallet }) => {
  const { account } = useWalletAccountStore();
  
  // State
  const [apiKeyData, setApiKeyData] = useState<APIKeyData | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch API key on mount
  useEffect(() => {
    if (account && aiWalletData?.aiWalletAddress) {
      fetchAPIKey();
    }
  }, [account, aiWalletData?.aiWalletAddress]);

  const fetchAPIKey = async () => {
    if (!account) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await aiWalletService.getAPIKey(account);
      
      if (response.apiKey) {
        setApiKeyData({
          apiKey: response.apiKey,
          apiKeyGeneratedAt: response.apiKeyGeneratedAt,
          aiWalletAddress: response.aiWalletAddress,
        });
      } else {
        setApiKeyData(null);
      }
    } catch (err: any) {
      // If 404, it just means no API key exists yet
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setApiKeyData(null);
      } else {
        setError(err.message || 'Failed to fetch API key');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAPIKey = async () => {
    if (!account) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await aiWalletService.createAPIKey(account);
      
      setApiKeyData({
        apiKey: response.apiKey,
        apiKeyGeneratedAt: response.apiKeyGeneratedAt,
        aiWalletAddress: response.aiWalletAddress,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeAPIKey = async () => {
    if (!account || !apiKeyData) return;

    setIsRevoking(true);
    setError(null);

    try {
      await aiWalletService.deleteAPIKey(account);
      
      // Clear the revoked key immediately - no storage needed
      setApiKeyData(null);
      setIsRevealed(false);
    } catch (err: any) {
      setError(err.message || 'Failed to revoke API key');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopyAPIKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleDateString('en-US', options);
  };

  const maskAPIKey = (key: string) => {
    if (key.length <= 10) return key;
    return `${key.slice(0, 8)}...${key.slice(-4)}`;
  };

  // Show loading state
  if (isLoadingAIWallet || isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '80px 40px',
        gap: '20px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #06C755',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading API keys...</p>
      </div>
    );
  }

  // Show state when no AI wallet exists
  if (!aiWalletData?.hasWallet) {
    return (
      <ContentCard>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '16px' }}>
            Please create an AI wallet first before managing API keys.
          </p>
        </div>
      </ContentCard>
    );
  }

  return (
    <>
      {/* Early Access Banner */}
      <InfoBanner>
        <Info size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
            Early Access: Limited to 1 API Key
          </div>
          <div style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.4 }}>
            During early access, each account is limited to 1 API key for security and quality assurance.
          </div>
        </div>
      </InfoBanner>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* API Key Card */}
      <ContentCard>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          {!apiKeyData && (
            <Button 
              $variant="primary" 
              onClick={handleCreateAPIKey}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create API Key'}
            </Button>
          )}
        </CardHeader>

        {apiKeyData ? (
          <APIKeyItem>
            <APIKeyInfo>
              <APIKeyName>Agent API Key</APIKeyName>
              <APIKeyDetails>
                <span>Created: {formatDateTime(apiKeyData.apiKeyGeneratedAt)}</span>
              </APIKeyDetails>
              <KeyValue 
                style={{
                  fontFamily: 'monospace',
                  fontSize: '15px',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                {isRevealed ? apiKeyData.apiKey : maskAPIKey(apiKeyData.apiKey!)}
                <RevealButton onClick={toggleReveal}>
                  {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
                </RevealButton>
              </KeyValue>
            </APIKeyInfo>
            <KeyActions style={{ flexDirection: 'column', gap: '8px' }}>
              <CopyButton onClick={() => handleCopyAPIKey(apiKeyData.apiKey!)}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </CopyButton>
              <Button 
                $variant="secondary" 
                style={{ padding: '6px 12px', fontSize: '13px' }}
                onClick={handleRevokeAPIKey}
                disabled={isRevoking}
              >
                {isRevoking ? 'Revoking...' : 'Revoke'}
              </Button>
            </KeyActions>
          </APIKeyItem>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b',
            fontSize: '14px'
          }}>
            No API key created yet. Click "Create API Key" to generate one.
          </div>
        )}
      </ContentCard>

      {/* API Usage Guide */}
      <ContentCard style={{ marginTop: '24px' }}>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
              fontSize: '12px',
              fontWeight: 700,
              flexShrink: 0
            }}>1</div>
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Test Your API Key</div>
              <div style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
                Check your wallet balance using the streaming API:
                <div style={{ 
                  background: '#1e293b', 
                  color: '#f8fafc', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  fontFamily: 'monospace', 
                  fontSize: '13px',
                  marginTop: '8px',
                  marginBottom: '8px',
                  overflowX: 'auto'
                }}>
                  curl -X POST "https://api.kilolend.xyz/stream" \<br/>
                  &nbsp;&nbsp;-H "Authorization: Bearer $YOUR_API_KEY" \<br/>
                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                  &nbsp;&nbsp;-d '&#123;'<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;"prompt": "Check my wallet balance",<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;"chain_id": 8217<br/>
                  &nbsp;&nbsp;'&#125;' \<br/>
                  &nbsp;&nbsp;--no-buffer
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
              fontSize: '12px',
              fontWeight: 700,
              flexShrink: 0
            }}>2</div>
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Get User Info</div>
              <div style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
                Verify your setup by retrieving your wallet addresses:
                <div style={{ 
                  background: '#1e293b', 
                  color: '#f8fafc', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  fontFamily: 'monospace', 
                  fontSize: '13px',
                  marginTop: '8px',
                  marginBottom: '8px'
                }}>
                  curl -X GET "https://api.kilolend.xyz/user-info" \<br/>
                  &nbsp;&nbsp;-H "Authorization: Bearer $YOUR_API_KEY"
                </div>
                This returns your user address and AI wallet address.
              </div>
            </div>
          </div>
        </div>
      </ContentCard>
    </>
  );
};