'use client';

import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // for tables, strikethrough, task lists, etc.

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

const MarkdownContainer = styled.div<{ $isUser?: boolean }>`
  line-height: 1.5;
  
  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    margin: 16px 0 8px 0;
    font-weight: 600;
    color: ${({ $isUser }) => $isUser ? 'rgba(255, 255, 255, 0.95)' : '#1e293b'};
  }
  
  h1 { font-size: 18px; }
  h2 { font-size: 16px; }
  h3 { font-size: 15px; }
  h4 { font-size: 14px; }
  h5, h6 { font-size: 13px; }
  
  /* Paragraphs */
  p {
    margin: 8px 0;
    &:first-child { margin-top: 0; }
    &:last-child { margin-bottom: 0; }
  }
  
  /* Lists */
  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }
  
  li {
    margin: 4px 0;
  }
  
  /* Code */
  code {
    background: ${({ $isUser }) => $isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
  }
  
  pre {
    background: ${({ $isUser }) => $isUser ? 'rgba(255, 255, 255, 0.15)' : '#f8fafc'};
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 8px 0;
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  /* Links */
  a {
    color: ${({ $isUser }) => $isUser ? 'rgba(255, 255, 255, 0.9)' : '#06C755'};
    text-decoration: underline;
  }
  
  /* Emphasis */
  strong {
    font-weight: 600;
    color: ${({ $isUser }) => $isUser ? 'rgba(255, 255, 255, 0.95)' : '#1e293b'};
  }
  
  em {
    font-style: italic;
  }
  
  /* Blockquotes */
  blockquote {
    border-left: 3px solid ${({ $isUser }) => $isUser ? 'rgba(255, 255, 255, 0.3)' : '#e2e8f0'};
    padding-left: 12px;
    margin: 8px 0;
    color: ${({ $isUser }) => $isUser ? 'rgba(255, 255, 255, 0.8)' : '#64748b'};
  }
  
  /* Horizontal rule */
  hr {
    border: none;
    border-top: 1px solid ${({ $isUser }) => $isUser ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0'};
    margin: 16px 0;
  }
`;

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isUser = false }) => {
  return (
    <MarkdownContainer $isUser={isUser}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </MarkdownContainer>
  );
};

export default MarkdownRenderer; 