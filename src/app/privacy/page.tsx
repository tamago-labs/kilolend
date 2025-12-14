'use client';

import styled from 'styled-components';
import { ExternalLink, Shield, Database, Eye } from 'react-feather';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
  min-height: 100vh;
  background: #ffffff;
  color: #1e293b;
`;

const Header = styled.div`
  margin-bottom: 48px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

const Section = styled.section`
  margin-bottom: 48px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
  line-height: 1.3;
`;

const SectionContent = styled.div`
  color: #475569;
  line-height: 1.7;
  font-size: 16px;
`;

const List = styled.ul`
  margin: 16px 0;
  padding-left: 24px;
`;

const ListItem = styled.li`
  margin-bottom: 12px;
  color: #475569;
  line-height: 1.6;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin: 24px 0;
`;

const InfoCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
`;

const InfoCardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoCardContent = styled.p`
  color: #475569;
  margin: 0;
  line-height: 1.6;
`;

const HighlightBox = styled.div`
  background: rgba(6, 199, 85, 0.1);
  border: 1px solid rgba(6, 199, 85, 0.2);
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
`;

const HighlightTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #06C755;
  margin: 0 0 12px 0;
`;

const HighlightContent = styled.p`
  color: #475569;
  margin: 0;
  line-height: 1.6;
`;

const LastUpdated = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
`;

const ExternalLinkStyled = styled.a`
  color: #06C755;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

export default function PrivacyPage() {
  return (
    <Container>
      <Header>
        <Title>Privacy Policy</Title>
        <Subtitle>
          How we collect, use, and protect your information on KiloLend
        </Subtitle>
      </Header>

      <Section>
        <SectionTitle>What We Collect</SectionTitle>
        <SectionContent>
          We collect minimal information necessary to provide our DeFi lending services:
        </SectionContent>
        <InfoGrid>
          <InfoCard>
            <InfoCardTitle> 
              Wallet Data
            </InfoCardTitle>
            <InfoCardContent>
              Public wallet addresses, transaction history, and blockchain interactions 
              required for DeFi operations.
            </InfoCardContent>
          </InfoCard>
          <InfoCard>
            <InfoCardTitle> 
              Usage Data
            </InfoCardTitle>
            <InfoCardContent>
              Platform usage patterns, feature interactions, and performance metrics 
              to improve our services.
            </InfoCardContent>
          </InfoCard>
          <InfoCard>
            <InfoCardTitle> 
              AI Conversations
            </InfoCardTitle>
            <InfoCardContent>
              Chat messages with our AI assistant to provide personalized financial guidance 
              and improve AI performance.
            </InfoCardContent>
          </InfoCard>
        </InfoGrid>
      </Section>

      <Section>
        <SectionTitle>How We Use Your Information</SectionTitle>
        <SectionContent>
          <List>
            <ListItem>
              <strong>Service Delivery:</strong> Process transactions, manage lending positions, 
              and provide AI-powered financial guidance
            </ListItem>
            <ListItem>
              <strong>Platform Improvement:</strong> Analyze usage patterns to enhance user 
              experience and develop new features
            </ListItem>
            <ListItem>
              <strong>AI Training:</strong> Use anonymized conversation data to improve our 
              AI assistant's accuracy and capabilities
            </ListItem>
            <ListItem>
              <strong>Security:</strong> Monitor for suspicious activities and protect against 
              fraud and exploits
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>AI Chat Privacy</SectionTitle>
        <HighlightBox>
          <HighlightTitle>AI Data Handling</HighlightTitle>
          <HighlightContent>
            Your AI conversations are stored securely and may be used to improve our AI services. 
            Personal wallet information is never shared with third parties without your consent.
          </HighlightContent>
        </HighlightBox>
        <SectionContent>
          <List>
            <ListItem>
              Conversations are encrypted and stored securely
            </ListItem>
            <ListItem>
              Personal identifiers are removed before AI training
            </ListItem>
            <ListItem>
              You can request deletion of your chat history at any time
            </ListItem>
            <ListItem>
              AI responses are generated in real-time and not pre-scripted
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Blockchain Data</SectionTitle>
        <SectionContent>
          As a DeFi platform, most of your data is publicly available on the blockchain:
          <List>
            <ListItem>
              <strong>Public Transactions:</strong> All lending, borrowing, and supply transactions 
              are recorded on-chain and publicly visible
            </ListItem>
            <ListItem>
              <strong>Wallet Addresses:</strong> Your wallet address is public and linked to 
              your on-chain activities
            </ListItem>
            <ListItem>
              <strong>Smart Contract Interactions:</strong> All interactions with our smart 
              contracts are permanently recorded on blockchain
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Data Protection</SectionTitle>
        <SectionContent>
          We implement multiple security measures to protect your information:
          <List>
            <ListItem>
              End-to-end encryption for sensitive data transmission
            </ListItem>
            <ListItem>
              Regular security audits of smart contracts and infrastructure
            </ListItem>
            <ListItem>
              Limited access to personal data within our organization
            </ListItem>
            <ListItem>
              Secure storage with industry-standard encryption protocols
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Third-Party Services</SectionTitle>
        <SectionContent>
          We integrate with limited third-party services to enhance functionality:
          <List>
            <ListItem>
              <strong>Price Oracles:</strong> External price feeds for asset valuation
            </ListItem>
            <ListItem>
              <strong>Analytics:</strong> Anonymous usage analytics for platform improvement
            </ListItem>
            <ListItem>
              <strong>Infrastructure:</strong> Cloud services for hosting and data storage
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Your Rights and Choices</SectionTitle>
        <SectionContent>
          You have the following rights regarding your data:
          <List>
            <ListItem>
              <strong>Access:</strong> Request a copy of your personal data
            </ListItem>
            <ListItem>
              <strong>Deletion:</strong> Request deletion of your account and associated data
            </ListItem>
            <ListItem>
              <strong>Correction:</strong> Update or correct inaccurate personal information
            </ListItem>
            <ListItem>
              <strong>Portability:</strong> Export your data in a machine-readable format
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Data Retention</SectionTitle>
        <SectionContent>
          <List>
            <ListItem>
              <strong>Account Data:</strong> Retained until account deletion is requested
            </ListItem>
            <ListItem>
              <strong>AI Conversations:</strong> Retained for 12 months, then anonymized 
              for AI training purposes
            </ListItem>
            <ListItem>
              <strong>Transaction Records:</strong> Permanently stored on blockchain 
              (cannot be deleted due to blockchain immutability)
            </ListItem>
            <ListItem>
              <strong>Analytics Data:</strong> Retained in anonymized form for 
              platform improvement purposes
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Cookies and Local Storage</SectionTitle>
        <SectionContent>
          We use minimal browser storage for essential functionality:
          <List>
            <ListItem>
              <strong>Authentication:</strong> Secure session management
            </ListItem>
            <ListItem>
              <strong>Preferences:</strong> User interface settings and preferences
            </ListItem>
            <ListItem>
              <strong>Performance:</strong> Caching to improve platform speed
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>International Data Transfers</SectionTitle>
        <SectionContent>
          Your data may be processed and stored in jurisdictions outside your own. 
          We ensure appropriate safeguards are in place to protect your information 
          in accordance with applicable data protection laws.
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Children's Privacy</SectionTitle>
        <SectionContent>
          KiloLend is not intended for use by individuals under 18 years of age. 
          We do not knowingly collect personal information from children. If we become 
          aware of such collection, we will take immediate steps to delete the information.
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Changes to This Policy</SectionTitle>
        <SectionContent>
          We may update this privacy policy from time to time. Significant changes will 
          be announced through our official channels. We encourage you to review this 
          policy periodically.
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Contact Information</SectionTitle>
        <SectionContent>
          For privacy-related questions or to exercise your rights, please contact us:
          <List>
            <ListItem>
              Privacy inquiries:{' '}
              <ExternalLinkStyled href="https://docs.kilolend.xyz" target="_blank" rel="noopener noreferrer">
                docs.kilolend.xyz <ExternalLink size={14} />
              </ExternalLinkStyled>
            </ListItem>
            <ListItem>
              Community support:{' '}
              <ExternalLinkStyled href="https://x.com/kilolend_xyz" target="_blank" rel="noopener noreferrer">
                @kilolend_xyz <ExternalLink size={14} />
              </ExternalLinkStyled>
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <LastUpdated>
        Last updated: December 2025
      </LastUpdated>
    </Container>
  );
}
