"use client";

import styled from 'styled-components';
import { useState } from "react";
import { BottomNav, TabType } from '@/components/BottomNav/BottomNav';
import { HomePage } from '@/components/Pages/HomePage';
import { PortfolioPage } from '@/components/Pages/PortfolioPage';
import { ActivityPage } from '@/components/Pages/ActivityPage';
import { ProfilePage } from '@/components/Pages/ProfilePage';

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
    const [activeTab, setActiveTab] = useState<TabType>('home');

    const handleAIDealsGenerated = (userQuery: string) => {
        console.log('AI Query:', userQuery);
        // TODO: Phase 4 - Generate AI deals and show Tinder cards
        alert(`AI is processing: "${userQuery}"\n\nNext: Swipeable deals coming in Phase 4!`);
    };

    const renderContent = () => {
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
            
            <BottomNav 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
            />
        </PageContainer>
    );
}
