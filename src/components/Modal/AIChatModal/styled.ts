import styled from 'styled-components';


// Main modal container
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100vh - 120px);
  min-height: 500px;
`;

// Step progress indicator
export const StepProgress = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
  padding: 0 20px;
`;

export const StepDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active, $completed }) =>
    $completed ? '#06C755' : $active ? '#06C755' : '#e2e8f0'};
  margin: 0 4px;
  transition: all 0.3s ease;
`;

// Step content area
export const StepContent = styled.div`
  flex: 1;
  padding: 0 4px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

// Error message
export const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '⚠️';
    font-size: 16px;
  }
`;

// Agent Selection Components
export const AgentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

export const AgentCard = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid ${({ $selected }) => ($selected ? '#06C755' : '#e2e8f0')};
  border-radius: 12px;
  background: ${({ $selected }) => ($selected ? '#f0fdf4' : 'white')};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;

  &:hover {
    border-color: #06C755;
    background: #f0fdf4;
    transform: translateY(-1px);
  }
`;

export const AgentAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden; /* ensures image is clipped to circle */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #06C755, #05b648);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* fills parent, maintaining aspect ratio, crops if necessary */
  }
`;

export const AgentInfo = styled.div`
  flex: 1;
`;

export const AgentName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
`;

export const AgentDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

export const AgentPersonality = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #06C755;
  font-weight: 500;
`;

export const AgentBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: rgba(6, 199, 85, 0.1);
  color: #06C755;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid rgba(6, 199, 85, 0.2);
  white-space: nowrap;
`;

export const CustomSection = styled.div`
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
  margin-top: 24px;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

export const CustomPromptInput = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

// Confirmation Step Components
export const ConfirmationContainer = styled.div`
  padding: 20px 0;
`;

export const SelectedAgentCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

export const ConfirmationTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  text-align: center;
`;

export const SelectedAgentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

export const SystemPromptPreview = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
  max-height: 150px;
  overflow-y: auto;
`;

export const NavigationContainer = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  margin-top: auto;
`;

export const NavButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;

  ${({ $primary }) =>
    $primary
      ? `
    background: #06C755;
    color: white;
    border-color: #06C755;

    &:hover {
      background: #059212;
      border-color: #059212;
      transform: translateY(-1px);
    }

    &:disabled {
      background: #94a3b8;
      border-color: #94a3b8;
      cursor: not-allowed;
      transform: none;
    }
  `
      : `
    background: white;
    color: #64748b;
    border-color: #e2e8f0;

    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  `}
`;

// Chat Step Components
export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100vh - 200px);
`;

export const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 8px 8px 0 0;
  margin-bottom: 16px;
`;

export const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 4px 0;
  min-height: 350px;
  max-height: 450px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`;

export const MessageBubble = styled.div<{ $isUser: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  flex-direction: ${({ $isUser }) => ($isUser ? 'row-reverse' : 'row')};
`;

export const MessageAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #06C755;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const MessageContent = styled.div<{ $isUser: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  background: ${({ $isUser }) => ($isUser ? '#06C755' : '#f1f5f9')};
  color: ${({ $isUser }) => ($isUser ? 'white' : '#374151')};
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
`;

export const ChatInputContainer = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  margin-top: 16px;
`;

export const ChatInput = styled.input`
  flex: 1;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s ease;
  height: 56px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #06C755;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

export const SendButton = styled.button<{ $disabled?: boolean }>`
  
  width: 56px;
  height: 56px;
  border: none;
  background: ${({ $disabled }) => ($disabled ? '#94a3b8' : '#06C755')};
  color: white;
  border-radius: 16px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;

  &:hover:not(:disabled) {
    background: #059212;
    transform: scale(1.05);
  }
`;

export const ChatActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

export const ActionButton = styled.button<{ $variant?: 'secondary' }>`
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
  flex: 1;

  ${({ $variant }) =>
    $variant === 'secondary'
      ? `
    background: white;
    color: #64748b;
    border-color: #e2e8f0;

    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  `
      : `
    background: #06C755;
    color: white;
    border-color: #06C755;

    &:hover {
      background: #059212;
      border-color: #059212;
      transform: translateY(-1px);
    }
  `}
`;

export const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 16px;
  margin-bottom: 16px;
  color: #64748b;
  font-size: 14px;

  &::after {
    content: '';
    display: inline-flex;
    gap: 2px;
  }

  &::before {
    content: '●●●';
    animation: typing 1.5s infinite;
  }

  @keyframes typing {
    0%, 60%, 100% { opacity: 0.3; }
    30% { opacity: 1; }
  }
`;

export const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #f1f5f9;
  border-top: 2px solid #06C755;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Additional components for Phase 3 features
export const NavigationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

export const ChatCounter = styled.div`
  font-size: 12px;
  text-align: center;
  margin-bottom: 8px;
  transition: color 0.2s ease;
`;

export const StopButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  min-width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  font-weight: 600;
  
  &:hover {
    background: #dc2626;
    transform: scale(1.05);
  }
`;

export const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  width: 100%;
`;

export const LimitWarning = styled.div`
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: #f59e0b;
  
  strong {
    display: block;
    margin-bottom: 8px;
  }
  
  p {
    margin: 8px 0;
    font-size: 14px;
  }
`;

export const InfoBox = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  
  .info-title {
    font-size: 12px;
    color: #3b82f6;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    
    strong {
      font-weight: 600;
    }
  }
  
  ul {
    font-size: 12px;
    color: #3b82f6;
    margin: 0;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 4px;
  }
`;

export const AgentSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;