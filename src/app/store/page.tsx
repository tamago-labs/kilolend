"use client";

import {ItemCard} from "@/components/Item/ItemCard";
import styles from "./page.module.css";
import {usePaymentSdk} from "@/components/Store/Sdk/paymentSdk.hooks";
import {useCallback, useState} from "react";
import {useKaiaWalletSdk} from "@/components/Wallet/Sdk/walletSdk.hooks";
import {useWalletAccountStore} from "@/components/Wallet/Account/auth.hooks";
import {keiHexToKaiaDecimal, microUSDTHexToUSDTDecimal} from "@/utils/format";

const USDTContractAddress = '0xd077a400968890eacc75cdc901f0356c943e4fdb';

export default function Store () {
    const { openPaymentHistory } = usePaymentSdk();
    const { getBalance, getErc20TokenBalance } = useKaiaWalletSdk();
    const { account }= useWalletAccountStore();
    const [kaiaBalance, setKaiaBalance] = useState<number | string>('-');
    const [usdtBalance, setUsdtBalance] = useState<number | string>('-');
    const onPaymentHistoryButtonClick = useCallback(() => {
        openPaymentHistory();
    },[openPaymentHistory]);

    if(account){
        getBalance([account, 'latest']).then(balance => {
            const formattedKaiaBalance = Number(keiHexToKaiaDecimal(balance as string)).toFixed(4);
            setKaiaBalance(formattedKaiaBalance);
        })
        getErc20TokenBalance(USDTContractAddress, account).then(balance => {
            const formattedUSDTBalance = Number(microUSDTHexToUSDTDecimal(balance as string)).toFixed(2);
            setUsdtBalance(formattedUSDTBalance);
        })
    }
    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <div className={styles.balance}>
                    {kaiaBalance} KAIA
                </div>
                <div className={styles.balance}>
                    {usdtBalance} USDT
                </div>
                <button onClick={onPaymentHistoryButtonClick} className={styles.button}>payment history</button>
            </div>
            <div className={styles.body}>
                <ItemCard itemIdentifier="item_1" name="item_1" imageUrl='/images/logo.png' price={1} currencyCode="USD" />
                <ItemCard itemIdentifier="item_2" name="item_2" imageUrl='/images/logo.png' price={2} currencyCode="USD" />
            </div >
        </div>
    );
}