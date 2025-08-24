import { useCallback } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI } from '@/utils/contractABIs';
import { getContract, parseTokenAmount, sendTransaction, TransactionResult } from '@/utils/contractUtils';

interface TokenContractHook {
  getBalance: (tokenAddress: string, userAddress: string) => Promise<string>;
  getAllowance: (tokenAddress: string, userAddress: string, spenderAddress: string) => Promise<string>;
  approve: (tokenAddress: string, spenderAddress: string, amount: string, decimals: number) => Promise<TransactionResult>;
  transfer: (tokenAddress: string, toAddress: string, amount: string, decimals: number) => Promise<TransactionResult>;
  getTokenInfo: (tokenAddress: string) => Promise<{name: string, symbol: string, decimals: number}>;
}

export const useTokenContract = (): TokenContractHook => {
  
  const getBalance = useCallback(async (tokenAddress: string, userAddress: string): Promise<string> => {
    try {
      const contract = await getContract(tokenAddress, ERC20_ABI, false);
      if (!contract) throw new Error('Failed to create contract instance');
      
      const balance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }, []);
  
  const getAllowance = useCallback(async (
    tokenAddress: string, 
    userAddress: string, 
    spenderAddress: string
  ): Promise<string> => {
    try {
      const contract = await getContract(tokenAddress, ERC20_ABI, false);
      if (!contract) throw new Error('Failed to create contract instance');
      
      const allowance = await contract.allowance(userAddress, spenderAddress);
      const decimals = await contract.decimals();
      
      return ethers.formatUnits(allowance, decimals);
    } catch (error) {
      console.error('Error getting allowance:', error);
      return '0';
    }
  }, []);
  
  const approve = useCallback(async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    decimals: number
  ): Promise<TransactionResult> => {
    try {
      const contract = await getContract(tokenAddress, ERC20_ABI, true);
      if (!contract) throw new Error('Failed to create contract instance with signer');
      
      const parsedAmount = parseTokenAmount(amount, decimals);
      return await sendTransaction(contract, 'approve', [spenderAddress, parsedAmount]);
    } catch (error: any) {
      console.error('Error approving token:', error);
      return {
        hash: '',
        status: 'failed' as const,
        error: error.message || 'Approval failed'
      } as any;
    }
  }, []);
  
  const transfer = useCallback(async (
    tokenAddress: string,
    toAddress: string,
    amount: string,
    decimals: number
  ): Promise<TransactionResult> => {
    try {
      const contract = await getContract(tokenAddress, ERC20_ABI, true);
      if (!contract) throw new Error('Failed to create contract instance with signer');
      
      const parsedAmount = parseTokenAmount(amount, decimals);
      return await sendTransaction(contract, 'transfer', [toAddress, parsedAmount]);
    } catch (error: any) {
      console.error('Error transferring token:', error);
      return {
        hash: '',
        status: 'failed' as const,
        error: error.message || 'Transfer failed'
      } as any;
    }
  }, []);
  
  const getTokenInfo = useCallback(async (tokenAddress: string) => {
    try {
      const contract = await getContract(tokenAddress, ERC20_ABI, false);
      if (!contract) throw new Error('Failed to create contract instance');
      
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);
      
      return {
        name: name as string,
        symbol: symbol as string,
        decimals: Number(decimals)
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return {
        name: '',
        symbol: '',
        decimals: 18
      };
    }
  }, []);
  
  return {
    getBalance,
    getAllowance,
    approve,
    transfer,
    getTokenInfo
  };
};
