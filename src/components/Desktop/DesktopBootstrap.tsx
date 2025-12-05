"use client";

import {ReactNode, useEffect} from "react";
import {useKaiaWalletSecurity} from "@/components/Wallet/Sdk/walletSdk.hooks";
import styled from 'styled-components';
import { DesktopHeader } from './DesktopHeader';
import { MarketDataProvider } from '@/components/MarketDataProvider';

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

export const DesktopBootstrap = ({className, children}: DesktopBootstrapProps) => {
    const { isSuccess } = useKaiaWalletSecurity();

    useEffect(() => {
        const preventGoBack = () => {
            if(window.location.pathname === '/') {
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

    return (
        <AppContainer className={className}>
            {isSuccess && (
                <MarketDataProvider>
                    <DesktopHeader />
                    <MainContent>
                        {children}
                    </MainContent>
                </MarketDataProvider>
            )}
        </AppContainer>
    )
}
