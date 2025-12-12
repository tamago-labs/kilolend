"use client";

import { ReactNode, useEffect, useState } from "react";
import { useKaiaWalletSecurity } from "@/components/Wallet/Sdk/walletSdk.hooks";
import styled from 'styled-components';
import { DesktopHeader } from './DesktopHeader';
import { DesktopFooter } from "./DesktopFooter"
import { MarketDataProvider } from '@/components/MarketDataProvider';
import { MarketProvider } from '@/contexts/MarketContext';
import { DesktopAIChatPanel } from './DesktopAIChatPanel';
import { LineMiniDAppModal } from '../modals';
import { useModalStore } from '@/stores/modalStore';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export type DesktopBootstrapProps = {
    className?: string;
    children?: ReactNode;
}

export const DesktopBootstrap = ({ className, children }: DesktopBootstrapProps) => {
    const { isSuccess } = useKaiaWalletSecurity();
    const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
    const { activeModal, closeModal } = useModalStore();

    useEffect(() => {
        const preventGoBack = () => {
            if (window.location.pathname === '/') {
                const isConfirmed = confirm('Are you sure you want to go back?');
                if (!isConfirmed) {
                    history.pushState(null, '', window.location.pathname)
                }
            }
        };

        window.addEventListener('popstate', preventGoBack);

        return () => {
            window.removeEventListener('popstate', preventGoBack);
        };
    }, []);

    const handleAIToggle = () => {
        setIsAIPanelOpen(!isAIPanelOpen);
    };

    return (
        <AppContainer className={className}>
            {isSuccess && (
                <MarketDataProvider>
                    <MarketProvider>
                        <DesktopHeader />
                        <MainContent>
                            {children}
                        </MainContent>
                        <DesktopFooter />
                        <DesktopAIChatPanel 
                            isOpen={isAIPanelOpen} 
                            onToggle={handleAIToggle} 
                        />
                        <LineMiniDAppModal
                            isOpen={activeModal === 'lineMiniDApp'}
                            onClose={() => closeModal()}
                        />
                    </MarketProvider>
                </MarketDataProvider>
            )}
        </AppContainer>
    )
}
