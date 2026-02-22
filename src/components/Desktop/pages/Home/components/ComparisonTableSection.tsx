"use client";

import styled from 'styled-components';

// Comparison Table Section Styles
const ComparisonSectionWrapper = styled.section`
  padding: 80px 32px;
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

// White Card Styles
const ComparisonCard = styled.div`
  background: white;
  color: #1e293b;
  padding: 40px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 12px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 16px;
  text-align: center;
  line-height: 1.2;

  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 18px;
  color: #64748b;
  margin-bottom: 48px;
  text-align: center;
  line-height: 1.6;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 32px;
    padding: 0 16px;
  }
`;

// Table Styles
const TableWrapper = styled.div`
  overflow-x: auto;
  margin: 0 -8px;
  padding: 0 8px;
`;

const ComparisonTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 480px;

  @media (max-width: 768px) {
    min-width: 400px;
  }
`;

const TableHeader = styled.thead``;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8fafc;
  }

  &:hover {
    background-color: #f1f5f9;
  }
`;

const HeaderCell = styled.th<{ $isFirst?: boolean; $isHighlight?: boolean }>`
  padding: 20px 16px;
  text-align: ${props => props.$isFirst ? 'left' : 'center'};
  font-weight: 700;
  font-size: 16px;
  color: ${props => props.$isHighlight ? '#06C755' : '#475569'};
  border-bottom: 2px solid #e2e8f0;
  background-color: ${props => props.$isHighlight ? '#f0fdf4' : 'white'};
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 12px 8px;
    font-size: 14px;
  }
`;

const DataCell = styled.td<{ $isFirst?: boolean; $isHighlight?: boolean }>`
  padding: 20px 16px;
  text-align: ${props => props.$isFirst ? 'left' : 'center'};
  font-size: 16px;
  color: ${props => props.$isHighlight ? '#06C755' : '#1e293b'};
  font-weight: ${props => props.$isHighlight ? '700' : '600'};
  border-bottom: 1px solid #e2e8f0;
  background-color: ${props => props.$isHighlight ? '#f0fdf4' : 'inherit'};

  @media (max-width: 768px) {
    padding: 12px 8px;
    font-size: 14px;
  }
`;

const CapabilityText = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const StatusIcon = styled.span<{ $available: boolean }>`
  font-size: 20px;
  font-weight: bold;
  color: ${props => props.$available ? '#06C755' : '#ef4444'};
  display: inline-block;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

// Comparison data
const comparisonData = [
  {
    capability: 'Built-in Agent Wallets',
    kiloLend: true,
    heyVincent: true,
    bankr: true,
  },
  {
    capability: 'Supports OpenClaw Skills',
    kiloLend: true,
    heyVincent: true,
    bankr: true,
  },
  {
    capability: 'Natural Language Execution',
    kiloLend: true,
    heyVincent: false,
    bankr: true,
  },
  {
    capability: 'Native Borrowing & Yield',
    kiloLend: true,
    heyVincent: false,
    bankr: false,
  },
  {
    capability: 'HSM Security',
    kiloLend: true,
    heyVincent: true,
    bankr: true,
  },
  {
    capability: 'Session Key Controls',
    kiloLend: true,
    heyVincent: true,
    bankr: false,
  },
  {
    capability: 'Agent Playground',
    kiloLend: true,
    heyVincent: false,
    bankr: true,
  }
];

export const ComparisonTableSection = () => {
  return (
    <ComparisonSectionWrapper>
        <SectionTitle>Agent-Native DeFi vs Agent Middleware</SectionTitle>
        <SectionSubtitle>Built from the ground up for agents — no compromises, no middleware complexity</SectionSubtitle>
      <SectionContainer>
        <ComparisonCard>
        
          
          <TableWrapper>
            <ComparisonTable>
              <TableHeader>
                <TableRow>
                  <HeaderCell $isFirst>Capability</HeaderCell>
                  <HeaderCell $isHighlight>KiloLend</HeaderCell>
                  <HeaderCell>HeyVincent</HeaderCell>
                  <HeaderCell>Bankr</HeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((row, index) => (
                  <TableRow key={index}>
                    <DataCell $isFirst>
                      <CapabilityText>{row.capability}</CapabilityText>
                    </DataCell>
                    <DataCell $isHighlight>
                      <StatusIcon $available={row.kiloLend}>
                        {row.kiloLend ? '✅' : '❌'}
                      </StatusIcon>
                    </DataCell>
                    <DataCell>
                      <StatusIcon $available={row.heyVincent}>
                        {row.heyVincent ? '✅' : '❌'}
                      </StatusIcon>
                    </DataCell>
                    <DataCell>
                      <StatusIcon $available={row.bankr}>
                        {row.bankr ? '✅' : '❌'}
                      </StatusIcon>
                    </DataCell>
                  </TableRow>
                ))}
              </TableBody>
            </ComparisonTable>
          </TableWrapper>
        </ComparisonCard>
      </SectionContainer>
    </ComparisonSectionWrapper>
  );
};