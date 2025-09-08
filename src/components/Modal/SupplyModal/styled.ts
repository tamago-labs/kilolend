import styled from 'styled-components';
 

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const StepProgress = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
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

export const StepContent = styled.div`
  flex: 1;
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
  
  ${({ $primary }) => $primary ? `
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
  ` : `
    background: white;
    color: #64748b;
    border-color: #e2e8f0;
    
    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  `}
`;

export const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 14px;
`;

export const ApprovalMessage = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #0369a1;
  font-size: 14px;
`;
