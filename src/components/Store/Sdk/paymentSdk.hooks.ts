import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import {useKaiaWalletSdkStore} from "@/components/Wallet/Sdk/walletSdk.hooks";

export type PG_TYPE = 'CRYPTO' | 'STRIPE';
export type CurrencyCode = 'USD'| 'KRW'|'JPY'|'TWD'|'THB'|'KAIA' |'USDT';
export type Item = {
  itemIdentifier: string,
  name: string,
  imageUrl: string,
  price: number,
  currencyCode: CurrencyCode,
}
export type Payment = {
  buyerDappPortalAddress: string,
  pgType: PG_TYPE,
  currencyCode: CurrencyCode,
  price: number,
  items: Item[],
  testMode: boolean,
}

export const useCreatePaymentId = ()=> {
  return useMutation({mutationFn:async(data:Payment)=>await axios.post('/api/payment/create',data)});
};

export const useFinalizePayment = ()=>{
  return useMutation({mutationFn:async(data:{id:string}) => await axios.post('/api/payment/finalize',data)})
}

export const usePaymentSdk = () => {
  const { sdk } = useKaiaWalletSdkStore();
  if (!sdk) {
    throw new Error('KaiaWalletSdk is not initialized');
  }

  const paymentProvider = sdk.getPaymentProvider();

  const startPayment = async (paymentId: string) => {
    try {
      await paymentProvider.startPayment(paymentId);
      const { data } = await axios(`/api/payment/status?id=${paymentId}`);
      if (data.status === 'CONFIRMED' || data.status === 'FINALIZED') {
        alert('Payment finished successfully');
      } else {
        alert(`Payment finished failed: ${data.status}`);
      }
    }
    catch(error){
      alert(JSON.stringify(error));
    }
  };

  const openPaymentHistory = async () => {
    try {
      await paymentProvider.openPaymentHistory();
    }
    catch(error){
      console.error(error);
    }
  }

  return { startPayment, openPaymentHistory };
}