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
    SuccessBox,
    SuccessText,
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
} from './DesktopRepayModal.styles';
import { ExternalLink, Check } from 'react-feather';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useEffect, useState } from 'react';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useMarketContract, getMarketConfig } from '@/hooks/v2/useMarketContract';
import { useBorrowingPowerV2 } from '@/hooks/v2/useBorrowingPower';
import { useTokenApprovalWeb3 } from '@/hooks/v2/useTokenApprovalWeb3';
import { useWaitForTransactionReceipt } from 'wagmi';

type TransactionStep = 'preview' | 'confirmation' | 'success';


interface DesktopRepayModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedMarket?: any;
}

export const DesktopRepayModalWeb3 = ({ isOpen, onClose, preSelectedMarket }: DesktopRepayModalProps) => {
    const [selectedMarket, setSelectedMarket] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<TransactionStep>('preview');
    const [transactionResult, setTransactionResult] = useState<any>(null);
    const [needsApproval, setNeedsApproval] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [repayTxHash, setRepayTxHash] = useState<`0x${string}` | undefined>(undefined);

    const { account } = useWalletAccountStore();
    const { markets } = useContractMarketStore();
    const { repay } = useMarketContract();
    const { calculateBorrowingPower, getUserPosition } = useBorrowingPowerV2();
    const { checkAllowance, approveToken } = useTokenApprovalWeb3();

    // Wait for approval transaction receipt
    const { isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
        hash: approvalTxHash,
        query: {
            enabled: !!approvalTxHash,
        },
    });

    // Wait for repay transaction receipt
    const { data: receipt, isSuccess: isRepayConfirmed } = useWaitForTransactionReceipt({
        hash: repayTxHash,
        query: {
            enabled: !!repayTxHash,
        },
    });

    useEffect(() => {
        if (preSelectedMarket) {
            setSelectedMarket(preSelectedMarket);
        } else if (markets.length > 0) {
            // Filter to only show markets where user has borrowed tokens
            const borrowedMarkets = markets.filter(market => {
                const position = getUserPosition && getUserPosition(market.id);
                return position && (parseFloat(position.borrowBalance || '0') > 0 || parseFloat(position.borrowedBalance || '0') > 0);
            });
            setSelectedMarket(borrowedMarkets[0] || markets[0]);
        }
    }, [preSelectedMarket, markets, getUserPosition]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setCurrentStep('preview');
            setIsProcessing(false);
            setError(null);
            setTransactionResult(null);
            setNeedsApproval(false);
            setApprovalTxHash(undefined);
            setRepayTxHash(undefined);
            setIsApproving(false);
            setAmount('');
        }
    }, [isOpen]);

    // Handle approval confirmation - proceed to repay
    useEffect(() => {
        console.log("Handle approval confirmation ", isApprovalConfirmed, isApproving, approvalTxHash, repayTxHash)
        if (isApprovalConfirmed && approvalTxHash && !repayTxHash) {
            console.log('Approval confirmed, proceeding to repay');
            executeRepay();
        }
    }, [isApprovalConfirmed, approvalTxHash, repayTxHash]);

    // Handle repay transaction confirmation
    useEffect(() => {
        if (isRepayConfirmed && receipt && repayTxHash) {
            console.log('Repay transaction confirmed:', receipt);
            setTransactionResult({
                hash: repayTxHash,
                status: 'confirmed'
            });
            setIsProcessing(false);
            setCurrentStep('success');
        }
    }, [isRepayConfirmed, receipt, repayTxHash]);

    const selectedMarketPosition = (selectedMarket && getUserPosition) ? getUserPosition(selectedMarket.id) : null;
    const selectedMarketDebt = selectedMarketPosition?.borrowBalance || selectedMarketPosition?.borrowedBalance || '0';
    const amountNum = parseFloat(amount || '0');
    const amountUSD = selectedMarket ? amountNum * selectedMarket.price : 0;
    const remainingDebt = parseFloat(selectedMarketDebt) - amountNum;
    const remainingUSD = selectedMarket ? remainingDebt * selectedMarket.price : 0;
    const isFullRepayment = amountNum >= parseFloat(selectedMarketDebt) * 0.99;

    const [borrowingPowerData, setBorrowingPowerData] = useState<any>(null);

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

    // Calculate new health factor after repayment
    const newTotalBorrowValue = totalBorrowValue - amountUSD;
    const newHealthFactor = newTotalBorrowValue > 0 ? totalCollateralValue / newTotalBorrowValue : 999;
    const healthFactorChange = newHealthFactor - currentHealthFactor;
 
    const handleMax = () => {
        setAmount(selectedMarketDebt);
    };

    const executeRepay = async () => {
        try {
            const result = await repay(selectedMarket.id, amount);
            console.log("Repay transaction hash:", result.hash);

            if (result.hash) {
                setRepayTxHash(result.hash as `0x${string}`);
            }
        } catch (error: any) {
            console.error('Repay error:', error);
            setError(error.message || 'Repay failed');
            setIsProcessing(false);
            setIsApproving(false);
        }
    };

    const handleRepay = async () => {
        if (!selectedMarket || !account || !amount) return;

        setCurrentStep('confirmation');
        setIsProcessing(true);
        setError(null);
        setIsApproving(false);

        try {
            // Get market config to get tokenAddress
            const marketConfig = getMarketConfig(selectedMarket.id);
            if (!marketConfig) {
                throw new Error('Market config not found');
            }

            // Check if token approval is needed (for ERC20 tokens)
            if (marketConfig.tokenAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
                const approvalStatus = await checkAllowance(selectedMarket.id, amount);
                if (!approvalStatus.hasEnoughAllowance) {
                    setNeedsApproval(true);
                    setIsApproving(true);

                    const approvalResult = await approveToken(selectedMarket.id, amount);
                    if (!approvalResult.success) {
                        throw new Error(approvalResult.error || 'Approval failed');
                    }

                    // Set approval transaction hash for receipt tracking
                    if (approvalResult.hash) {
                        setApprovalTxHash(approvalResult.hash as `0x${string}`);
                        console.log('Approval transaction sent, hash:', approvalResult.hash);
                    }

                    // The approval transaction will be confirmed by useEffect, then proceed to repay
                    return;
                }
            }

            // Execute repay directly if no approval needed or native token
            await executeRepay();

        } catch (error: any) {
            console.error('Repay error:', error);
            setError(error.message || 'Repayment failed');
            setIsProcessing(false);
            setIsApproving(false);
        }
    };

    const handleClose = () => {
        if (currentStep === 'success') {
            onClose();
        } else {
            onClose();
        }
    };

    const handleExternalLink = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const isValid = selectedMarket && amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(selectedMarketDebt);

    // Filter markets to only show those where user has borrowed tokens
    const availableMarkets = markets.filter(market => {
        const position = getUserPosition && getUserPosition(market.id);
        return position && (parseFloat(position.borrowBalance || '0') > 0 || parseFloat(position.borrowedBalance || '0') > 0);
    });

    const renderPreview = () => (
        <>
            {!preSelectedMarket && (
                <MarketSelector>
                    <Label>Select Asset</Label>
                    <Select
                        value={selectedMarket?.id || ''}
                        onChange={(e) => {
                            const market = markets.find(m => m.id === e.target.value);
                            setSelectedMarket(market);
                            setAmount('');
                        }}
                    >
                        <option value="">Choose an asset</option>
                        {availableMarkets.map(market => (
                            <option key={market.id} value={market.id}>
                                {market.symbol} - {market.borrowAPR.toFixed(2)}% APR
                            </option>
                        ))}
                    </Select>
                </MarketSelector>
            )}

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
                    <span>Current Debt: {parseFloat(selectedMarketDebt).toFixed(4)} {selectedMarket?.symbol}</span>
                    <span>${(parseFloat(selectedMarketDebt) * (selectedMarket?.price || 0)).toFixed(2)}</span>
                </BalanceInfo>
            </AmountInput>

            {amount && selectedMarket && (
                <>
                    <PreviewSection>
                        <PreviewRow>
                            <PreviewLabel>Asset</PreviewLabel>
                            <PreviewValue>{selectedMarket.symbol}</PreviewValue>
                        </PreviewRow>
                        <PreviewRow>
                            <PreviewLabel>Repay Amount</PreviewLabel>
                            <PreviewValue>{amount} {selectedMarket.symbol}</PreviewValue>
                        </PreviewRow>
                        <PreviewRow>
                            <PreviewLabel>USD Value</PreviewLabel>
                            <PreviewValue>${amountUSD.toFixed(2)}</PreviewValue>
                        </PreviewRow>
                        <PreviewRow>
                            <PreviewLabel>Current Debt</PreviewLabel>
                            <PreviewValue>{parseFloat(selectedMarketDebt).toFixed(4)} {selectedMarket.symbol}</PreviewValue>
                        </PreviewRow>
                        <PreviewRow>
                            <PreviewLabel>Remaining Debt</PreviewLabel>
                            <PreviewValue>{Math.max(0, remainingDebt).toFixed(4)} {selectedMarket.symbol}</PreviewValue>
                        </PreviewRow>
                        <PreviewRow>
                            <PreviewLabel>Remaining USD Value</PreviewLabel>
                            <PreviewValue>${Math.max(0, remainingUSD).toFixed(2)}</PreviewValue>
                        </PreviewRow>
                        <PreviewRow>
                            <PreviewLabel>Borrow APR</PreviewLabel>
                            <PreviewValue>{selectedMarket.borrowAPR.toFixed(2)}%</PreviewValue>
                        </PreviewRow>
                        {totalBorrowValue > 0 && (
                            <>
                                <PreviewRow>
                                    <PreviewLabel>Current Health Factor</PreviewLabel>
                                    <PreviewValue>{currentHealthFactor.toFixed(2)}</PreviewValue>
                                </PreviewRow>
                                <PreviewRow>
                                    <PreviewLabel>New Health Factor</PreviewLabel>
                                    <PreviewValue style={{ color: healthFactorChange > 0 ? '#06C755' : newHealthFactor < 1.5 ? '#ef4444' : '#1e293b' }}>
                                        {newHealthFactor.toFixed(2)} {healthFactorChange > 0 ? `(+${healthFactorChange.toFixed(2)})` : ''}
                                    </PreviewValue>
                                </PreviewRow>
                            </>
                        )}
                        
                    </PreviewSection>

                    {isFullRepayment && (
                        <SuccessBox>
                            <SuccessText>
                                ✅ Full repayment! You will completely clear your debt for {selectedMarket.symbol}. This will improve your health factor and borrowing capacity.
                            </SuccessText>
                        </SuccessBox>
                    )}

                    {!isFullRepayment && remainingDebt > 0 && (
                        <WarningBox>
                            <WarningText>
                                ⚠️ Partial repayment. You will still have {remainingDebt.toFixed(4)} {selectedMarket.symbol} remaining debt. Consider full repayment to maximize your borrowing capacity.
                            </WarningText>
                        </WarningBox>
                    )}
                </>
            )}

            {needsApproval && isApproving && (
                <WarningBox>
                    <WarningText>
                        ⚠️ You need to approve {selectedMarket?.symbol} spending before repaying. This will require a separate transaction.
                    </WarningText>
                </WarningBox>
            )}

            {error && !isProcessing && (
                <WarningBox>
                    <WarningText>❌ {error}</WarningText>
                </WarningBox>
            )}

            <ActionButton
                $primary
                $disabled={!isValid || isProcessing}
                onClick={handleRepay}
            >
                {isProcessing && <LoadingSpinner />}
                {isProcessing ? 'Processing...' : isFullRepayment ? 'Repay Full Amount' : 'Repay'}
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
                    <PreviewValue>{isApproving ? 'Approving' : 'Repaying'} {amount} {selectedMarket?.symbol}</PreviewValue>
                </PreviewRow>
                <PreviewRow>
                    <PreviewLabel>Status</PreviewLabel>
                    <PreviewValue>
                        {(isProcessing && isApproving && !isApprovalConfirmed) ? (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <LoadingSpinner />
                                Approving...
                            </div>
                        ) : (isProcessing && !isApproving && !isRepayConfirmed) ? (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <LoadingSpinner />
                                Repaying...
                            </div>
                        ) : error ? (
                            <span style={{ color: '#ef4444' }}>Failed</span>
                        ) : isRepayConfirmed ? (
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
            <SuccessMessage>Repayment Successful!</SuccessMessage>
            <SuccessSubtext>
                You have successfully repaid {amount} {selectedMarket?.symbol}
            </SuccessSubtext>

            <TransactionDetails>
                <DetailRow>
                    <DetailLabel>Repayment Amount</DetailLabel>
                    <DetailValue>{amount} {selectedMarket?.symbol}</DetailValue>
                </DetailRow>
                <DetailRow>
                    <DetailLabel>USD Value</DetailLabel>
                    <DetailValue>${amountUSD.toFixed(2)}</DetailValue>
                </DetailRow>
                <DetailRow>
                    <DetailLabel>Borrow APR</DetailLabel>
                    <DetailValue>{selectedMarket?.borrowAPR.toFixed(2)}%</DetailValue>
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
        <DesktopBaseModal isOpen={isOpen} onClose={handleClose} title="Repay Assets">
            <ModalContent>
                {renderContent()}
            </ModalContent>
        </DesktopBaseModal>
    )

}