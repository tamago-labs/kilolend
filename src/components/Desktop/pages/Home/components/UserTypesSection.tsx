"use client";

import styled from 'styled-components';

// User Types Section Styles
const UserTypesWrapper = styled.section`
  background: white;
  padding: 80px 32px;
  margin: 48px 0;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: clamp(28px, 3.5vw, 36px);
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 64px;
  line-height: 1.2;
  text-align: center;
`;

const UserTypesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: stretch;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const UserTypeCard = styled.div`
  padding: 48px;
  border-radius: 20px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }
`;

const UserTypeTitle = styled.h3`
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 16px;
  line-height: 1.2;
`;

const UserTypeDescription = styled.p`
  font-size: 18px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  color: #475569;
  line-height: 1.5;

  &::before {
    content: '•';
    margin-right: 12px;
    font-weight: 700;
    color: #64748b;
    font-size: 18px;
  }
`;

export const UserTypesSection = () => {

  return (
    <UserTypesWrapper>
      <SectionContainer>
        <SectionTitle>
          Designed for Everyone
        </SectionTitle>

        <UserTypesGrid>
          <UserTypeCard>
            <UserTypeTitle>For DeFi Beginners</UserTypeTitle>
            <UserTypeDescription>
              Perfect for earning passive income without complexity
            </UserTypeDescription>
            <FeatureList>
              <FeatureItem>One-click supply to earn competitive APY</FeatureItem>
              <FeatureItem>Support for stablecoins and major tokens</FeatureItem>
              <FeatureItem>No technical knowledge required</FeatureItem>
              <FeatureItem>Secure and transparent lending protocol</FeatureItem>
            </FeatureList>
          </UserTypeCard>

          <UserTypeCard>
            <UserTypeTitle>For Power Users</UserTypeTitle>
            <UserTypeDescription>
              With DeFi Co-Pilot to automate strategies effortlessly
            </UserTypeDescription>
            <FeatureList>
              <FeatureItem>AI handles math, routes, and execution for you</FeatureItem>
              <FeatureItem>Automated looping for amplified yields</FeatureItem>
              <FeatureItem>Support DeFi protocols across KAIA chain</FeatureItem>
              <FeatureItem>24/7 market monitoring and execution</FeatureItem> 
            </FeatureList>
          </UserTypeCard>
        </UserTypesGrid>
      </SectionContainer>
    </UserTypesWrapper>
  );
};
