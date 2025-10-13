import React, { useState } from 'react';
import { Activity, ExternalLink, Clock } from 'react-feather';
import { KAIA_SCAN_URL } from '@/utils/tokenConfig';
import { useActivityData } from './useActivityData'; 
import { TaskDetailsExpander } from './TaskDetailsExpander';
import {
  SectionTitle,
  FilterSelect,
  InfoBanner,
  ActivityFeed,
  ActivityLink,
  EmptyState,
  EmptyStateIcon,
  EmptyStateText
} from './styled';
import {
  ChatMessage,
  ChatAvatar,
  ChatBubble,
  ChatHeader,
  ChatName,
  ChatText,
  TaskBadge,
  MetricBox
} from './chatStyles';

interface ActivityTabProps {
  selectedActionFilter: string;
  onFilterChange: (filter: string) => void;
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


const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

const getTaskColor = (taskType: string): string => {
  switch (taskType) {
    case 'LEVERAGE_UP': return '#10b981';
    case 'LEVERAGE_DOWN': return '#f59e0b';
    case 'REBALANCE': return '#3b82f6';
    case 'EMERGENCY_STOP': return '#ef4444';
    case 'HOLD': return '#64748b';
    default: return '#667eea';
  }
};

/**
 * Activity Tab with Chat-Style UI
 * No more Success/Warning filters - uses task types instead
 */
export const ActivityTab: React.FC<ActivityTabProps> = ({
  selectedActionFilter,
  onFilterChange
}) => {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const { activities, loading, error } = useActivityData(selectedActionFilter);

  if (loading) {
    return (
      <EmptyState>
        <EmptyStateIcon>⏳</EmptyStateIcon>
        <EmptyStateText>Loading bot activity...</EmptyStateText>
      </EmptyState>
    );
  }

  if (error) {
    return (
      <EmptyState>
        <EmptyStateIcon>❌</EmptyStateIcon>
        <EmptyStateText>Failed to load activity: {error}</EmptyStateText>
      </EmptyState>
    );
  }

  return (
    <>
      {/* <MetricsDisplay /> */}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '0px' }}>
        <SectionTitle style={{ margin: 0 }}>Live Bot Activity</SectionTitle>
        <FilterSelect 
          value={selectedActionFilter} 
          onChange={(e) => onFilterChange(e.target.value)} 
          style={{ width: 'auto', minWidth: '180px', marginLeft:"10px" }}
        >
          <option value="all">All Activity</option>
          <option value="LEVERAGE_UP">📈 Leverage Up</option>
          <option value="LEVERAGE_DOWN">📉 Leverage Down</option>
          <option value="REBALANCE">⚖️ Rebalance</option>
          <option value="EMERGENCY_STOP">🚨 Emergency</option>
          <option value="HOLD">⏸️ Hold</option>
        </FilterSelect>
      </div>
      
    {/*  <InfoBanner $type="info" style={{ marginBottom: '16px' }}>
        <Activity size={14} />
        <div style={{ fontSize: '13px' }}>
          Live feed of AI bot decisions. Bot checks every 60 minutes, emergency monitoring every 5 minutes.
        </div>
      </InfoBanner>*/}

      <ActivityFeed>
        {activities.map((activity, index) => {
          const isExpanded = expandedTask === `task-${index}`;
          const hasTask = !!activity.task;
          const taskInfo = hasTask && activity.task ? TASK_TYPE_LABELS[activity.task.type] : null;

          return (
            <ChatMessage key={index} $isAI={true}>
              <ChatAvatar>🤖</ChatAvatar>
              <ChatBubble>
                <ChatHeader>
                  {/*<ChatName>
                    KiloBot AI
                    {activity.task && taskInfo && (
                      <TaskBadge $color={getTaskColor(activity.task.type)}>
                        {taskInfo.icon} {taskInfo.label}
                      </TaskBadge>
                    )}
                  </ChatName>*/}
                   <strong>{activity.action}</strong>

                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    {formatTime(activity.timestamp)}
                  </span>
                </ChatHeader>
                
                <ChatText>
                  {/*<strong>{activity.action}</strong>
                  <br />*/}
                  {activity.reasoning}
                </ChatText> 
                {activity.healthFactor && (
                  <MetricBox>
                    💓 Health Factor: <strong>{activity.healthFactor.toFixed(2)}</strong>
                  </MetricBox>
                )}
                
                {/*{activity.txHash && (
                  <ActivityLink 
                    href={`${KAIA_SCAN_URL}/tx/${activity.txHash}`} 
                    target="_blank"
                    style={{ marginTop: '8px', display: 'inline-block', fontSize: '13px' }}
                  >
                    View Transaction <ExternalLink size={12} />
                  </ActivityLink>
                )}*/}
                
                {/* Expandable task details */}
                {/*{activity.task && (
                  <TaskDetailsExpander 
                    task={activity.task}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedTask(
                      expandedTask === `task-${index}` ? null : `task-${index}`
                    )}
                  />
                )}*/}
              </ChatBubble>
            </ChatMessage>
          );
        })}
      </ActivityFeed>

      {activities.length === 0 && (
        <EmptyState>
          <EmptyStateIcon>🔍</EmptyStateIcon>
          <EmptyStateText>
            {selectedActionFilter === 'all' 
              ? 'No bot activity yet. Waiting for first operation...'
              : `No ${selectedActionFilter.replace(/_/g, ' ').toLowerCase()} activity found`}
          </EmptyStateText>
        </EmptyState>
      )}
    </>
  );
};
