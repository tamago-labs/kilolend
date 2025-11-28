import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 600px;
  max-height: 80vh; 
`;

export const StepContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column; 
  overflow-y: auto;
`;

export const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px; 
  margin-top: 24px;
`;

export const StepDot = styled.div<{ $active?: boolean; $completed?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active, $completed }) => 
    $active ? '#06C755' : 
    $completed ? '#06C755' : '#e2e8f0'
  };
  transition: all 0.2s;
`;

export const StepTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  text-align: center;
`;

export const StepSubtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 32px;
  text-align: center;
  line-height: 1.4;
`;

// Character Selection Styles
export const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

export const CharacterCard = styled.div<{ $selected?: boolean }>`
  background: white;
  border: 2px solid ${({ $selected }) => $selected ? '#06C755' : '#e2e8f0'};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    border-color: #06C755;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  ${({ $selected }) => $selected && `
    background: #f0fdf4;
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.15);
  `}
`;

export const CharacterAvatar = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
`;

export const CharacterAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const CharacterName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

export const CharacterDescription = styled.p`
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
`;

export const CharacterBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 12px;
`;

export const Badge = styled.span`
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
`;

// Model Selection Styles
export const ModelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

export const ModelCard = styled.div<{ $selected?: boolean }>`
  background: white;
  border: 2px solid ${({ $selected }) => $selected ? '#06C755' : '#e2e8f0'};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #06C755;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  ${({ $selected }) => $selected && `
    background: #f0fdf4;
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.15);
  `}
`;

export const ModelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

export const ModelIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
`;

export const ModelIconImage = styled.img`
  width: 80%;
  height: 80%;
  object-fit: contain;
`;

export const ModelInfo = styled.div`
  flex: 1;
`;

export const ModelName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

export const ModelProvider = styled.p`
  font-size: 12px;
  color: #64748b;
`;

export const ModelDescription = styled.p`
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 12px;
`;

export const RiskBadge = styled.span<{ $risk: 'aggressive' | 'conservative' }>`
  background: ${({ $risk }) => $risk === 'aggressive' ? '#fef2f2' : '#f0fdf4'};
  color: ${({ $risk }) => $risk === 'aggressive' ? '#dc2626' : '#06C755'};
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid ${({ $risk }) => $risk === 'aggressive' ? '#fecaca' : '#bbf7d0'};
`;

// Review Step Styles
export const ReviewContainer = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

export const ReviewSection = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const ReviewLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

export const ReviewValue = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ReviewCharacter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ReviewModel = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

// Chat Interface Styles
export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const ChatHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
`;

export const ChatTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

export const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8fafc;
`;

export const Message = styled.div<{ $isUser?: boolean }>`
  margin-bottom: 16px;
  display: flex;
  justify-content: ${({ $isUser }) => $isUser ? 'flex-end' : 'flex-start'};
`;

export const MessageBubble = styled.div<{ $isUser?: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${({ $isUser }) => $isUser ? '#06C755' : 'white'};
  color: ${({ $isUser }) => $isUser ? 'white' : '#1e293b'};
  border: 1px solid ${({ $isUser }) =>  $isUser ? 'transparent' : '#e2e8f0'};
`;

export const ChatInputContainer = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: white;
`;

export const ChatInputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const ChatInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }
`;

export const SendButton = styled.button`
  padding: 12px 20px;
  background: #06C755;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #05a047;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const DeleteButton = styled.button`
  padding: 12px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;

  &:hover {
    background: #b91c1c;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Common Button Styles
export const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${({ $variant }) => $variant === 'primary' ? `
    background: #06C755;
    color: white;

    &:hover {
      background: #05a047;
      transform: translateY(-1px);
    }
  ` : `
    background: #f8fafc;
    color: #64748b;
    border: 1px solid #e2e8f0;

    &:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const InfoBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;

  strong {
    color: #1e293b;
  }

  ul {
    margin: 8px 0 0 0;
    padding-left: 16px;
  }

  li {
    margin-bottom: 4px;
  }
`;
