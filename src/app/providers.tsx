"use client"

import { config } from '@/wagmi_config';
import { WagmiProvider } from 'wagmi'
import { AuthProvider } from '@/contexts/ChainContext';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/components/Query/QueryClient.hooks";

const Providers = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <WagmiProvider config={config}>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </AuthProvider> 
        </WagmiProvider>
    )
}

export default Providers