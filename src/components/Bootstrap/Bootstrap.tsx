"use client";

import {ReactNode, useEffect} from "react";
import {useKaiaWalletSecurity} from "@/components/Wallet/Sdk/walletSdk.hooks";
import styled from 'styled-components';
import { Header } from '@/components/Header/Header';
import { MarketDataProvider } from '@/components/MarketDataProvider';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  flex-direction: column;
  margin: auto;
  max-width: 600px;
  position: relative;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export type BootstrapProps = {
    className?: string;
    children?: ReactNode;
}

export const Bootstrap = ({className, children}: BootstrapProps) => {
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
                    <Header />
                    <MainContent>
                        {children}
                    </MainContent>
                </MarketDataProvider>
            )}
        </AppContainer>
    )
}
