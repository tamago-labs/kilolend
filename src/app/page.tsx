"use client";

import { useState, useEffect } from "react";
import { useAppStore } from '@/stores/appStore';
import { SplashScreen } from '@/components/SplashScreen/SplashScreen';
import { HomeContainer } from '@/components/Home';
import { DesktopHome } from '@/components/Desktop/pages/Home/DesktopHomePage';

export default function Home() {
    const { isMobile, deviceDetected } = useAppStore();
    const [showSplash, setShowSplash] = useState(true);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    // Update page title based on device type
    useEffect(() => {
        if (deviceDetected) {
            if (isMobile) {
                document.title = "KiloLend | LINE Mini Dapp";
            }
        }
    }, [isMobile, deviceDetected]);

    // Show splash screen on first load
    if (showSplash) {
        return <SplashScreen onFinish={handleSplashFinish} />;
    }

    // Mobile: Show HomeContainer with tab navigation
    if (isMobile && deviceDetected) {
        return <HomeContainer />;
    }

    return <DesktopHome />;
}
