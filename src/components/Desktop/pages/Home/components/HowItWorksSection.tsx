"use client";

import styled from 'styled-components';

// Section container
const HowItWorksContainer = styled.section`
  padding: 80px 32px;
  max-width: 1400px;
  margin: 0 auto;
`;

// Hero Header Styles (without icon)
const HeroHeader = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const HeroTitleText = styled.div``;

const HeroTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.2;
`;

const HeroSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

// Horizontal Steps Container
const HeroSteps = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  justify-content: center;
`;

// White Card for Each Step
const HeroStep = styled.div`
  flex: 1;
  max-width: 380px;
  background: white;
  border-radius: 12px;
  padding: 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-color: #06C755;
  }
`;

const HeroStepNumber = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #06C755, #059669);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(6, 199, 85, 0.2);
  margin-bottom: 20px;
`;

const HeroStepContent = styled.div``;

const HeroStepTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const HeroStepDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

export const HowItWorksSection = () => {
  return (
    <HowItWorksContainer>
      <HeroHeader>
        <HeroTitleText>
          <HeroTitle>How KiloLend Works</HeroTitle>
          <HeroSubtitle>
            Get started with agent-native DeFi in 3 simple steps
          </HeroSubtitle>
        </HeroTitleText>
      </HeroHeader>

      <HeroSteps>
        <HeroStep>
          <HeroStepNumber>1</HeroStepNumber>
          <HeroStepContent>
            <HeroStepTitle>Create Agent Wallet</HeroStepTitle>
            <HeroStepDescription>
              Connect your wallet and create an Agent Wallet secured by KiloLend HSM, paired to your address for secure autonomous execution.
            </HeroStepDescription>
          </HeroStepContent>
        </HeroStep>

        <HeroStep>
          <HeroStepNumber>2</HeroStepNumber>
          <HeroStepContent>
            <HeroStepTitle>Test or Generate API Key</HeroStepTitle>
            <HeroStepDescription>
              Use your agent in the playground, or generate an API key for long-running use on your own server infrastructure.
            </HeroStepDescription>
          </HeroStepContent>
        </HeroStep>

        <HeroStep>
          <HeroStepNumber>3</HeroStepNumber>
          <HeroStepContent>
            <HeroStepTitle>Enable Agent Skills</HeroStepTitle>
            <HeroStepDescription>
              Load KiloLend agent skills and attach your API key to use with OpenClaw agents for powerful DeFi automation.
            </HeroStepDescription>
          </HeroStepContent>
        </HeroStep>
      </HeroSteps>
    </HowItWorksContainer>
  );
};