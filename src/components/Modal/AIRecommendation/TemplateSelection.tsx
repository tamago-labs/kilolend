'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { MessageSquare, Edit3, Globe, CheckCircle, Shield, TrendingUp, Zap } from 'react-feather';
import { TEMPLATE_CATEGORIES } from './constants';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

const KiloLendBadge = styled.div`
  background: linear-gradient(135deg, #06C755, #00A000);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(6, 199, 85, 0.3);
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const OptionTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid ${props => props.$active ? '#06C755' : '#e2e8f0'};
  background: ${props => props.$active ? '#f0fdf4' : 'white'};
  color: ${props => props.$active ? '#166534' : '#64748b'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    border-color: ${props => props.$active ? '#00A000' : '#cbd5e1'};
    background: ${props => props.$active ? '#dcfce7' : '#f8fafc'};
  }
`;

const LanguageTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const LanguageTab = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid ${props => props.$active ? '#06C755' : '#e2e8f0'};
  background: ${props => props.$active ? '#06C755' : 'white'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 55px;

  &:hover {
    border-color: #06C755;
    background: ${props => props.$active ? '#00A000' : '#f0fdf4'};
  }
`;

const CategoriesSection = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const CategoryGroup = styled.div`
  margin-bottom: 24px;
`;

const CategoryHeader = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: ${props => `${props.$color}15`};
  border: 1px solid ${props => `${props.$color}30`};
  border-radius: 12px;
`;

const CategoryIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
`;

const CategoryDescription = styled.div`
  font-size: 11px;
  color: #64748b;
  line-height: 1.3;
`;

const TemplateCard = styled.button<{ $selected: boolean }>`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 2px solid ${props => props.$selected ? '#06C755' : '#e2e8f0'};
  background: ${props => props.$selected ? '#f0fdf4' : 'white'};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.$selected ? '#00A000' : '#cbd5e1'};
    background: ${props => props.$selected ? '#dcfce7' : '#f8fafc'};
    transform: translateY(-1px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const TemplateText = styled.div<{ $selected: boolean }>`
  font-size: 13px;
  color: ${props => props.$selected ? '#166534' : '#374151'};
  line-height: 1.4;
  padding-right: 24px;
`;

const SelectedIcon = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  color: #06C755;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const CustomPromptSection = styled.div`
  margin-top: 20px;
`;

const CustomPromptLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CustomPromptInput = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  
  &:focus {
    outline: none;
    border-color: #06C755;
    box-shadow: 0 0 0 3px rgba(6, 199, 85, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const CharacterCount = styled.div<{ $warning: boolean }>`
  font-size: 11px;
  color: ${props => props.$warning ? '#ef4444' : '#94a3b8'};
  text-align: right;
  margin-top: 4px;
`;

interface TemplateSelectionProps {
  selectedTemplate: string | null;
  customPrompt: string;
  onTemplateSelect: (template: string) => void;
  onCustomPromptChange: (prompt: string) => void;
}

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' }
];

const CATEGORY_ICONS = {
  conservative: Shield,
  borrowing: TrendingUp,
  gaming: TrendingUp,
  advanced: Zap
};

export const AITemplateSelection: React.FC<TemplateSelectionProps> = ({ 
  selectedTemplate, 
  customPrompt,
  onTemplateSelect, 
  onCustomPromptChange 
}) => {
  const [activeOption, setActiveOption] = useState<'templates' | 'custom'>('templates');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ko' | 'ja' | 'th'>('en');

  const handleTemplateClick = (template: string) => {
    onTemplateSelect(template);
    setActiveOption('templates');
  };

  const handleCustomPromptChange = (value: string) => {
    onCustomPromptChange(value);
    setActiveOption('custom');
  };

  const maxLength = 500;
  const isOverLimit = customPrompt.length > maxLength;

  const getCustomPromptPlaceholder = () => {
    return `Describe your goals in any language. For example:

"I have 500 USDT and want to earn stable returns around 5-7% APY with minimal risk. I'm new to DeFi and prefer stablecoin lending. Please suggest the safest approach."

"2000 KAIAがあり、ゲーミングトークンを借りて投資したいです。適度なリスクは許容できます。"

"มี 1000 USDT อยากสร้างพอร์ตโฟลิโอที่สมดุลระหว่างความปลอดภัยและผลตอบแทนสูง"`;
  };

  return (
    <Container> 

     <Header>
         <Title>Provide Your Input</Title> 
        <Subtitle>
          Select from curated templates or create a custom prompt. Our AI analyzes KiloLend markets in real-time.
        </Subtitle>
      </Header>

      <OptionsContainer>
        <OptionTab 
          $active={activeOption === 'templates'}
          onClick={() => setActiveOption('templates')}
        > 
          Browse Templates
        </OptionTab>
        <OptionTab 
          $active={activeOption === 'custom'}
          onClick={() => setActiveOption('custom')}
        > 
          Custom Prompt
        </OptionTab>
      </OptionsContainer>

      {activeOption === 'templates' && (
        <>
          <LanguageTabs> 
            {LANGUAGE_OPTIONS.map((lang) => (
              <LanguageTab
                key={lang.code}
                $active={selectedLanguage === lang.code}
                onClick={() => setSelectedLanguage(lang.code as 'en' | 'ko' | 'ja' | 'th')}
              >
                {lang.flag} 
                {/*{lang.name}*/}
              </LanguageTab>
            ))}
          </LanguageTabs>

          <CategoriesSection>
            {TEMPLATE_CATEGORIES.map((category) => {
              const IconComponent = CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS];
              const templates = category.templates[selectedLanguage];
              
              return (
                <CategoryGroup key={category.id}>
                  <CategoryHeader $color={category.color}>
                     
                    <CategoryInfo>
                      <CategoryName>{category.name}</CategoryName>
                      <CategoryDescription>
                        {templates.length} templates  
                      </CategoryDescription>
                    </CategoryInfo>
                  </CategoryHeader>
                  
                  {templates.map((template, index) => {
                    const isSelected = selectedTemplate === template;
                    return (
                      <TemplateCard
                        key={`${category.id}-${index}`}
                        $selected={isSelected}
                        onClick={() => handleTemplateClick(template)}
                      >
                        <TemplateText $selected={isSelected}>
                          {template}
                        </TemplateText>
                        <SelectedIcon $visible={isSelected}>
                          <CheckCircle size={14} />
                        </SelectedIcon>
                      </TemplateCard>
                    );
                  })}
                </CategoryGroup>
              );
            })}
          </CategoriesSection>
        </>
      )}

      {activeOption === 'custom' && (
        <CustomPromptSection>
          <CustomPromptLabel>
            <Edit3 size={16} />
            Write Your Custom Prompt
          </CustomPromptLabel>
          <CustomPromptInput
            value={customPrompt}
            onChange={(e) => handleCustomPromptChange(e.target.value)}
            placeholder={getCustomPromptPlaceholder()}
          />
          <CharacterCount $warning={isOverLimit}>
            {customPrompt.length}/{maxLength} characters
            {isOverLimit && ' (too long)'}
          </CharacterCount>
        </CustomPromptSection>
      )}
    </Container>
  );
};