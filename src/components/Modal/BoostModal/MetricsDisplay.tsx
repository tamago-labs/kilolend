// import React from 'react';
// import { Activity, TrendingUp, AlertCircle, CheckCircle } from 'react-feather';
// import { useBotMetrics } from '@/hooks/useBotActivity';
// import {
//   SectionTitle,
//   InfoBanner,
//   EmptyState,
//   EmptyStateIcon,
//   EmptyStateText
// } from './styled';

// export const MetricsDisplay: React.FC = () => {
//   const { data: metrics, loading, error } = useBotMetrics(24);

//   if (loading) {
//     return (
//       <EmptyState>
//         <EmptyStateIcon>⏳</EmptyStateIcon>
//         <EmptyStateText>Loading metrics...</EmptyStateText>
//       </EmptyState>
//     );
//   }

//   if (error || !metrics) {
//     return (
//       <EmptyState>
//         <EmptyStateIcon>❌</EmptyStateIcon>
//         <EmptyStateText>Failed to load metrics</EmptyStateText>
//       </EmptyState>
//     );
//   }

//   const getHFColor = (hf: number) => {
//     if (hf < 1.3) return '#ef4444';
//     if (hf < 1.5) return '#f59e0b';
//     if (hf < 1.7) return '#06C755';
//     if (hf <= 2.0) return '#06C755';
//     return '#3b82f6';
//   };

//   return (
//     <>
//       <InfoBanner $type="info" style={{ marginBottom: '16px' }}>
//         <Activity size={14} />
//         <div style={{ fontSize: '13px' }}>
//           Bot performance metrics for the last 24 hours
//         </div>
//       </InfoBanner>

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
//         <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
//           <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Total Tasks</div>
//           <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{metrics.totalTasks}</div>
//         </div>

//         <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
//           <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Success Rate</div>
//           <div style={{ fontSize: '24px', fontWeight: 700, color: '#06C755' }}>
//             {metrics.successRate ? metrics.successRate.toFixed(1) : '0'}%
//           </div>
//         </div>

//         <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
//           <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Pending</div>
//           <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{metrics.pendingCount || 0}</div>
//         </div>

//         <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
//           <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Completed</div>
//           <div style={{ fontSize: '24px', fontWeight: 700, color: '#06C755' }}>{metrics.completedCount || 0}</div>
//         </div>
//       </div>

//       {metrics.currentHealthFactor && (
//         <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '16px' }}>
//           <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Current Health Factor</div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//             <div style={{ fontSize: '32px', fontWeight: 700, color: getHFColor(metrics.currentHealthFactor) }}>
//               {metrics.currentHealthFactor.toFixed(2)}
//             </div>
//             <div style={{ fontSize: '13px', color: '#64748b' }}>
//               {metrics.currentHealthFactor < 1.3 && '🚨 Critical'}
//               {metrics.currentHealthFactor >= 1.3 && metrics.currentHealthFactor < 1.5 && '⚠️ Warning'}
//               {metrics.currentHealthFactor >= 1.5 && metrics.currentHealthFactor < 1.7 && '✅ Safe'}
//               {metrics.currentHealthFactor >= 1.7 && metrics.currentHealthFactor <= 2.0 && '✨ Optimal'}
//               {metrics.currentHealthFactor > 2.0 && '📊 Conservative'}
//             </div>
//           </div>
//         </div>
//       )}

//       <SectionTitle>Task Distribution</SectionTitle>
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
//         <div style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
//           <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>By Type</div>
//           {Object.entries(metrics.tasksByType || {}).map(([type, count]) => (
//             <div key={type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
//               <span style={{ color: '#475569' }}>{type}</span>
//               <span style={{ fontWeight: 600 }}>{count as number}</span>
//             </div>
//           ))}
//         </div>

//         <div style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
//           <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>By Status</div>
//           {Object.entries(metrics.tasksByStatus || {}).map(([status, count]) => (
//             <div key={status} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
//               <span style={{ color: '#475569' }}>{status.replace(/_/g, ' ')}</span>
//               <span style={{ fontWeight: 600 }}>{count as number}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
//         <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>AI Confidence</div>
//         <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>
//           {metrics.averageConfidence ? (metrics.averageConfidence * 100).toFixed(0) : '0'}%
//         </div>
//         <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
//           Average confidence across all decisions
//         </div>
//       </div>
//     </>
//   );
// };
