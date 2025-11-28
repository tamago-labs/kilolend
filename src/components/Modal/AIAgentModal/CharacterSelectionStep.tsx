import React from 'react';
import { AGENT_PRESETS } from '@/types/aiAgent';
import type { AgentPreset } from '@/types/aiAgent';
import {
  CharacterGrid,
  CharacterCard,
  CharacterAvatar,
  CharacterAvatarImage,
  CharacterName,
  StepTitle,
  StepSubtitle,
  ButtonContainer,
  Button,
  InfoBox
} from './styled';

interface CharacterSelectionStepProps {
  selectedCharacter: AgentPreset | null;
  onCharacterSelect: (character: AgentPreset) => void;
  onNext: () => void;
}

// Custom agent preset for the "Stay Tuned" card
const CUSTOM_AGENT_PRESET: AgentPreset = {
  id: 'custom_agent',
  name: 'Custom Agent',
  description: 'Create your own personalized AI agent',
  personality: 'custom',
  avatar: '🎨',
  image: './images/icon-robot.png',
  systemPrompt: '',
  defaultPreferences: {
    riskTolerance: 'medium',
    focusAreas: [],
    communicationStyle: 'friendly'
  }
};


export const CharacterSelectionStep: React.FC<CharacterSelectionStepProps> = ({
  selectedCharacter,
  onCharacterSelect,
  onNext,
}) => {
  return (
    <>
 
      <StepTitle>Choose Your AI Character</StepTitle>
      <StepSubtitle>
        Select a personality that matches your trading style
      </StepSubtitle>

      <CharacterGrid>
        {AGENT_PRESETS.slice(0, 3).map((character) => (
          <CharacterCard
            key={character.id}
            $selected={selectedCharacter?.id === character.id}
            onClick={() => onCharacterSelect(character)}
          >
            <CharacterAvatar>
              <CharacterAvatarImage
                src={character.image}
                alt={character.name}
              />
            </CharacterAvatar>
            <CharacterName>{character.name}</CharacterName>
          </CharacterCard>
        ))}
        
        {/* Custom Agent Card */}
        <CharacterCard
          key="custom-agent"
          $selected={selectedCharacter?.id === 'custom_agent'}
          onClick={() => onCharacterSelect(CUSTOM_AGENT_PRESET)}
        >
          <CharacterAvatar>
            <CharacterAvatarImage
              src={CUSTOM_AGENT_PRESET.image}
              alt={CUSTOM_AGENT_PRESET.name}
            />
          </CharacterAvatar>
          <CharacterName>{CUSTOM_AGENT_PRESET.name}</CharacterName>
        </CharacterCard>
      </CharacterGrid>

      <ButtonContainer>
        <Button
          $variant="primary"
          onClick={onNext}
          disabled={!selectedCharacter}
        >
          Next Step
        </Button>
      </ButtonContainer>
 
    </>
  );
};
