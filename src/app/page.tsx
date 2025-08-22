"use client";
import styles from "./page.module.css";
import {WalletButton} from "@/components/Wallet/Button/WalletButton";
import {useState} from "react";
import {useWalletAccountStore} from "@/components/Wallet/Account/auth.hooks";

export default function Home() {
    const { account } = useWalletAccountStore();
    const [count, setCount] = useState(0);

    return (
    <div className={styles.page}>
      <main className={styles.main}>
          {account?<button className={styles.button} onClick={()=> setCount(count=> count+1)}>{count} combo</button>
          :<WalletButton/>}
      </main>
    </div>
  );
}
