import * as React from 'react'
import { Connector } from 'wagmi'
import Blockies from 'react-blockies'

interface WalletOptionProps {
  connector: Connector
  onClick: () => void
}

function WalletOption({
  connector,
  onClick,
}: WalletOptionProps) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      const provider = await connector.getProvider()
      setReady(!!provider)
    })()
  }, [connector])

  return (
    <button 
      disabled={!ready} 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: 'white',
        cursor: ready ? 'pointer' : 'not-allowed',
        opacity: ready ? 1 : 0.6,
        transition: 'all 0.2s ease',
        width: '100%',
        textAlign: 'left',
        fontSize: '14px',
        fontWeight: '500',
        color: '#1e293b',
      }}
      onMouseEnter={(e) => {
        if (ready) {
          e.currentTarget.style.backgroundColor = '#f8fafc';
          e.currentTarget.style.borderColor = '#06C755';
        }
      }}
      onMouseLeave={(e) => {
        if (ready) {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }
      }}
    >
      {/* Wallet Icon */}
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <Blockies 
          seed={connector.name || 'default-wallet'} 
          size={8} 
          scale={4} 
        />
      </div>
      
      {/* Wallet Name */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight : "600" }}>{connector.name}</div>
        {!ready && (
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Not available
          </div>
        )}
      </div>
      
      {/* Status Indicator */}
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: ready ? '#06C755' : '#ef4444',
      }} />
    </button>
  )
}

export { WalletOption }