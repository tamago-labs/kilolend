"use client";

import styled from 'styled-components';

const LandingContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  text-align: center;
  opacity: 0.9;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  text-align: left;
`;

const FeatureItem = styled.li`
  margin: 1rem 0;
  padding-left: 1.5rem;
  position: relative;
  
  &:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #10b981;
    font-weight: bold;
  }
`;

export const Landing = () => {
  return (
    <LandingContainer>
      <Card>
        <Title>KiloLend Desktop</Title>
        <Subtitle>Decentralized Lending Protocol for Desktop</Subtitle>
        
        <FeatureList>
          <FeatureItem>Supply assets and earn interest</FeatureItem>
          <FeatureItem>Borrow against your collateral</FeatureItem>
          <FeatureItem>AI-powered financial insights</FeatureItem>
          <FeatureItem>Cross-chain compatibility</FeatureItem>
          <FeatureItem>Advanced portfolio management</FeatureItem>
        </FeatureList>
        
        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
          Desktop version is coming soon with advanced features and routing capabilities.
        </p>
      </Card>
    </LandingContainer>
  );
};
