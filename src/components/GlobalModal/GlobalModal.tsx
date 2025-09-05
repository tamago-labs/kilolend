'use client';

import { useState, useEffect, useMemo } from 'react';
import { useModalStore } from '@/stores/modalStore';
import { useContractMarketStore } from '@/stores/contractMarketStore';
import { useContractUserStore } from '@/stores/contractUserStore';
import { useUserStore } from '@/stores/userStore';
import useTokenBalances from '@/hooks/useTokenBalances';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';
import { useMarketContract } from '@/hooks/useMarketContract';
import { useTransactions } from '@/hooks/useTransactions';
import { validateMinimumAmount, validateDecimalPlaces } from '@/utils/tokenUtils';

import { ModalOverlay, ModalContent } from './styles';
import { CollateralModal } from './modals/CollateralModal';
import { SupplyBorrowModal } from './modals/SupplyBorrowModal';
import { BorrowModal } from './modals/BorrowModal';
import { CollateralDepositModal } from './modals/CollateralDepositModal';
import { AIModal } from './modals/AIModal';

interface GlobalModalProps {
  onAIDealsGenerated?: (userQuery: string) => void;
}

export const GlobalModal = ({ onAIDealsGenerated }: GlobalModalProps) => {
  // const { isOpen, type, data, closeModal, openModal } = useModalStore();
  const { isOpen, closeModal, openModal } = useModalStore();
  const { markets } = useContractMarketStore();
  const { positions, totalCollateralValue } = useContractUserStore();
  const { addTransaction } = useUserStore();
  const { account } = useWalletAccountStore();
  const { refreshBalances, getBalanceBySymbol } = useTokenBalances();
  const { executeSupply, executeBorrow, isProcessing } = useTransactions();
  const marketContract = useMarketContract();

  const [amount, setAmount] = useState('');
  // const [userQuery, setUserQuery] = useState(data?.userQuery || '');
  const [validationError, setValidationError] = useState('');
  // const [selectedCollateralType, setSelectedCollateralType] = useState<'wkaia' | 'stkaia'>(data?.collateralType || 'wkaia');

  // useEffect(() => {
  //   if (data?.userQuery) {
  //     setUserQuery(data.userQuery);
  //   }
  // }, [data?.userQuery]);

  // if (!isOpen || !type) return null;

  // const currentMarket = data?.marketId ? markets.find(m => m.id === data.marketId) : null;
  // const currentTokenBalance = currentMarket ? getBalanceBySymbol(currentMarket.symbol as any) : null;
  // const collateralTokenBalance = getBalanceBySymbol(selectedCollateralType.toUpperCase() as any);
  // const currentRate = currentMarket && data?.action ?
  //   (data.action === 'supply' ? currentMarket.supplyAPY : currentMarket.borrowAPR) : 0;

  let userCollateral = { wkaia: 0, stkaia: 0, total: 0 };

  // if (account && currentMarket) {
 
  //   const collateralPositions = positions.filter(
  //     (p) => p.marketId === currentMarket.id
  //   );
 
  //   const wkaia = collateralPositions
  //     .reduce((sum, p) => sum + parseFloat(p.wkaiaCollateral || '0'), 0);

  //   const stkaia = collateralPositions
  //     .reduce((sum, p) => sum + parseFloat(p.stkaiaCollateral || '0'), 0);

  //   userCollateral = {
  //     wkaia,
  //     stkaia,
  //     total: totalCollateralValue
  //   };
  // }


  const validateAmount = (inputAmount: string, balance: string | null) => {
    setValidationError('');

    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setValidationError('Amount must be greater than 0');
      return false;
    }

    // if (currentMarket && type !== 'deposit-collateral' && type !== 'withdraw-collateral') {
    //   const decimalValidation = validateDecimalPlaces(inputAmount, currentMarket.id as any);
    //   if (!decimalValidation.isValid) {
    //     setValidationError(decimalValidation.error!);
    //     return false;
    //   }

    //   const minValidation = validateMinimumAmount(currentMarket.id as any, inputAmount);
    //   if (!minValidation.isValid) {
    //     setValidationError(minValidation.error!);
    //     return false;
    //   }
    // }

    // if (type === 'supply' && balance) {
    //   const numBalance = parseFloat(balance);
    //   const numAmount = parseFloat(inputAmount);

    //   if (numAmount > numBalance) {
    //     setValidationError('Insufficient balance');
    //     return false;
    //   }
    // }

    return true;
  };

  // const handleAmountChange = (value: string) => {
  //   setAmount(value);

  //   if (type === 'supply' || type === 'borrow') {
  //     validateAmount(value, currentTokenBalance?.balance || null);
  //   }
  // };

  // const handleMaxClick = () => {
  //   if (type === 'supply' && currentTokenBalance?.balance) {
  //     const balance = parseFloat(currentTokenBalance.balance);
  //     const maxAmount = currentMarket?.symbol === 'KAIA'
  //       ? Math.max(0, balance - 0.001)
  //       : balance * 0.95;

  //     const maxAmountStr = maxAmount.toFixed(6);
  //     setAmount(maxAmountStr);
  //     validateAmount(maxAmountStr, currentTokenBalance.balance);
  //   }
  // };

  // const calculateTransactionFee = () => 0.0001;
  // const calculateMonthlyReturn = () => {
  //   if (!amount || !currentRate) return 0;
  //   return (parseFloat(amount) * currentRate / 100 / 12);
  // };

  // const handleQuickActionSubmit = async () => {
  //   if (!data || !currentMarket || !amount) return;

  //   if (!validateAmount(amount, currentTokenBalance?.balance || null)) return;

  //   if (!account) {
  //     setValidationError('Please connect your wallet first');
  //     return;
  //   }

  //   try {
  //     setValidationError('');

  //     let result: any;
  //     if (data.action === 'supply') {
  //       result = await executeSupply(currentMarket.id as any, amount);
  //     } else {
  //       result = await executeBorrow(currentMarket.id as any, amount);
  //     }

  //     if (result.success) {
  //       addTransaction({
  //         type: data.action!,
  //         marketId: data.marketId!,
  //         amount: parseFloat(amount),
  //         status: 'confirmed',
  //         usdValue: parseFloat(amount) * currentMarket.price,
  //         txHash: result.hash!
  //       });

  //       closeModal();
  //       setAmount('');
  //       setValidationError('');
  //     } else {
  //       setValidationError(result.error || 'Transaction failed');
  //     }
  //   } catch (error: any) {
  //     setValidationError(error.message || 'Transaction failed');
  //   }
  // };

  // const handleCollateralSubmit = async () => {
  //   if (!amount || !account) return;

  //   try {
  //     setValidationError('');

  //     let result: any;
  //     if (data?.collateralAction === 'deposit') {
  //       result = await marketContract.depositCollateral('usdt', selectedCollateralType, amount);
  //     } else {
  //       result = await marketContract.withdrawCollateral('usdt', selectedCollateralType, amount);
  //     }

  //     if (result.status !== 'failed') {
  //       addTransaction({
  //         type: data?.collateralAction === 'deposit' ? 'supply' : 'withdraw',
  //         marketId: selectedCollateralType,
  //         amount: parseFloat(amount),
  //         status: 'confirmed',
  //         usdValue: parseFloat(amount) * (selectedCollateralType === 'wkaia' ? 0.11 : 0.12),
  //         txHash: result.hash
  //       });

  //       closeModal();
  //       setAmount('');
  //       setValidationError('');
  //     } else {
  //       setValidationError(result.error || 'Collateral transaction failed');
  //     }
  //   } catch (error: any) {
  //     setValidationError(error.message || 'Collateral transaction failed');
  //   }
  // };

  // const handleAISubmit = () => {
  //   if (!userQuery.trim()) return;

  //   closeModal();
  //   onAIDealsGenerated?.(userQuery);
  //   setUserQuery('');
  // };

  // const handleExampleClick = (example: string) => {
  //   setUserQuery(example);
  // };

  // Handle collateral deposit from borrow modal
  // const handleDepositCollateral = (collateralType: 'wkaia' | 'stkaia') => {
  //   openModal('deposit-collateral', {
  //     marketId: data?.marketId,
  //     collateralType,
  //     collateralAction: 'deposit'
  //   });
  // };

  // Handle collateral withdraw from borrow modal
  // const handleWithdrawCollateral = (collateralType: 'wkaia' | 'stkaia') => {
  //   openModal('withdraw-collateral', {
  //     marketId: data?.marketId,
  //     collateralType,
  //     collateralAction: 'withdraw'
  //   });
  // };

  const handleCollateralSuccess = () => {
    refreshBalances();
    // Optionally refresh user positions
  };

  // const renderModalContent = () => {
  //   switch (type) {
  //     case 'deposit-collateral':
  //       return (
  //         <CollateralDepositModal
  //           collateralType={data?.collateralType || 'wkaia'}
  //           marketId={data?.marketId || 'usdt'}
  //           account={account}
  //           collateralTokenBalance={collateralTokenBalance}
  //           refreshBalances={refreshBalances}
  //           closeModal={closeModal}
  //           onSuccess={handleCollateralSuccess}
  //         />
  //       );

  //     case 'withdraw-collateral':
  //       return (
  //         <CollateralModal
  //           type={type}
  //           account={account}
  //           selectedCollateralType={selectedCollateralType}
  //           setSelectedCollateralType={setSelectedCollateralType}
  //           collateralTokenBalance={collateralTokenBalance}
  //           refreshBalances={refreshBalances}
  //           amount={amount}
  //           handleAmountChange={handleAmountChange}
  //           handleMaxClick={handleMaxClick}
  //           validationError={validationError}
  //           calculateTransactionFee={calculateTransactionFee}
  //           isProcessing={isProcessing}
  //           closeModal={closeModal}
  //           handleCollateralSubmit={handleCollateralSubmit}
  //         />
  //       );

  //     case 'supply':
  //       return (
  //         <SupplyBorrowModal
  //           type={type}
  //           currentMarket={currentMarket}
  //           data={data}
  //           account={account}
  //           currentTokenBalance={currentTokenBalance}
  //           refreshBalances={refreshBalances}
  //           amount={amount}
  //           handleAmountChange={handleAmountChange}
  //           handleMaxClick={handleMaxClick}
  //           validationError={validationError}
  //           currentRate={currentRate}
  //           calculateMonthlyReturn={calculateMonthlyReturn}
  //           calculateTransactionFee={calculateTransactionFee}
  //           isProcessing={isProcessing}
  //           closeModal={closeModal}
  //           handleQuickActionSubmit={handleQuickActionSubmit}
  //         />
  //       );

  //     case 'borrow':
  //       return (
  //         <BorrowModal
  //           currentMarket={currentMarket}
  //           data={data}
  //           account={account}
  //           currentTokenBalance={currentTokenBalance}
  //           refreshBalances={refreshBalances}
  //           amount={amount}
  //           handleAmountChange={handleAmountChange}
  //           validationError={validationError}
  //           currentRate={currentRate}
  //           calculateMonthlyReturn={calculateMonthlyReturn}
  //           calculateTransactionFee={calculateTransactionFee}
  //           isProcessing={isProcessing}
  //           closeModal={closeModal}
  //           handleQuickActionSubmit={handleQuickActionSubmit}
  //           userCollateral={userCollateral}
  //           onDepositCollateral={handleDepositCollateral}
  //           onWithdrawCollateral={handleWithdrawCollateral}
  //         />
  //       );

  //     case 'ai-chat':
  //       return (
  //         <AIModal
  //           userQuery={userQuery}
  //           setUserQuery={setUserQuery}
  //           handleExampleClick={handleExampleClick}
  //           handleAISubmit={handleAISubmit}
  //           closeModal={closeModal}
  //         />
  //       );

  //     default:
  //       return null;
  //   }
  // };

  return (
    <ModalOverlay onClick={closeModal}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {/* {renderModalContent()} */}
      </ModalContent>
    </ModalOverlay>
  );
};
