import { useBotActivity } from '@/hooks/useBotActivity';
import { formatActivities } from './apiTransform'; 

/**
 * Hook to fetch and filter bot activity data
 * Filters by task type (LEVERAGE_UP, REBALANCE, etc) instead of status
 */
export function useActivityData(selectedFilter: string) {
  const { data: rawTasks, loading, error } = useBotActivity(25);
  
  // Transform API data to UI format
  const activities = formatActivities(rawTasks);
  
  // Apply filter - now filters by task type instead of status
  const filtered = selectedFilter === 'all' 
    ? activities 
    : activities.filter(a => a.task?.type === selectedFilter);
  
  return { activities: filtered, loading, error };
}
