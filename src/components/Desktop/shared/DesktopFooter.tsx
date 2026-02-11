"use client";

import styled from 'styled-components';
import { Twitter, MessageCircle, GitHub, Mail, ExternalLink } from 'react-feather';

// Footer Styles
const FooterWrapper = styled.footer`
  background: #1e293b;
  color: #e2e8f0;
  padding: 80px 32px 32px;  
`;

const FooterContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 48px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 32px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Logo = styled.img`
  height: 66px;
  width: 209px; 
  margin-bottom: 8px;
`;

const BrandDescription = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #94a3b8;
  max-width: 320px;
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
`;

const FooterLink = styled.a`
  font-size: 14px;
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.2s;
  line-height: 1.5;

  &:hover {
    color: #06C755;
  }
`;

const LinkWithIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// const SocialLinks = styled.div`
//   display: flex;
//   gap: 16px;
//   margin-top: 8px;
// `;

// const SocialLink = styled.a`
//   width: 40px;
//   height: 40px;
//   border-radius: 8px;
//   background: rgba(255, 255, 255, 0.1);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: #94a3b8;
//   transition: all 0.2s;

//   &:hover {
//     background: #06C755;
//     color: white;
//     transform: translateY(-2px);
//   }
// `;

const BottomSection = styled.div`
  max-width: 1400px;
  margin: 48px auto 0;
  padding-top: 32px;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
`;

const Copyright = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const LegalLinks = styled.div`
  display: flex;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

export const DesktopFooter = () => {
  return (
    <FooterWrapper>
      <FooterContainer>
        {/* Brand Section */}
        <BrandSection>
          <Logo src="/images/kilolend-logo-desktop.png" alt="KiloLend" />
          <BrandDescription>
            KiloLend brings AI-agent-powered DeFi to everyone, enabling automated lending, borrowing, and swaps with simple user access and LINE-based login.
          </BrandDescription>
          {/* <SocialLinks>
            <SocialLink href="https://twitter.com/kilolend" target="_blank" rel="noopener noreferrer">
              <Twitter size={18} />
            </SocialLink>
            <SocialLink href="https://discord.gg/kilolend" target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} />
            </SocialLink>
            <SocialLink href="https://github.com/tamago-labs/kilolend" target="_blank" rel="noopener noreferrer">
              <GitHub size={18} />
            </SocialLink>
            <SocialLink href="mailto:support@tamagolabs.com" target="_blank" rel="noopener noreferrer">
              <Mail size={18} />
            </SocialLink>
          </SocialLinks>*/}
        </BrandSection>

        {/* Product Links */}
        <FooterSection>
          <SectionTitle>Product</SectionTitle>
          <FooterLink href="/markets">Lending Markets</FooterLink>
          <FooterLink href="/swap">DEX</FooterLink>
          <FooterLink href="/portfolio">Portfolio</FooterLink>
          <FooterLink href="/leaderboard">Leaderboard</FooterLink>
        </FooterSection>

        {/* Resources */}
        <FooterSection>
          <SectionTitle>Resources</SectionTitle>
          <FooterLink href="https://docs.kilolend.xyz" target="_blank" rel="noopener noreferrer">
            <LinkWithIcon>
              Documentation
              <ExternalLink size={14} />
            </LinkWithIcon>
          </FooterLink>
          {/*<FooterLink href="/home#faq">FAQ</FooterLink>*/}
          <FooterLink href="https://docs.kilolend.xyz/developer-resources/community-audit-report" target="_blank" rel="noopener noreferrer">
            <LinkWithIcon>
              Audit Report
              <ExternalLink size={14} />
            </LinkWithIcon>
          </FooterLink>
          <FooterLink href="https://medium.com/kilolend/" target="_blank" rel="noopener noreferrer">
            <LinkWithIcon>
              Blog
              <ExternalLink size={14} />
            </LinkWithIcon>
          </FooterLink>
        </FooterSection>

        {/* Community */}
        <FooterSection>
          <SectionTitle>Community</SectionTitle>
          <FooterLink href="https://x.com/kilolend_xyz" target="_blank" rel="noopener noreferrer">Twitter/X</FooterLink>
          <FooterLink href="https://lin.ee/r8bOhDU" target="_blank" rel="noopener noreferrer">LINE Official</FooterLink>
          <FooterLink href="https://github.com/tamago-labs/kilolend" target="_blank" rel="noopener noreferrer">GitHub</FooterLink>
        </FooterSection>

        {/* Legal */}
        <FooterSection>
          <SectionTitle>Legal</SectionTitle>
          <FooterLink href="/terms">Terms of Service</FooterLink>
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
        </FooterSection>
      </FooterContainer>

      <BottomSection>
        <Copyright>
          © 2026 KiloLend. All rights reserved.
        </Copyright>
        <LegalLinks>
          <FooterLink href="/terms">Terms</FooterLink>
          <FooterLink href="/privacy">Privacy</FooterLink>
        </LegalLinks>
      </BottomSection>
    </FooterWrapper>
  );
};
