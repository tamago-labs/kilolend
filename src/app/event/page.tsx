"use client";

import {useCallback} from "react";
import {liff} from "@/utils/liff";
import {useShareTargetPicker} from "@/components/Invitation/Invitation.hooks";
import styles from "./page.module.css";

export default function Event () {
    const { mutateAsync: openShareTargetPicker } = useShareTargetPicker();
    const onInvitationButtonClick = useCallback(() => {
        if(liff.isInClient()){
            openShareTargetPicker();
        }
        else{
            navigator.clipboard.writeText('https://dapp-starter.netlify.app').then(()=> alert('URL Copy Success!')).catch(() => alert('URL Copy Failed!'));
        }

    },[openShareTargetPicker]);
    return (
        <div className={styles.root}>
            <button onClick={onInvitationButtonClick} className={styles.button}>Invite Friends</button>
        </div>
    );
}