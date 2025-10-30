"use client";

import styled from 'styled-components';
import { useEffect, useState } from "react";
import { useAppStore } from '@/stores/appStore';
import { BottomNav, TabType } from '@/components/BottomNav/BottomNav';
import { HomePage } from '@/components/Pages/HomePage';
import { PortfolioPage } from '@/components/Pages/PortfolioPage';
import { ActivityPage } from '@/components/Pages/ActivityPage';
import { ProfilePage } from '@/components/Pages/ProfilePage';
import { MigratePage } from '@/components/Pages/MigratePage';
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
    const [showSplash, setShowSplash] = useState(true);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [activeTab]);




    const renderContent = () => {

        // Show regular app content
        switch (activeTab) {
            case 'home':
                return (
                    <HomePage />
                );
            case 'portfolio':
                return <PortfolioPage />;
            case 'activity':
                return <ActivityPage />;
            case 'profile':
                return <ProfilePage />;
            case 'migrate':
                return <MigratePage />;
            default:
                return (
                    <HomePage />
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

            <BottomNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* New Modal Manager */}
            <GlobalModalManager />
        </PageContainer>
    );
}
