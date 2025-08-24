"use client";

import styled from 'styled-components';
import { useState } from "react";
import { useAppStore } from '@/stores/appStore';
import { useAIDealsStore } from '@/stores/aiDealsStore';
import { BottomNav, TabType } from '@/components/BottomNav/BottomNav';
import { HomePage } from '@/components/Pages/HomePage';
import { PortfolioPage } from '@/components/Pages/PortfolioPage';
import { ActivityPage } from '@/components/Pages/ActivityPage';
import { ProfilePage } from '@/components/Pages/ProfilePage';
import { SwipeDeals } from '@/components/AIDeals/SwipeDeals';
import { GlobalModal } from '@/components/GlobalModal/GlobalModal';

const PageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export default function Home() {
    const { activeTab, setActiveTab } = useAppStore();
    const { generateDeals, currentDeals } = useAIDealsStore();
    const [showSwipeDeals, setShowSwipeDeals] = useState(false);

    const handleAIDealsGenerated = async (userQuery: string) => {
        console.log('AI Query:', userQuery);
        
        // Generate AI deals
        await generateDeals(userQuery);
        
        // Show swipe interface
        setShowSwipeDeals(true);
    };

    const handleBackToHome = () => {
        setShowSwipeDeals(false);
    };

    const handleExecuteDeals = (dealIds: string[]) => {
        console.log('Executing deals:', dealIds);
        
        // Show success message
        alert(`Successfully executed ${dealIds.length} deal${dealIds.length !== 1 ? 's' : ''}!\n\nCheck your Portfolio for new positions.`);
        
        // Navigate to portfolio to show new positions
        setActiveTab('portfolio');
        setShowSwipeDeals(false);
    };

    const renderContent = () => {
        // Show swipe deals interface if deals are generated
        if (showSwipeDeals && currentDeals.length > 0) {
            return (
                <SwipeDeals 
                    onBack={handleBackToHome}
                    onExecuteDeals={handleExecuteDeals}
                />
            );
        }

        // Show regular app content
        switch (activeTab) {
            case 'home':
                return (
                    <HomePage 
                        onAIDealsGenerated={handleAIDealsGenerated}
                    />
                );
            case 'portfolio':
                return <PortfolioPage />;
            case 'activity':
                return <ActivityPage />;
            case 'profile':
                return <ProfilePage />;
            default:
                return (
                    <HomePage 
                        onAIDealsGenerated={handleAIDealsGenerated}
                    />
                );
        }
    };

    return (
        <PageContainer>
            <ContentArea>
                {renderContent()}
            </ContentArea>
            
            {/* Hide bottom nav when in swipe mode */}
            {!showSwipeDeals && (
                <BottomNav 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab}
                />
            )}
            
            {/* Global Modal */}
            <GlobalModal onAIDealsGenerated={handleAIDealsGenerated} />
        </PageContainer>
    );
}
