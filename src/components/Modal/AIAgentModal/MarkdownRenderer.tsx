import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  isUser = false 
}) => {
  // Custom components for markdown rendering
  const components = {
    // Style for paragraphs
    p: (props: any) => (
      <p {...props} style={{ 
        margin: '0 0 8px 0', 
        lineHeight: '1.5',
        color: isUser ? '#ffffff' : '#333333'
      }} />
    ),
    
    // Style for bold text
    strong: (props: any) => (
      <strong {...props} style={{ 
        fontWeight: '600',
        color: isUser ? '#ffffff' : '#1a1a1a'
      }} />
    ),
    
    // Style for italic text
    em: (props: any) => (
      <em {...props} style={{ 
        fontStyle: 'italic',
        color: isUser ? '#ffffff' : '#4a4a4a'
      }} />
    ),
    
    // Style for lists
    ul: (props: any) => (
      <ul {...props} style={{ 
        margin: '8px 0', 
        paddingLeft: '20px',
        color: isUser ? '#ffffff' : '#333333'
      }} />
    ),
    
    ol: (props: any) => (
      <ol {...props} style={{ 
        margin: '8px 0', 
        paddingLeft: '20px',
        color: isUser ? '#ffffff' : '#333333'
      }} />
    ),
    
    li: (props: any) => (
      <li {...props} style={{ 
        margin: '4px 0',
        lineHeight: '1.5'
      }} />
    ),
    
    // Style for code blocks
    code: (props: any) => {
      const { inline, children, ...rest } = props;
      if (inline) {
        return (
          <code {...rest} style={{
            backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : '#f5f5f5',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9em',
            color: isUser ? '#ffffff' : '#e83e8c'
          }}>
            {children}
          </code>
        );
      }
      
      return (
        <code {...rest} style={{
          display: 'block',
          backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : '#f8f9fa',
          padding: '12px',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '0.9em',
          overflowX: 'auto',
          margin: '8px 0',
          color: isUser ? '#ffffff' : '#333333'
        }}>
          {children}
        </code>
      );
    },
    
    // Style for blockquotes
    blockquote: (props: any) => (
      <blockquote {...props} style={{
        borderLeft: `4px solid ${isUser ? '#ffffff' : '#007bff'}`,
        paddingLeft: '16px',
        margin: '8px 0',
        fontStyle: 'italic',
        color: isUser ? 'rgba(255,255,255,0.8)' : '#6c757d'
      }} />
    ),
    
    // Style for links
    a: (props: any) => (
      <a 
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: isUser ? '#4dabf7' : '#007bff',
          textDecoration: 'underline'
        }}
      />
    ),
    
    // Style for headings
    h1: (props: any) => (
      <h1 {...props} style={{ 
        fontSize: '1.5em', 
        fontWeight: 'bold', 
        margin: '16px 0 8px 0',
        color: isUser ? '#ffffff' : '#1a1a1a'
      }} />
    ),
    
    h2: (props: any) => (
      <h2 {...props} style={{ 
        fontSize: '1.3em', 
        fontWeight: 'bold', 
        margin: '14px 0 6px 0',
        color: isUser ? '#ffffff' : '#1a1a1a'
      }} />
    ),
    
    h3: (props: any) => (
      <h3 {...props} style={{ 
        fontSize: '1.1em', 
        fontWeight: 'bold', 
        margin: '12px 0 4px 0',
        color: isUser ? '#ffffff' : '#1a1a1a'
      }} />
    ),
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
};
