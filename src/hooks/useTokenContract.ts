import { useCallback } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI } from '@/utils/contractABIs';
import { getContract, parseTokenAmount } from '@/utils/contractUtils';
import { useKaiaWalletSdk } from '@/components/Wallet/Sdk/walletSdk.hooks';
import { useWalletAccountStore } from '@/components/Wallet/Account/auth.hooks';

// Updated TransactionResult for LINE MiniDapp
export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
}

interface TokenContractHook {
  getBalance: (tokenAddress: string, userAddress: string) => Promise<string>;
  getAllowance: (tokenAddress: string, userAddress: string, spenderAddress: string) => Promise<string>;
  approve: (tokenAddress: string, spenderAddress: string, amount: string, decimals: number) => Promise<TransactionResult>;
  transfer: (tokenAddress: string, toAddress: string, amount: string, decimals: number) => Promise<TransactionResult>;
  getTokenInfo: (tokenAddress: string) => Promise<{name: string, symbol: string, decimals: number}>;
}

export const useTokenContract = (): TokenContractHook => {
  const { sendTransaction } = useKaiaWalletSdk();
  const { account } = useWalletAccountStore();
  
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
      // Validate addresses
      if (!tokenAddress || !userAddress || !spenderAddress || 
          tokenAddress === 'null' || userAddress === 'null' || spenderAddress === 'null') {
        console.error('Invalid addresses provided to getAllowance:', {
          tokenAddress,
          userAddress,
          spenderAddress
        });
        return '0';
      }
      
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
   
  const sendTokenTransaction = useCallback(
    async (tokenAddress: string, methodName: string, args: any[]): Promise<TransactionResult> => {
      try {
        if (!account) {
          throw new Error('Wallet not connected');
        }

        // Create contract interface for encoding transaction data
        const iface = new ethers.Interface(ERC20_ABI);
        const data = iface.encodeFunctionData(methodName, args);

        // Prepare transaction for LINE MiniDapp
        const transaction = {
          from: account,
          to: tokenAddress,
          value: '0x0', // No ETH value for ERC20 operations
          gas: '0x186A0', // 100000 gas limit - adjust as needed
          data: data
        };

        console.log(`Sending ${methodName} transaction:`, {
          to: tokenAddress,
          methodName,
          args,
          data
        });

        // Send transaction through Kaia Wallet SDK
        await sendTransaction([transaction]);
        
        return {
          hash: '', // Hash not immediately available in LINE MiniDapp
          status: 'confirmed'
        };

      } catch (error: any) {
        console.error(`Error during ${methodName}:`, error);
        return {
          hash: '',
          status: 'failed',
          error: error.message || `${methodName} failed`
        };
      }
    },
    [account, sendTransaction]
  );
  
  const approve = useCallback(async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    decimals: number
  ): Promise<TransactionResult> => {
    try {
      const parsedAmount = parseTokenAmount(amount, decimals);
      return await sendTokenTransaction(tokenAddress, 'approve', [spenderAddress, parsedAmount]);
    } catch (error: any) {
      console.error('Error approving token:', error);
      return {
        hash: '',
        status: 'failed',
        error: error.message || 'Approval failed'
      };
    }
  }, [sendTokenTransaction]);
  
  const transfer = useCallback(async (
    tokenAddress: string,
    toAddress: string,
    amount: string,
    decimals: number
  ): Promise<TransactionResult> => {
    try {
      const parsedAmount = parseTokenAmount(amount, decimals);
      return await sendTokenTransaction(tokenAddress, 'transfer', [toAddress, parsedAmount]);
    } catch (error: any) {
      console.error('Error transferring token:', error);
      return {
        hash: '',
        status: 'failed',
        error: error.message || 'Transfer failed'
      };
    }
  }, [sendTokenTransaction]);
  
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