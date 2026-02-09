import { WalletOptions } from '../WalletOptions/WalletOptions';

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect?: (connector: any) => void;
}

export const WalletSelectionModal = ({ isOpen, onClose, onWalletSelect }: WalletSelectionModalProps) => {
 
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#1e293b' 
          }}>
            Connect Wallet
          </h2>
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: '14px', 
            color: '#64748b' 
          }}>
            Choose your preferred wallet to connect to the dapp
          </p>
        </div>

        {/* Wallet Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <WalletOptions onWalletSelect={onWalletSelect} />
        </div> 

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: 'white',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#06C755';
            e.currentTarget.style.color = '#06C755';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};