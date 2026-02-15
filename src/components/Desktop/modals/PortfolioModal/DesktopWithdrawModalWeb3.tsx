"use client";

import { DesktopBaseModal } from '../shared/DesktopBaseModal';
import {
    ModalContent,
    ModalSubtitle,
    MarketSelector,
    Label,
    Select,
    AmountInput,
    InputContainer,
    Input,
    MaxButton,
    BalanceInfo,
    PreviewSection,
    PreviewRow,
    PreviewLabel,
    PreviewValue,
    WarningBox,
    WarningText,
    ActionButton,
    CancelButton,
    LoadingSpinner,
    SuccessIcon,
    SuccessMessage,
    SuccessSubtext,
    TransactionDetails,
    DetailRow,
    DetailLabel,
    DetailValue,
    ClickableTransactionHash
} from './DesktopWithdrawModal.styles';
import { ExternalLink, Check } from 'react-feather';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useEffect, useState } from 'react';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract } from '@/hooks/v2/useMarketContract';
import { useBorrowingPowerV2 } from '@/hooks/v2/useBorrowingPower';
import { useWaitForTransactionReceipt } from 'wagmi';

type TransactionStep = 'preview' | 'confirmation' | 'success';


interface DesktopWithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedMarket?: any;
}

export const DesktopWithdrawModalWeb3 = ({ isOpen, onClose, preSelectedMarket }: DesktopWithdrawModalProps) => {


    const [selectedMarket, setSelectedMarket] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<TransactionStep>('preview');
    const [transactionResult, setTransactionResult] = useState<any>(null);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

    const { account } = useWalletAccountStore();
    const { markets } = useContractMarketStore();
    const { withdraw } = useMarketContract();
    const { calculateBorrowingPower, getUserPosition } = useBorrowingPowerV2();

    // Wait for transaction receipt
    const { data: receipt, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
        query: {
            enabled: !!txHash,
        },
    });

    useEffect(() => {
        preSelectedMarket && setSelectedMarket(preSelectedMarket);
    }, [preSelectedMarket, markets])

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setCurrentStep('preview');
            setIsProcessing(false);
            setError(null);
            setTransactionResult(null);
            setTxHash(undefined);
            setAmount('');
        }
    }, [isOpen]);

    // Handle transaction confirmation
    useEffect(() => {
        if (isConfirmed && receipt && txHash) {
            console.log('Transaction confirmed:', receipt);
            setTransactionResult({
                hash: txHash,
                status: 'confirmed'
            });
            setIsProcessing(false);
            setCurrentStep('success');
        }
    }, [isConfirmed, receipt, txHash]);

    const [borrowingPowerData, setBorrowingPowerData] = useState<any>(null);

    const selectedMarketPosition = (selectedMarket && getUserPosition) ? getUserPosition(selectedMarket.id) : null;
    const selectedMarketBalance = selectedMarketPosition?.supplyBalance || selectedMarketPosition?.suppliedBalance || '0';
    const amountNum = parseFloat(amount || '0');
    const amountUSD = selectedMarket ? amountNum * selectedMarket.price : 0;
    const remainingBalance = parseFloat(selectedMarketBalance) - amountNum;
    const remainingUSD = selectedMarket ? remainingBalance * selectedMarket.price : 0;

    // Calculate health factor impact
    useEffect(() => {
        const calculateImpact = async () => {
            if (!account || !selectedMarket || !amount) return;

            try {
                const currentBorrowingPower = await calculateBorrowingPower(account);
                setBorrowingPowerData(currentBorrowingPower);
            } catch (error) {
                console.error('Error calculating borrowing power:', error);
            }
        };

        calculateImpact();
    }, [account, selectedMarket, amount]);

    const currentHealthFactor = borrowingPowerData?.healthFactor ? parseFloat(borrowingPowerData.healthFactor) : 999;
    const totalCollateralValue = borrowingPowerData?.totalCollateralValue ? parseFloat(borrowingPowerData.totalCollateralValue) : 0;
    const totalBorrowValue = borrowingPowerData?.totalBorrowValue ? parseFloat(borrowingPowerData.totalBorrowValue) : 0;

    // Calculate new health factor after withdrawal
    const newTotalCollateralValue = totalCollateralValue - amountUSD;
    const newHealthFactor = totalBorrowValue > 0 ? newTotalCollateralValue / totalBorrowValue : 999;
    const healthFactorChange = newHealthFactor - currentHealthFactor;

    const handleMax = () => {
        setAmount(selectedMarketBalance);
    };


    const handleWithdraw = async () => {
        if (!selectedMarket || !account || !amount) return;

        setCurrentStep('confirmation');
        setIsProcessing(true);
        setError(null);

        try {
            // Execute withdraw
            const result = await withdraw(selectedMarket.id, amount);
            console.log("result hash :", result.hash);

            if (result.hash) {
                setTxHash(result.hash as `0x${string}`);
            }
        } catch (error: any) {
            console.error('Withdraw error:', error);
            setError(error.message || 'Withdraw failed');
            setIsProcessing(false);
        }
    };

    const isValid = selectedMarket && amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(selectedMarketBalance);


    const handleClose = () => {
        onClose();
    };

    const handleExternalLink = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const renderPreview = () => (
        <>
            <AmountInput>
                <Label>Amount</Label>
                <InputContainer>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                    />
                    <MaxButton onClick={handleMax}>MAX</MaxButton>
                </InputContainer>
                <BalanceInfo>
                    <span>Supplied: {parseFloat(selectedMarketBalance).toFixed(4)} {selectedMarket?.symbol}</span>
                    <span>${(parseFloat(selectedMarketBalance) * (selectedMarket?.price || 0)).toFixed(2)}</span>
                </BalanceInfo>
            </AmountInput>

            {amount && selectedMarket && (
                <PreviewSection>
                    <PreviewRow>
                        <PreviewLabel>Asset</PreviewLabel>
                        <PreviewValue>{selectedMarket.symbol}</PreviewValue>
                    </PreviewRow>
                    <PreviewRow>
                        <PreviewLabel>Withdraw Amount</PreviewLabel>
                        <PreviewValue>{amount} {selectedMarket.symbol}</PreviewValue>
                    </PreviewRow>
                    <PreviewRow>
                        <PreviewLabel>USD Value</PreviewLabel>
                        <PreviewValue>${amountUSD.toFixed(2)}</PreviewValue>
                    </PreviewRow>
                    <PreviewRow>
                        <PreviewLabel>Remaining Supply</PreviewLabel>
                        <PreviewValue>{remainingBalance.toFixed(4)} {selectedMarket.symbol}</PreviewValue>
                    </PreviewRow>
                    <PreviewRow>
                        <PreviewLabel>Remaining USD Value</PreviewLabel>
                        <PreviewValue>${remainingUSD.toFixed(2)}</PreviewValue>
                    </PreviewRow>
                    <PreviewRow>
                        <PreviewLabel>Supply APY</PreviewLabel>
                        <PreviewValue>{selectedMarket.supplyAPY.toFixed(2)}%</PreviewValue>
                    </PreviewRow>
                    {totalBorrowValue > 0 && (
                        <>
                            <PreviewRow>
                                <PreviewLabel>Current Health Factor</PreviewLabel>
                                <PreviewValue>{currentHealthFactor.toFixed(2)}</PreviewValue>
                            </PreviewRow>
                            <PreviewRow>
                                <PreviewLabel>New Health Factor</PreviewLabel>
                                <PreviewValue style={{ color: newHealthFactor < 1.5 ? '#ef4444' : healthFactorChange < 0 ? '#f59e0b' : '#06C755' }}>
                                    {newHealthFactor.toFixed(2)} {healthFactorChange < 0 ? `(${healthFactorChange.toFixed(2)})` : ''}
                                </PreviewValue>
                            </PreviewRow>
                        </>
                    )}
                </PreviewSection>
            )}

            {remainingBalance < parseFloat(selectedMarketBalance) * 0.2 && amount && (
                <WarningBox>
                    <WarningText>
                        ⚠️ Withdrawing this amount will significantly reduce your supplied balance. This may affect your borrowing capacity and health factor if you have active loans.
                    </WarningText>
                </WarningBox>
            )}

            <ActionButton
                $primary
                $disabled={!isValid || isProcessing}
                onClick={handleWithdraw}
            >
                {isProcessing && <LoadingSpinner />}
                {isProcessing ? 'Processing...' : 'Withdraw'}
            </ActionButton>

            <CancelButton onClick={handleClose} disabled={isProcessing}>
                Cancel
            </CancelButton>
        </>
    );

    const renderConfirmation = () => (
        <>
            <PreviewSection>
                <PreviewRow>
                    <PreviewLabel>Transaction</PreviewLabel>
                    <PreviewValue>Withdrawing {amount} {selectedMarket?.symbol}</PreviewValue>
                </PreviewRow>
                <PreviewRow>
                    <PreviewLabel>Status</PreviewLabel>
                    <PreviewValue>
                        {isProcessing && !isConfirmed ? (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <LoadingSpinner />
                                In Progress...
                            </div>
                        ) : error ? (
                            <span style={{ color: '#ef4444' }}>Failed</span>
                        ) : isConfirmed ? (
                            <span style={{ color: '#06C755' }}>Complete</span>
                        ) : (
                            <span style={{ color: '#64748b' }}>Processing...</span>
                        )}
                    </PreviewValue>
                </PreviewRow>
            </PreviewSection>

            {error && (
                <WarningBox>
                    <WarningText>❌ {error}</WarningText>
                </WarningBox>
            )}

            {!isProcessing && !transactionResult && !error && (
                <ActionButton onClick={() => setCurrentStep('preview')}>
                    Back to Preview
                </ActionButton>
            )}

            {error && (
                <ActionButton onClick={() => setCurrentStep('preview')}>
                    Try Again
                </ActionButton>
            )}
        </>
    );

    const renderSuccess = () => (
        <>
            <SuccessIcon>
                <Check size={40} />
            </SuccessIcon>
            <SuccessMessage>Withdrawal Successful!</SuccessMessage>
            <SuccessSubtext>
                You have successfully withdrawn {amount} {selectedMarket?.symbol}
            </SuccessSubtext>

            <TransactionDetails>
                <DetailRow>
                    <DetailLabel>Withdrawal Amount</DetailLabel>
                    <DetailValue>{amount} {selectedMarket?.symbol}</DetailValue>
                </DetailRow>
                <DetailRow>
                    <DetailLabel>USD Value</DetailLabel>
                    <DetailValue>${amountUSD.toFixed(2)}</DetailValue>
                </DetailRow>
                <DetailRow>
                    <DetailLabel>Supply APY</DetailLabel>
                    <DetailValue>{selectedMarket?.supplyAPY.toFixed(2)}%</DetailValue>
                </DetailRow>
                {transactionResult?.hash && (
                    <DetailRow>
                        <DetailLabel>Transaction</DetailLabel>
                        <ClickableTransactionHash onClick={() => handleExternalLink(`https://www.kaiascan.io/tx/${transactionResult.hash}`)}>
                            <DetailValue>{`${transactionResult.hash.slice(0, 6)}...${transactionResult.hash.slice(-4)}`}</DetailValue>
                            <ExternalLink size={12} />
                        </ClickableTransactionHash>
                    </DetailRow>
                )}
            </TransactionDetails>

            <ActionButton $primary onClick={handleClose}>
                Close
            </ActionButton>
        </>
    );

    const renderContent = () => {
        switch (currentStep) {
            case 'preview':
                return renderPreview();
            case 'confirmation':
                return renderConfirmation();
            case 'success':
                return renderSuccess();
            default:
                return renderPreview();
        }
    };

    return (
        <DesktopBaseModal isOpen={isOpen} onClose={handleClose} title="Withdraw Assets">
            <ModalContent>
                {renderContent()}
            </ModalContent>
        </DesktopBaseModal>
    )

}