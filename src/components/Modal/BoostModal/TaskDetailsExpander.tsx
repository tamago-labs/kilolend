import React from 'react';
 
import { TaskExpandButton, TaskDetails, StatusBadge, StepsList, ParametersBox } from './chatStyles';
import { ChevronDown, ChevronUp } from "react-feather"

interface Task {
  type: string;
  confidence: number;
  riskLevel: string;
  status: string;
  steps: string[];
  parameters?: Record<string, any>;
}

interface TaskDetailsExpanderProps {
  task: Task;
  isExpanded: boolean;
  onToggle: () => void;
}

 const TASK_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  'BOT_WITHDRAW': { label: 'Bot Withdraw', icon: '🤖', color: '#06C755' },
  'LEVERAGE_UP': { label: 'Leverage Up', icon: '🚀', color: '#3b82f6' },
  'LEVERAGE_DOWN': { label: 'Leverage Down', icon: '📉', color: '#f59e0b' },
  'REBALANCE': { label: 'Rebalance', icon: '⚖️', color: '#8b5cf6' },
  'EMERGENCY_STOP': { label: 'Emergency Stop', icon: '🚨', color: '#ef4444' },
  'DEPOSIT': { label: 'Deposit', icon: '💰', color: '#06C755' },
  'WITHDRAW': { label: 'Withdraw', icon: '💸', color: '#f59e0b' }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED': return '#22c55e';
    case 'URGENT_OPERATOR_ACTION': return '#ef4444';
    case 'PENDING': return '#f59e0b';
    default: return '#94a3b8';
  }
};

/**
 * Expandable task details component
 * Shows AI confidence, risk level, operator steps, and parameters
 */
export const TaskDetailsExpander: React.FC<TaskDetailsExpanderProps> = ({
  task,
  isExpanded,
  onToggle
}) => {
  const taskInfo = TASK_TYPE_LABELS[task.type];
  
  return (
    <>
      <TaskExpandButton onClick={onToggle}>
        <span>
          Task Details
          <StatusBadge $status={task.status} style={{ marginLeft: '8px' }}>
            {task.status.replace(/_/g, ' ')}
          </StatusBadge>
        </span>
        <span style={{ fontSize: '16px' }}>{isExpanded ? <ChevronDown/> : <ChevronUp/>}</span>
      </TaskExpandButton>
      
      {isExpanded && (
        <TaskDetails>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
              <span>
                <strong>AI Confidence:</strong> {(task.confidence * 100).toFixed(0)}%
              </span>
              <span>
                <strong>Risk Level:</strong> {task.riskLevel}
              </span>
            </div>
          </div>
          
          <div>
            <strong>Operator Steps:</strong>
            <StepsList>
              {task.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </StepsList>
          </div>
          
          {task.parameters && Object.keys(task.parameters).length > 0 && (
            <ParametersBox>
              <strong>Parameters:</strong>
              <pre>{JSON.stringify(task.parameters, null, 2)}</pre>
            </ParametersBox>
          )}
        </TaskDetails>
      )}
    </>
  );
};
