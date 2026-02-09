import * as React from 'react'
import { Connector, useConnect, useConnectors } from 'wagmi'
import { WalletOption } from './WalletOption'

interface WalletOptionsProps {
  onWalletSelect?: (connector: any) => void;
}

export function WalletOptions({ onWalletSelect }: WalletOptionsProps) {
  const { connect } = useConnect()
  const connectors = useConnectors()

  const handleWalletClick = (connector: Connector) => {
    if (onWalletSelect) {
      onWalletSelect(connector);
    } else {
      connect({ connector });
    }
  };

  return connectors.map((connector) => (
    <WalletOption
      key={connector.uid}
      connector={connector}
      onClick={() => handleWalletClick(connector)}
    />
  ))
} 
