// 'use client';

// import styled from 'styled-components';
// import { useAIDealsStore } from '@/stores/aiDealsStore';
// import { useModalStore } from '@/stores/modalStore';
// import { DealCard } from './DealCard';
// import { AIDeal } from '@/stores/aiDealsStore';

// const Container = styled.div`
//   padding: 20px 16px;
//   padding-bottom: 80px;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   min-height: 600px;
// `;

// const Header = styled.div`
//   text-align: center;
//   margin-bottom: 24px;
// `;

// const Title = styled.h2`
//   font-size: 24px;
//   font-weight: 700;
//   color: #1e293b;
//   margin-bottom: 8px;
// `;

// const Subtitle = styled.p`
//   color: #64748b;
//   font-size: 14px;
//   line-height: 1.5;
// `;

// const ProgressIndicator = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   gap: 8px;
//   margin-bottom: 24px;
// `;

// const ProgressDot = styled.div<{ $active?: boolean; $completed?: boolean }>`
//   width: 8px;
//   height: 8px;
//   border-radius: 50%;
//   background: ${props => {
//     if (props.$completed) return '#00C300';
//     if (props.$active) return '#3b82f6';
//     return '#e2e8f0';
//   }};
//   transition: background 0.3s ease;
// `;

// const ProgressText = styled.div`
//   font-size: 12px;
//   color: #64748b;
//   margin-left: 8px;
// `;

// const CardArea = styled.div`
//   flex: 1;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   width: 100%;
//   position: relative;
// `;

// const BackButton = styled.button`
//   background: white;
//   color: #64748b;
//   border: 1px solid #e2e8f0;
//   border-radius: 12px;
//   padding: 12px 24px;
//   font-size: 14px;
//   font-weight: 600;
//   cursor: pointer;
//   margin-top: 16px;
//   transition: all 0.2s;

//   &:hover {
//     background: #f8fafc;
//     border-color: #cbd5e1;
//   }
// `;

// const EmptyState = styled.div`
//   text-align: center;
//   padding: 60px 20px;
//   color: #64748b;
// `;

// interface SwipeDealsProps {
//   onBack: () => void;
// }

// export const SwipeDeals = ({ onBack }: SwipeDealsProps) => {
//   const { 
//     currentDeals, 
//     currentDealIndex, 
//     getCurrentDeal,
//     nextDeal,
//     resetDeals
//   } = useAIDealsStore();

//   const { openModal } = useModalStore();

//   const currentDeal = getCurrentDeal();
//   const totalDeals = currentDeals.length;

//   const handlePass = () => {
//     // Move to next deal, or cycle back to first if at end
//     if (currentDealIndex >= totalDeals - 1) {
//       // Reset index to 0 to show first deal again (cycle)
//       useAIDealsStore.setState({ currentDealIndex: 0 });
//     } else {
//       nextDeal();
//     }
//   };

//   const handleExecute = (deal: AIDeal) => {
//     // Open the appropriate modal based on deal type
//     const modalType = deal.type === 'supply' ? 'supply' : 'borrow';
    
//     openModal(modalType, {
//       marketId: deal.marketId,
//       action: deal.type,
//       suggestedAmount: deal.amount,
//       aiRecommendation: true,
//       dealData: deal
//     } as any);
//   };

//   if (currentDeals.length === 0) {
//     return (
//       <Container>
//         <EmptyState>
//           <h3>No deals available</h3>
//           <p>Please generate deals first</p>
//           <BackButton onClick={onBack}>Go Back</BackButton>
//         </EmptyState>
//       </Container>
//     );
//   }

//   return (
//     <Container>
//       <Header>
//         <Title>AI Deal Recommendations</Title>
//         <Subtitle>Pass to see next deal • Execute to open modal</Subtitle>
//       </Header>

//       <ProgressIndicator>
//         {currentDeals.map((_, index) => (
//           <ProgressDot
//             key={index}
//             $active={index === currentDealIndex}
//             $completed={false}
//           />
//         ))}
//         <ProgressText>
//           {currentDealIndex + 1} of {totalDeals}
//         </ProgressText>
//       </ProgressIndicator>

//       <CardArea>
//         {currentDeal && (
//           <DealCard 
//             deal={currentDeal} 
//             onPass={handlePass}
//             onExecute={handleExecute}
//           />
//         )}
//       </CardArea>

//       <BackButton onClick={onBack}>
//         Back to Home
//       </BackButton>
//     </Container>
//   );
// };