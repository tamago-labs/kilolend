 

export function transformTaskToActivity(task: any): any {
  return {
    timestamp: task.timestamp || Date.now(),
    action: getActionLabel(task.taskType),
    reasoning: task.aiReasoning || 'No reasoning provided',
    status: mapStatus(task.status),
    healthFactor: task.healthFactorBefore || undefined,
    txHash: task.txHash || undefined,
    task: {
      taskId: task.date || task.taskId,
      type: task.taskType,
      description: task.description || '',
      steps: task.steps || [],
      parameters: task.parameters || {},
      reasoning: task.aiReasoning || '',
      confidence: task.confidenceScore || 0,
      riskLevel: task.riskAssessment || 'MEDIUM',
      status: task.status || 'PENDING_OPERATOR',
      timestamp: new Date(task.timestamp || Date.now()).toISOString()
    }
  };
}

function getActionLabel(taskType: string): string {
  const labels: Record<string, string> = {
    'LEVERAGE_UP': 'AI Decision: Leverage Up',
    'LEVERAGE_DOWN': 'AI Decision: Leverage Down',
    'EMERGENCY_STOP': '🚨 Emergency Stop',
    'REBALANCE': 'AI Decision: Rebalance',
    'HOLD': 'Health Factor Monitored',
    'BOT_WITHDRAW': 'Bot Withdrew from Vault',
    'DEPOSIT': 'Deposit Task Created',
    'WITHDRAW': 'Withdrawal Task Created'
  };
  
  return labels[taskType] || taskType;
}

function mapStatus(status: string): 'success' | 'pending' | 'warning' | 'info' | 'critical' {
  const statusMap: Record<string, 'success' | 'pending' | 'warning' | 'info' | 'critical'> = {
    'COMPLETED': 'success',
    'PENDING_OPERATOR': 'pending',
    'URGENT_OPERATOR_ACTION': 'critical',
    'PROCESSING': 'info',
    'FAILED': 'warning'
  };
  
  return statusMap[status] || 'info';
}

export function formatActivities(tasks: any[]): any[] {
  if (!Array.isArray(tasks)) return [];
  return tasks.map(transformTaskToActivity);
}
