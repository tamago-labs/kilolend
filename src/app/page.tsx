"use client";

import { useState } from "react";
import { useAppStore } from '@/stores/appStore';
import { SplashScreen } from '@/components/SplashScreen/SplashScreen';
import { HomeContainer } from '@/components/Home';
import { Landing } from '@/components/Desktop/Landing';
import { DesktopHome } from '@/components/Desktop/DesktopHome';

export default function Home() {
    const { isMobile, deviceDetected } = useAppStore();
    const [showSplash, setShowSplash] = useState(true);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

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
