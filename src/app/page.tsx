"use client";

import styled from 'styled-components';
import { useEffect, useState } from "react";
import { useAppStore } from '@/stores/appStore';
// import { useAIDealsStore } from '@/stores/aiDealsStore';
import { BottomNav, TabType } from '@/components/BottomNav/BottomNav';
import { HomePage } from '@/components/Pages/HomePage';
import { PortfolioPage } from '@/components/Pages/PortfolioPage';
import { ActivityPage } from '@/components/Pages/ActivityPage';
import { ProfilePage } from '@/components/Pages/ProfilePage';
// import { SwipeDeals } from '@/components/AIDeals/SwipeDeals';
// import { GlobalModal } from '@/components/GlobalModal/GlobalModal';
import { SplashScreen } from '@/components/SplashScreen/SplashScreen';
import { GlobalModalManager } from '@/components/Modal/GlobalModalManager';

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
    // const { generateDeals, currentDeals } = useAIDealsStore();
    const [showSwipeDeals, setShowSwipeDeals] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, [activeTab]);

    const handleAIDealsGenerated = async (userQuery: string) => {
        console.log('AI Query:', userQuery);
        
        // Generate AI deals
        // await generateDeals(userQuery);
        
        // Show swipe interface
        setShowSwipeDeals(true);
    };

    const handleBackToHome = () => {
        setShowSwipeDeals(false);
    };

    const renderContent = () => {
        // Show swipe deals interface if deals are generated
        // if (showSwipeDeals && currentDeals.length > 0) {
        //     return (
        //         <SwipeDeals 
        //             onBack={handleBackToHome}
        //         />
        //     );
        // }

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

    // Show splash screen on first load
    if (showSplash) {
        return <SplashScreen onFinish={handleSplashFinish} />;
    }

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
            {/* <GlobalModal onAIDealsGenerated={handleAIDealsGenerated} /> */}
            
            {/* New Modal Manager */}
            <GlobalModalManager />
        </PageContainer>
    );
}