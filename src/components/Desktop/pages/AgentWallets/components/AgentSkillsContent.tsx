"use client";

import React, { useState } from 'react';
import { AIWalletStatus } from '@/services/aiWalletService';
import {
  ContentCard,
  CardHeader,
  CardTitle,
  SkillItem,
  SkillInfo,
  SkillName,
  SkillDescription,
  Toggle,
  ToggleSwitch,
  ToggleKnob,
  ToggleInput,
  StatusBadge,
} from '../DesktopAgentWalletsV2Page.styles';

interface AgentSkillsContentProps {
  aiWalletData: AIWalletStatus | null;
  isLoadingAIWallet: boolean;
}

const MOCK_SKILLS = [
  {
    id: 1,
    name: 'Arbitrage Trading',
    description: 'Automatically identifies and executes profitable arbitrage opportunities across markets',
    enabled: true,
    status: 'active' as const,
  },
  {
    id: 2,
    name: 'Liquidity Provision',
    description: 'Provides liquidity to decentralized exchanges and earns trading fees',
    enabled: false,
    status: 'inactive' as const,
  },
  {
    id: 3,
    name: 'Market Making',
    description: 'Maintains limit orders on both sides of order book to capture spreads',
    enabled: true,
    status: 'active' as const,
  },
  {
    id: 4,
    name: 'Yield Farming',
    description: 'Automatically deposits funds into high-yield protocols for optimal returns',
    enabled: false,
    status: 'inactive' as const,
  },
  {
    id: 5,
    name: 'Risk Management',
    description: 'Monitors and adjusts positions to maintain optimal risk levels',
    enabled: true,
    status: 'warning' as const,
  },
];

export const AgentSkillsContent: React.FC<AgentSkillsContentProps> = ({ aiWalletData, isLoadingAIWallet }) => {
  const [skills, setSkills] = useState(MOCK_SKILLS);

  const handleToggleSkill = (id: number) => {
    setSkills(skills.map(skill =>
      skill.id === id
        ? {
            ...skill,
            enabled: !skill.enabled,
            status: !skill.enabled ? 'active' : 'inactive' as const,
          }
        : skill
    ));
  };

  return (
    <>
      <ContentCard>
        <CardHeader>
          <CardTitle>Agent Skills Configuration</CardTitle>
        </CardHeader>
        <p style={{ color: '#64748b', lineHeight: 1.6 }}>
          Enable and configure trading skills for your AI agent. Each skill automates specific trading strategies and operations.
        </p>
      </ContentCard>

      {skills.map((skill) => (
        <SkillItem key={skill.id}>
          <SkillInfo>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <SkillName>{skill.name}</SkillName>
              <StatusBadge $status={skill.status}>{skill.status}</StatusBadge>
            </div>
            <SkillDescription>{skill.description}</SkillDescription>
          </SkillInfo>
          <Toggle $checked={skill.enabled}>
            <ToggleInput
              type="checkbox"
              checked={skill.enabled}
              onChange={() => handleToggleSkill(skill.id)}
            />
            <ToggleSwitch $checked={skill.enabled}>
              <ToggleKnob $checked={skill.enabled} />
            </ToggleSwitch>
          </Toggle>
        </SkillItem>
      ))}

      <ContentCard style={{ marginTop: '24px' }}>
        <CardHeader>
          <CardTitle>Skill Statistics</CardTitle>
        </CardHeader>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Active Skills</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#06C755' }}>
              {skills.filter(s => s.enabled).length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Total Skills</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>
              {skills.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Skills Needing Attention</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>
              {skills.filter(s => s.status === 'warning').length}
            </div>
          </div>
        </div>
      </ContentCard>
    </>
  );
};