'use client';

import styled from 'styled-components';
import { ExternalLink } from 'react-feather';

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

export default function TermsPage() {
  return (
    <Container>
      <Header>
        <Title>Terms of Service</Title>
        <Subtitle>
          Essential terms for using KiloLend's AI Co-pilot DeFi platform on KAIA
        </Subtitle>
      </Header>

      <Section>
        <SectionTitle>Service Agreement</SectionTitle>
        <SectionContent>
          By accessing and using KiloLend, you agree to these terms. KiloLend is a decentralized 
          finance (DeFi) platform built on the KAIA blockchain that features an AI Co-pilot 
          capable of handling lending, borrowing, swapping, and complex mathematical calculations 
          to optimize your DeFi experience.
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Essential Responsibilities</SectionTitle>
        <SectionContent>
          <List>
            <ListItem>
              You must be legally eligible to use financial services in your jurisdiction
            </ListItem>
            <ListItem>
              You are solely responsible for the security of your wallet and private keys
            </ListItem>
            <ListItem>
              All transactions are irreversible once confirmed on the blockchain
            </ListItem>
            <ListItem>
              You must comply with applicable laws and regulations in your jurisdiction
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>DeFi-Specific Risks</SectionTitle>
        <HighlightBox>
          <HighlightTitle>Important Risk Notice</HighlightTitle>
          <HighlightContent>
            DeFi lending involves significant risks including smart contract vulnerabilities, 
            market volatility, and potential loss of funds. Only invest what you can afford to lose.
          </HighlightContent>
        </HighlightBox>
        <SectionContent>
          <List>
            <ListItem>
              Smart contract risk: Code vulnerabilities could result in loss of funds
            </ListItem>
            <ListItem>
              Market risk: Asset values can fluctuate dramatically
            </ListItem>
            <ListItem>
              Liquidation risk: Collateral can be liquidated if loan values decline
            </ListItem>
            <ListItem>
              Oracle risk: Price feeds may be manipulated or experience failures
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>AI Co-pilot Services</SectionTitle>
        <SectionContent>
          Our AI Co-pilot is an advanced assistant that can actively help you navigate DeFi operations 
          on the KAIA blockchain. The AI can:
        </SectionContent>
        <List>
          <ListItem>
            <strong>Lending & Borrowing:</strong> Guide you through supplying assets and borrowing 
            against your collateral with optimal parameters
          </ListItem>
          <ListItem>
            <strong>Token Swapping:</strong> Assist with executing token swaps across different 
            liquidity pools on KAIA DeFi
          </ListItem>
          <ListItem>
            <strong>Mathematical Calculations:</strong> Handle complex calculations for interest rates, 
            yields, liquidation risks, and optimal collateral ratios
          </ListItem>
          <ListItem>
            <strong>Risk Assessment:</strong> Analyze your positions and provide insights on 
            potential risks and optimization opportunities
          </ListItem>
        </List>
        <SectionContent>
          <strong>Important Disclaimer:</strong> AI suggestions are for informational purposes only 
          and should not be considered financial advice. You are solely responsible for all 
          investment decisions and their outcomes. Always verify AI recommendations before executing transactions.
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Prohibited Activities</SectionTitle>
        <SectionContent>
          <List>
            <ListItem>
              Using the platform for illegal activities or money laundering
            </ListItem>
            <ListItem>
              Attempting to exploit vulnerabilities or manipulate the protocol
            </ListItem>
            <ListItem>
              Providing false information or engaging in fraudulent activities
            </ListItem>
            <ListItem>
              Violating intellectual property rights of KiloLend or third parties
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Limitation of Liability</SectionTitle>
        <SectionContent>
          KiloLend is provided "as is" without warranties. We are not liable for:
          <List>
            <ListItem>
              Loss of funds due to market volatility or liquidation
            </ListItem>
            <ListItem>
              Smart contract failures or exploits
            </ListItem>
            <ListItem>
              AI recommendations that result in financial losses
            </ListItem>
            <ListItem>
              Network congestion or blockchain failures
            </ListItem>
          </List>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Intellectual Property</SectionTitle>
        <SectionContent>
          All KiloLend intellectual property, including software, designs, and content, 
          remains the property of KiloLend. You may not copy, modify, or distribute our 
          proprietary materials without permission.
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Service Modifications</SectionTitle>
        <SectionContent>
          We reserve the right to modify, suspend, or terminate services at any time. 
          Significant changes will be announced through our official channels.
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Governing Law</SectionTitle>
        <SectionContent>
          These terms are governed by the laws of the jurisdiction where KiloLend operates. 
          Disputes will be resolved through binding arbitration in accordance with applicable 
          arbitration rules.
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Contact Information</SectionTitle>
        <SectionContent>
          For questions about these terms, please contact us through our official channels:
          <List>
            <ListItem>
              Documentation:{' '}
              <ExternalLinkStyled href="https://docs.kilolend.xyz" target="_blank" rel="noopener noreferrer">
                docs.kilolend.xyz <ExternalLink size={14} />
              </ExternalLinkStyled>
            </ListItem>
            <ListItem>
              Community:{' '}
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
