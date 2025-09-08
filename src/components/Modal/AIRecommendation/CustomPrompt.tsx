'use client';

import React from 'react';
import styled from 'styled-components';
import { Edit3, Eye, Zap, AlertCircle } from 'react-feather';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

const PromptPreview = styled.div`
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  position: relative;
`;

const PromptLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
`;

const PromptText = styled.div`
  font-size: 14px;
  color: #1e293b;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const EditButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #06C755;
    color: #06C755;
    background: #f0fdf4;
  }
`;

const PromptEditor = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  
  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const CharacterCount = styled.div<{ $warning: boolean }>`
  font-size: 11px;
  color: ${props => props.$warning ? '#ef4444' : '#94a3b8'};
  text-align: right;
  margin-top: 4px;
`;

const AnalysisPreview = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const AnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0369a1;
  margin-bottom: 12px;
`;

const AnalysisPoints = styled.div`
  display: grid;
  gap: 8px;
`;

const AnalysisPoint = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #0c4a6e;
`;

const PointIcon = styled.div`
  color: #0ea5e9;
  margin-top: 2px;
`;

const SubmitButton = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #06C755, #05b648);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(6, 199, 85, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  display: flex;
  align-items: center;
  padding: 16px; 
  margin-left: auto;
  margin-right: auto;

  gap: 8px;
  color: #06C755; /* LINE green */
  font-weight: 600;
  font-size: 16px;
`;

const GreenSpinner = styled(LoadingSpinner)`
  border: 2px solid rgba(6, 199, 85, 0.3);
  border-top: 2px solid #06C755;
`;

const WarningMessage = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #92400e;
`;

interface CustomPromptProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export const AICustomPrompt: React.FC<CustomPromptProps> = ({
  prompt,
  onPromptChange,
  isLoading,
  onSubmit
}) => {
  const [isEditing, setIsEditing] = React.useState(false);

  const maxLength = 500;
  const isOverLimit = prompt.length > maxLength;
  const isEmpty = prompt.trim().length === 0;

  const analysisPoints = [
    "Current market conditions and APY rates",
    "Your existing portfolio and positions",
    "Risk assessment and diversification",
    "Optimal asset allocation strategies",
    "Liquidity and withdrawal considerations"
  ];

  if (isEmpty) {
    return (
      <Container>
        <Header>
          <Title>Review Your Strategy Prompt</Title>
          <Subtitle>
            Please go back and select a template or write a custom prompt
          </Subtitle>
        </Header>

        <WarningMessage>
          <AlertCircle size={16} />
          No strategy prompt has been provided. Please return to the previous step.
        </WarningMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Review & Submit for Analysis</Title>
        <Subtitle>
          Review your strategy prompt below. Our AI will analyze market data to provide personalized recommendations.
        </Subtitle>
      </Header>

      {isEditing ? (
        <>
          <PromptLabel>
            <Edit3 size={16} />
            Edit Your Prompt
          </PromptLabel>
          <PromptEditor
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe your DeFi goals and preferences..."
          />
          <CharacterCount $warning={isOverLimit}>
            {prompt.length}/{maxLength} characters
            {isOverLimit && ' (too long)'}
          </CharacterCount>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: '8px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isOverLimit}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                background: '#06C755',
                color: 'white',
                cursor: 'pointer',
                opacity: isOverLimit ? 0.5 : 1
              }}
            >
              Save Changes
            </button>
          </div>
        </>
      ) : (
        <>
          <PromptPreview>
            <PromptLabel>
              <Eye size={16} />
              Your Prompt
            </PromptLabel>
            <PromptText>{prompt}</PromptText>
            <EditButton onClick={() => setIsEditing(true)}>
              <Edit3 size={16} />
            </EditButton>
          </PromptPreview>

          {/* <AnalysisPreview>
            <AnalysisHeader>
              <Zap size={16} />
              AI Analysis Will Include
            </AnalysisHeader>
            <AnalysisPoints>
              {analysisPoints.map((point, index) => (
                <AnalysisPoint key={index}>
                  <PointIcon>•</PointIcon>
                  {point}
                </AnalysisPoint>
              ))}
            </AnalysisPoints>
          </AnalysisPreview> */}

          {isOverLimit && (
            <WarningMessage>
              <AlertCircle size={16} />
              Your prompt is too long. Please edit it to under {maxLength} characters.
            </WarningMessage>
          )}

          {isLoading && (
            <div style={{display:"flex"}}>
               <LoadingText>
              <GreenSpinner />
              Analyzing Market & Strategy...
            </LoadingText>
            </div>
           
          )}

        </>
      )}
    </Container>
  );
};