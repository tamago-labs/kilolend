import React from 'react';
import styled from 'styled-components';
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

const Container = styled.div`
  display: flex;
  flex-direction: column; 
  padding: 24px;

  @media (max-width: 480px) {
    padding: 20px;
  }

`;

interface CharacterSelectionStepProps {
  selectedCharacter: AgentPreset | null;
  onCharacterSelect: (character: AgentPreset) => void;
  onNext: () => void;
}

export const CharacterSelectionStep: React.FC<CharacterSelectionStepProps> = ({
  selectedCharacter,
  onCharacterSelect,
  onNext,
}) => {
  return (
    <Container>
 
      <StepTitle>Choose Your AI Character</StepTitle>
      <StepSubtitle>
        Select a personality that matches your trading style
      </StepSubtitle>

      <CharacterGrid>
        {AGENT_PRESETS.slice(0, 4).map((character) => (
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
 
    </Container>
  );
};
