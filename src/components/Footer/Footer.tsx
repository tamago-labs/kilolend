"use client"

import styles from "./Footer.module.css";
import { clsx } from 'clsx';
import Link from 'next/link'
import {usePathname} from "next/navigation";
export type FooterProps = {
    className?:string;
}
export const Footer = ({className}:FooterProps) => {
    const pathname = usePathname();
    return (
        <div className={clsx(styles.root,className)}>
            <Link href="/" className={clsx(styles.menu,{[styles.active]: pathname==="/"})}>HOME</Link>
            <Link href="/store" className={clsx(styles.menu,{[styles.active]: pathname==="/store"})}>STORE</Link>
            <Link href="/event" className={clsx(styles.menu,{[styles.active]: pathname==="/event"})}>EVENT</Link>
            <Link href="/profile" className={clsx(styles.menu,{[styles.active]: pathname==="/profile"})}>PROFILE</Link>
        </div>
    )
}