'use client';

import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
`;

const ContentWrapper = styled.div`
  max-width: 600px;
  text-align: center;
  background: white;
  border-radius: 24px;
  padding: 64px 48px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    padding: 48px 32px;
    margin: 0 16px;
  }
`;


const Title = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  line-height: 1.1;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const Subtitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #06C755;
  margin: 0 0 32px 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 24px;
  }
`;

const Description = styled.p`
  font-size: 18px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 40px 0;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 32px;
  }
`;


const TimelineNote = styled.div`
  margin-top: 24px;
  font-size: 14px;
  color: #94a3b8;
  font-style: italic;
`;

export default function SwapPage() {
  return (
    <Container>
      <ContentWrapper>
        <Title>KiloLend DEX</Title>
        <Subtitle>Coming Soon</Subtitle>

        <Description>
          We're building an agent-native DEX that will seamlessly integrate with KiloLend's lending and borrowing ecosystem.
        </Description>

        <TimelineNote>
          Stay tuned for updates! Follow our social channels for the latest announcements.
        </TimelineNote>
      </ContentWrapper>
    </Container>
  );
}
