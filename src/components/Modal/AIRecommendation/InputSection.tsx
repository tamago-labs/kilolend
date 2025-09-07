import React from 'react';
import { Zap } from 'react-feather';
import {
  InputSection,
  PromptInput,
  TemplatesSection,
  TemplatesLabel,
  TemplateGrid,
  TemplateChip,
  SubmitButton,
  LoadingSpinner,
} from './styled';
import { PROMPT_TEMPLATES } from './constants';

interface AIInputSectionProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onTemplateClick: (template: string) => void;
}

export const AIInputSection: React.FC<AIInputSectionProps> = ({
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
  onTemplateClick,
}) => {
  return (
    <InputSection>
      <PromptInput
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your DeFi strategy goals..."
      />

      <TemplatesSection>
        <TemplatesLabel>Or choose from the templates</TemplatesLabel>
        <TemplateGrid>
          {PROMPT_TEMPLATES.map((template, index) => (
            <TemplateChip key={index} onClick={() => onTemplateClick(template)}>
              {template}
            </TemplateChip>
          ))}
        </TemplateGrid>
      </TemplatesSection>

      <SubmitButton onClick={onSubmit} disabled={!prompt.trim() || isLoading} $loading={isLoading}>
        {isLoading ? (
          <>
            <LoadingSpinner style={{ width: 16, height: 16 }} />
            Analyzing Market Opportunities...
          </>
        ) : (
          <> 
            Submit
          </>
        )}
      </SubmitButton>
    </InputSection>
  );
};
