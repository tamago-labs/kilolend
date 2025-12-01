import React from 'react';

interface EmptyStateProps {
  characterName: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ characterName }) => {
  const suggestions = [
    "Help me check my wallet balance",
    "What are current KiloLend lending rates?",
    "Help swap 5 USDT to KAIA on DragonSwap",
    "Analyze my DeFi portfolio performance",
    "How to leverage my KAIA position",
    "Check prices for major KAIA tokens",
    "How to send tokens back to main wallet"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    // This will be handled by the parent component
    const event = new CustomEvent('suggestionClick', { detail: suggestion });
    window.dispatchEvent(event);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '1.2em',
        fontWeight: '500',
        color: '#666666',
        marginBottom: '16px'
      }}>
        What would you like {characterName} to help you with?
      </div>
      

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center',
        maxWidth: '500px'
      }}>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            style={{
              padding: '8px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '20px',
              backgroundColor: '#ffffff',
              color: '#666666',
              fontSize: '0.85em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#007bff';
              e.currentTarget.style.color = '#007bff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.color = '#666666';
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};