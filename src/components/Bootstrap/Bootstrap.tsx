"use client";

import {ReactNode, useEffect} from "react";
import {useKaiaWalletSecurity} from "@/components/Wallet/Sdk/walletSdk.hooks";

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
        <div className={className}>{isSuccess && children}</div>
    )
}

