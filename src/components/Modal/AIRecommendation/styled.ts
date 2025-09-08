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
  
  /* Custom scrollbar */
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

// Navigation container
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

// Legacy styled components for compatibility
export const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100vh - 120px);
`;

export const InputSection = styled.div`
  padding: 0 0 20px 0;
  border-bottom: 1px solid #e2e8f0;
`;

export const PromptInput = styled.textarea`
  width: 100%; 
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

export const TemplatesSection = styled.div`
  margin-top: 16px;
`;

export const TemplatesLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
`;

export const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  overflow-y: scroll;
  max-height: 300px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const TemplateChip = styled.button`
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer; 
  text-align: left;
  
  &:focus {
    background: #06C755;
    color: white;
    border-color: #06C755;
  }
`;

export const SubmitButton = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background: linear-gradient(135deg, #06C755, #05b648);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const ResultsSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

export const CardContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

export const RecommendationCard = styled.div<{ $show: boolean }>`
  width: 100%;
  max-width: 400px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transform: ${({ $show }) => ($show ? 'translateX(0)' : 'translateX(20px)')};
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const StrategyType = styled.div<{ $type: 'supply' | 'borrow' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: ${({ $type }) => ($type === 'supply' ? '#dcfce7' : '#fef3c7')};
  color: ${({ $type }) => ($type === 'supply' ? '#166534' : '#92400e')};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const ConfidenceScore = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

export const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

export const TokenIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #06C755, #05b648);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
`;

export const TokenDetails = styled.div`
  flex: 1;
`;

export const TokenName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

export const TokenSymbol = styled.div`
  font-size: 14px;
  color: #64748b;
`;

export const APYBadge = styled.div`
  background: #06C755;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

export const MetricCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

export const MetricLabel = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-weight: 600;
`;

export const MetricValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
`;

export const ReasonText = styled.div`
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 16px;
`;

export const RiskSection = styled.div`
  margin-bottom: 16px;
`;

export const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const RiskList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const RiskItem = styled.li`
  font-size: 12px;
  color: #ef4444;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:before {
    content: '⚠️';
    font-size: 10px;
  }
`;

export const BenefitItem = styled.li`
  font-size: 12px;
  color: #06C755;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:before {
    content: '✅';
    font-size: 10px;
  }
`;

export const NavigationSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

export const PageIndicator = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

export const ActionButton = styled.button<{ $primary?: boolean }>`
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  background: ${({ $primary }) => 
    $primary ? 'linear-gradient(135deg, #06C755, #05b648)' : 'white'};
  color: ${({ $primary }) => ($primary ? 'white' : '#64748b')};
  border: 1px solid ${({ $primary }) => ($primary ? 'transparent' : '#e2e8f0')};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ $primary }) => 
      $primary ? '0 4px 12px rgba(6, 199, 85, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  }
`;

export const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #06C755;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const ErrorState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #ef4444;
`;

export const ResetButton = styled.button`
  margin-top: 16px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

export const LoadingMessage = styled.div`
  text-align: center;
  color: #64748b;
  font-size: 14px;
`;