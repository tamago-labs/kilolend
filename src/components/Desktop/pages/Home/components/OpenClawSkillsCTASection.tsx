"use client";

import styled from 'styled-components';
import { useState } from 'react';

// OpenClaw Skills CTA Section Styles
const SkillsSectionWrapper = styled.section`
  padding: 80px 32px;
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 16px;
  text-align: center;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 12px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  margin-bottom: 40px;
  text-align: center;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 32px;
  }
`;

const InstructionLabel = styled.p`
  font-size: 16px;
  color: #475569;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const CodeInputContainer = styled.div`
  position: relative;
  margin: 0 auto 32px;
  max-width: 900px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const CodeInput = styled.input`
  width: 100%;
  padding: 16px 50px 16px 20px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 16px;
  color: #1e293b;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #06C755;
    background: white;
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 14px 45px 14px 16px;
  }
`;

const CopyIcon = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  font-size: 20px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  @media (max-width: 768px) {
    right: 12px;
    font-size: 18px;
  }
`;

const Tooltip = styled.div<{ $visible?: boolean }>`
  position: absolute;
  top: -45px;
  right: 16px;
  background: #1e293b;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  visibility: ${({ $visible }) => $visible ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 20px;
    border: 4px solid transparent;
    border-top-color: #1e293b;
  }

  @media (max-width: 768px) {
    right: 12px;
  }
`;

const GitHubLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #06C755;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  margin-top: 24px;
  transition: all 0.2s;

  &:hover {
    color: #059669;
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ArrowIcon = styled.span`
  font-size: 18px;
  transition: transform 0.2s;
`;

const PlaygroundMessage = styled.p`
  margin-top: 48px;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  text-align: center;

  @media (max-width: 768px) {
    margin-top: 32px;
    font-size: 13px;
  }
`;

const HighlightIcon = styled.span`
  display: inline-block;
  animation: pulse 2s infinite;
  margin: 0 4px;

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
`;

export const OpenClawSkillsCTASection = () => {
  const [copied, setCopied] = useState(false);
  
  const installCommand = "install the skill from https://github.com/tamago-labs/openclaw-skills";
  const githubUrl = "https://github.com/tamago-labs/openclaw-skills";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = installCommand;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <SkillsSectionWrapper id="openclaw-skills">
      <SectionContainer>
        <SectionTitle>OpenClaw Skills by KiloLend</SectionTitle>
        <SectionSubtitle>
        Enable your agent to lend, borrow, and swap — directly from Discord, Telegram, LINE, and more
        </SectionSubtitle>
        
        <InstructionLabel>
          To install KiloLend skills tell your agent:
        </InstructionLabel>
        
        <CodeInputContainer>
          <CodeInput 
            value={installCommand}
            readOnly
          />
          <CopyIcon onClick={handleCopy}>
            {copied ? '✓' : '📋'}
          </CopyIcon>
          <Tooltip $visible={copied}>
            Copied to clipboard!
          </Tooltip>
        </CodeInputContainer>

        <GitHubLink 
          href={githubUrl} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          View repo 
          <ArrowIcon>→</ArrowIcon>
        </GitHubLink>

        <PlaygroundMessage>
          Once agent wallet is setup, you can try playground by clicking on the AI agent icon at the bottom right of the screen
        </PlaygroundMessage>
      </SectionContainer>
    </SkillsSectionWrapper>
  );
};