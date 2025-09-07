// 'use client';

// import styled, { keyframes, css } from 'styled-components';
// import { useState, useEffect } from 'react';
// import { AIDeal } from '@/stores/aiDealsStore';
// import { useMarketStore } from '@/stores/marketStore';

// const slideIn = keyframes`
//   from {
//     transform: translateX(100%) rotate(5deg);
//     opacity: 0;
//   }
//   to {
//     transform: translateX(0) rotate(0deg);
//     opacity: 1;
//   }
// `;

// const slideOutLeft = keyframes`
//   to {
//     transform: translateX(-100%) rotate(-30deg);
//     opacity: 0;
//   }
// `;

// const slideOutRight = keyframes`
//   to {
//     transform: translateX(100%) rotate(30deg);
//     opacity: 0;
//   }
// `;

// const CardContainer = styled.div<{ $swiping?: 'left' | 'right' | null }>`
//   position: relative;
//   width: 100%;
//   max-width: 380px;
//   min-height: 580px;
//   margin: 0 auto;
//   perspective: 1000px;
//   animation: ${slideIn} 0.5s ease-out;
  
//   ${props => props.$swiping === 'left' && css`
//     animation: ${slideOutLeft} 0.3s ease-in forwards;
//   `}
  
//   ${props => props.$swiping === 'right' && css`
//     animation: ${slideOutRight} 0.3s ease-in forwards;
//   `}
// `;

// const Card = styled.div<{ $riskLevel: 'low' | 'medium' | 'high' }>`
//   width: 100%;
//   height: 100%;
//   background: white;
//   border-radius: 20px;
//   padding: 20px;
//   box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
//   border: 1px solid #e2e8f0;
//   border-top: 4px solid ${props => {
//     switch (props.$riskLevel) {
//       case 'low': return '#00C300';
//       case 'medium': return '#f59e0b';
//       case 'high': return '#ef4444';
//       default: return '#e2e8f0';
//     }
//   }};
//   display: flex;
//   flex-direction: column;
//   position: relative;
//   cursor: grab;
//   user-select: none;
//   overflow-y: auto;
//   overflow-x: hidden;

//   &:active {
//     cursor: grabbing;
//   }

//   /* Scrollbar styling */
//   &::-webkit-scrollbar {
//     width: 4px;
//   }

//   &::-webkit-scrollbar-track {
//     background: #f1f1f1;
//     border-radius: 2px;
//   }

//   &::-webkit-scrollbar-thumb {
//     background: #c1c1c1;
//     border-radius: 2px;
//   }

//   &::-webkit-scrollbar-thumb:hover {
//     background: #a8a8a8;
//   }
// `;

// const CardHeader = styled.div`
//   margin-bottom: 16px;
// `;

// const DealType = styled.div<{ $type: 'supply' | 'borrow' }>`
//   display: inline-block;
//   padding: 4px 12px;
//   border-radius: 12px;
//   font-size: 12px;
//   font-weight: 600;
//   margin-bottom: 8px;
//   background: ${props => props.$type === 'supply' ? '#dcfce7' : '#dbeafe'};
//   color: ${props => props.$type === 'supply' ? '#166534' : '#1e40af'};
// `;

// const DealTitle = styled.h3`
//   font-size: 18px;
//   font-weight: 700;
//   color: #1e293b;
//   margin-bottom: 8px;
//   line-height: 1.3;
// `;

// const DealDescription = styled.p`
//   font-size: 14px;
//   color: #64748b;
//   line-height: 1.5;
// `;

// const StatsSection = styled.div`
//   margin: 16px 0;
//   padding: 16px;
//   background: #f8fafc;
//   border-radius: 12px;
// `;

// const MainStat = styled.div`
//   text-align: center;
//   margin-bottom: 12px;
// `;

// const StatValue = styled.div`
//   font-size: 28px;
//   font-weight: 800;
//   color: #1e293b;
//   margin-bottom: 4px;
// `;

// const StatLabel = styled.div`
//   font-size: 14px;
//   color: #64748b;
//   font-weight: 500;
// `;

// const SubStats = styled.div`
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 12px;
// `;

// const SubStat = styled.div`
//   text-align: center;
// `;

// const SubStatValue = styled.div`
//   font-size: 16px;
//   font-weight: 600;
//   color: #1e293b;
// `;

// const SubStatLabel = styled.div`
//   font-size: 12px;
//   color: #64748b;
// `;

// const DetailsSection = styled.div`
//   flex: 1;
//   margin: 16px 0;
//   min-height: 0;
// `;

// const DetailsList = styled.div`
//   margin-bottom: 16px;
// `;

// const DetailsTitle = styled.h4`
//   font-size: 14px;
//   font-weight: 600;
//   color: #1e293b;
//   margin-bottom: 8px;
// `;

// const DetailItem = styled.div`
//   font-size: 13px;
//   color: #64748b;
//   margin-bottom: 4px;
//   display: flex;
//   align-items: center;
//   gap: 6px;

//   &:before {
//     content: '•';
//     color: #00C300;
//     font-weight: bold;
//   }
// `;

// const RiskIndicator = styled.div<{ $level: 'low' | 'medium' | 'high' }>`
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   padding: 8px 12px;
//   border-radius: 8px;
//   background: ${props => {
//     switch (props.$level) {
//       case 'low': return '#dcfce7';
//       case 'medium': return '#fef3c7';
//       case 'high': return '#fee2e2';
//       default: return '#f3f4f6';
//     }
//   }};
//   margin-bottom: 12px;
// `;

// const RiskDot = styled.div<{ $level: 'low' | 'medium' | 'high' }>`
//   width: 8px;
//   height: 8px;
//   border-radius: 50%;
//   background: ${props => {
//     switch (props.$level) {
//       case 'low': return '#00C300';
//       case 'medium': return '#f59e0b';
//       case 'high': return '#ef4444';
//       default: return '#6b7280';
//     }
//   }};
// `;

// const RiskText = styled.span`
//   font-size: 12px;
//   font-weight: 600;
//   color: #1e293b;
//   text-transform: capitalize;
// `;

// const ConfidenceBar = styled.div`
//   margin: 12px 0;
// `;

// const ConfidenceLabel = styled.div`
//   font-size: 12px;
//   color: #64748b;
//   margin-bottom: 4px;
// `;

// const ConfidenceTrack = styled.div`
//   width: 100%;
//   height: 4px;
//   background: #e2e8f0;
//   border-radius: 2px;
//   overflow: hidden;
// `;

// const ConfidenceFill = styled.div<{ $confidence: number }>`
//   height: 100%;
//   width: ${props => props.$confidence}%;
//   background: linear-gradient(90deg, #f59e0b, #00C300);
//   transition: width 0.3s ease;
// `;

// const SwipeButtons = styled.div`
//   display: flex;
//   gap: 16px;
//   margin-top: 20px;
//   padding: 16px 0;
// `;

// const SwipeButton = styled.button<{ $type: 'reject' | 'accept' }>`
//   flex: 1;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 8px;
//   padding: 16px 20px;
//   border-radius: 16px;
//   font-size: 16px;
//   font-weight: 600;
//   cursor: pointer;
//   transition: all 0.2s;
//   border: none;
  
//   background: ${props => props.$type === 'accept' 
//     ? 'linear-gradient(135deg, #00C300, #00A000)' 
//     : 'linear-gradient(135deg, #ef4444, #dc2626)'};
//   color: white;

//   &:hover {
//     transform: translateY(-2px);
//     box-shadow: ${props => props.$type === 'accept' 
//       ? '0 4px 12px rgba(0, 195, 0, 0.3)' 
//       : '0 4px 12px rgba(239, 68, 68, 0.3)'};
//   }

//   &:active {
//     transform: translateY(0);
//   }
// `;

// const MarketIcon = styled.span`
//   font-size: 20px;
//   margin-right: 6px;
// `;

// const KeyboardHint = styled.div`
//   position: absolute;
//   top: 10px;
//   right: 10px;
//   font-size: 10px;
//   color: #94a3b8;
//   background: rgba(255, 255, 255, 0.9);
//   padding: 4px 6px;
//   border-radius: 4px;
// `;

// interface DealCardProps {
//   deal: AIDeal;
//   onPass: () => void;
//   onExecute: (deal: AIDeal) => void;
// }

// export const DealCard = ({ deal, onPass, onExecute }: DealCardProps) => {
//   const [swiping, setSwiping] = useState<'left' | 'right' | null>(null);
//   const { markets } = useMarketStore();

//   const market = markets.find(m => m.id === deal.marketId);

//   const handlePass = () => {
//     setSwiping('left');
//     setTimeout(() => {
//       onPass();
//       setSwiping(null);
//     }, 300);
//   };

//   const handleExecute = () => {
//     setSwiping('right');
//     setTimeout(() => {
//       onExecute(deal);
//       setSwiping(null);
//     }, 300);
//   };

//   const formatAmount = (amount: number) => {
//     if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
//     if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
//     return `$${amount.toFixed(0)}`;
//   };

//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       if (e.key === 'ArrowLeft') handlePass();
//       if (e.key === 'ArrowRight') handleExecute();
//     };

//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);
//   }, []);

//   return (
//     <CardContainer $swiping={swiping}>
//       <Card $riskLevel={deal.riskLevel}>
//         <KeyboardHint>← → keys</KeyboardHint>
        
//         <CardHeader>
//           <DealType $type={deal.type}>
//             {deal.type === 'supply' ? '💰 SUPPLY' : '📈 BORROW'}
//           </DealType>
//           <DealTitle>
//             <MarketIcon>{market?.icon}</MarketIcon>
//             {deal.title}
//           </DealTitle>
//           <DealDescription>{deal.description}</DealDescription>
//         </CardHeader>

//         <StatsSection>
//           <MainStat>
//             <StatValue>{deal.apy.toFixed(2)}%</StatValue>
//             <StatLabel>{deal.type === 'supply' ? 'APY' : 'APR'}</StatLabel>
//           </MainStat>
          
//           <SubStats>
//             <SubStat>
//               <SubStatValue>{formatAmount(deal.amount)}</SubStatValue>
//               <SubStatLabel>Amount</SubStatLabel>
//             </SubStat>
//             <SubStat>
//               <SubStatValue>{deal.duration}</SubStatValue>
//               <SubStatLabel>Duration</SubStatLabel>
//             </SubStat>
//           </SubStats>
//         </StatsSection>

//         <DetailsSection>
//           <RiskIndicator $level={deal.riskLevel}>
//             <RiskDot $level={deal.riskLevel} />
//             <RiskText>{deal.riskLevel} Risk</RiskText>
//           </RiskIndicator>

//           <DetailsList>
//             <DetailsTitle>Benefits</DetailsTitle>
//             {deal.benefits.slice(0, 3).map((benefit, index) => (
//               <DetailItem key={index}>{benefit}</DetailItem>
//             ))}
//           </DetailsList>

//           {deal.estimatedEarnings && (
//             <div style={{ marginBottom: '12px' }}>
//               <DetailsTitle>Estimated Monthly Earnings</DetailsTitle>
//               <DetailItem style={{ color: '#00C300', fontWeight: '600' }}>
//                 ${deal.estimatedEarnings.toFixed(2)}
//               </DetailItem>
//             </div>
//           )}

//           <ConfidenceBar>
//             <ConfidenceLabel>AI Confidence: {deal.confidence}%</ConfidenceLabel>
//             <ConfidenceTrack>
//               <ConfidenceFill $confidence={deal.confidence} />
//             </ConfidenceTrack>
//           </ConfidenceBar>
//         </DetailsSection>

//         <SwipeButtons>
//           <SwipeButton $type="reject" onClick={handlePass}>
//             👈 Pass
//           </SwipeButton>
//           <SwipeButton $type="accept" onClick={handleExecute}>
//             {deal.type === 'supply' ? '💰 Supply' : '📈 Borrow'}
//           </SwipeButton>
//         </SwipeButtons>
//       </Card>
//     </CardContainer>
//   );
// };
