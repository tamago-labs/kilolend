import styled from 'styled-components';

// Chat-style components for Activity Tab
export const ChatMessage = styled.div<{ $isAI?: boolean }>`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
`;

export const ChatAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

export const ChatBubble = styled.div`
  flex: 1;
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 16px;
  border-left: 3px solid #667eea;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

export const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

export const ChatName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ChatText = styled.div`
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
`;

export const TaskBadge = styled.span<{ $color?: string }>`
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: ${props => props.$color || '#667eea'};
  color: #fff;
  font-weight: 500;
`;

export const MetricBox = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: #fff;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TaskExpandButton = styled.button`
  width: 100%;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

export const TaskDetails = styled.div`
  margin-top: 8px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
`;

export const StatusBadge = styled.span<{ $status?: string }>`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
  font-weight: 500;
  background: ${props => {
    switch (props.$status) {
      case 'COMPLETED': return '#22c55e';
      case 'URGENT_OPERATOR_ACTION': return '#ef4444';
      case 'PENDING': return '#f59e0b';
      default: return '#94a3b8';
    }
  }};
`;

export const StepsList = styled.ol`
  margin: 8px 0 0 0;
  padding-left: 20px;
  line-height: 1.8;
  color: #475569;
`;

export const ParametersBox = styled.div`
  margin-top: 12px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 4px;
  
  pre {
    margin: 4px 0 0 0;
    font-size: 11px;
    font-family: 'Monaco', 'Courier New', monospace;
    white-space: pre-wrap;
    word-break: break-word;
    color: #334155;
  }
`;
