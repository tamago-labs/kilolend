

import { ExternalLink } from 'react-feather';
import styled from 'styled-components';
import { liff } from "@/utils/liff";



// External Links Section Styles
const SectionContainer = styled.div`
  margin-bottom: 32px;
`;


const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

const LinksContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`;


const LinkItem = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
  }
`;

const LinkTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const LinkDescription = styled.div`
  font-size: 12px;
  color: #64748b;
  text-align: center;
  line-height: 1.3;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const ExternalLinkIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  color: #94a3b8;
`;



const ExternalLinksSection = () => {

    const handleExternalLink = (url: string, name: string) => {
        if (liff.isInClient()) {
            liff.openWindow({
                url: url,
                external: true,
            });
        } else {
            window.open(url, '_blank');
        }
    };

    return (
        <SectionContainer>
            <SectionTitle>Resources</SectionTitle>
            <LinksContainer>
                <LinksGrid>
                    <LinkItem
                        as="div"
                        onClick={() => handleExternalLink('https://github.com/tamago-labs/kilolend', 'GitHub')}
                        style={{ position: 'relative' }}
                    >
                        <ExternalLinkIndicator>
                            <ExternalLink size={16} />
                        </ExternalLinkIndicator>
                        <LinkTitle>GitHub</LinkTitle>
                        <LinkDescription>
                            View source code and all contract addresses
                        </LinkDescription>
                    </LinkItem>

                    <LinkItem
                        as="div"
                        onClick={() => handleExternalLink('https://dune.com/pisuthd/kilolend-protocol-analytics', 'Dune Analytics')}
                        style={{ position: 'relative' }}
                    >
                        <ExternalLinkIndicator>
                            <ExternalLink size={16} />
                        </ExternalLinkIndicator>
                        <LinkTitle>Dashboard</LinkTitle>
                        <LinkDescription>
                            Explore metrics and analytics on Dune
                        </LinkDescription>
                    </LinkItem>

                    <LinkItem
                        as="div"
                        onClick={() => handleExternalLink('https://docs.kilolend.xyz', 'Documentation')}
                        style={{ position: 'relative' }}
                    >
                        <ExternalLinkIndicator>
                            <ExternalLink size={16} />
                        </ExternalLinkIndicator>
                        <LinkTitle>Documentation</LinkTitle>
                        <LinkDescription>
                            Complete protocol guide and technical docs
                        </LinkDescription>
                    </LinkItem>

                    <LinkItem
                        as="div"
                        onClick={() => handleExternalLink('https://lin.ee/r8bOhDU', 'LINE Official')}
                        style={{ position: 'relative' }}
                    >
                        <ExternalLinkIndicator>
                            <ExternalLink size={16} />
                        </ExternalLinkIndicator>
                        <LinkTitle>LINE Official</LinkTitle>
                        <LinkDescription>
                            Follow our official LINE account for updates
                        </LinkDescription>
                    </LinkItem>

                </LinksGrid>
            </LinksContainer>
        </SectionContainer>
    )
}

export default ExternalLinksSection