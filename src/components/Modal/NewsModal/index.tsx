'use client';

import { DialogModal } from '../DialogModal';
import styled from 'styled-components';
import { CardSwiper } from '@/components/Swiper/CardSwiper';

const NewsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 400px;
`;

const NewsSlide = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
`;

const NewsImage = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  background: #f1f5f9;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NewsText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NewsTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
`;

const NewsDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

const NewsFooter = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 8px;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #00C300, #00A000);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 195, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Hardcoded news data
const newsItems = [
  {
    image: './images/poster-v1.png',
    title: 'V1 is Live',
    description: 'Migrate your assets from the hackathon version to v.1 and receive 100 $KAIA reward'
  },
  {
    image: './images/poster-tbw.png',
    title: 'Thailand Blockchain Week',
    description: 'Meet our team at Thailand Blockchain Week in Bangkok and hear about our latest features on stage'
  },
  {
    image: './images/poster-vibe-trading.png',
    title: 'Vibe Trading with AI',
    description: 'Read our latest blog on how to use KAIA-MCP for AI-driven vibe trading across KiloLend, DragonSwap and more'
  }
];


interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsModal = ({ isOpen, onClose }: NewsModalProps) => {
  const handleClose = () => {
    onClose();
  };

  const newsSlides = newsItems.map((news, index) => (
    <NewsSlide key={index}>
      <NewsImage>
        <img src={news.image} alt={news.title} />
      </NewsImage>
      <NewsText>
        <NewsTitle>{news.title}</NewsTitle>
        <NewsDescription>{news.description}</NewsDescription>
      </NewsText>
    </NewsSlide>
  ));

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Latest News & Updates"
    >
      <NewsContent>
        <div style={{ height: '300px', position: 'relative' }}>
          <CardSwiper
            autoPlay={true}
            autoPlayInterval={7000}
            showDots={true}
          >
            {newsSlides}
          </CardSwiper>
        </div>

        <NewsFooter>
          <CloseButton onClick={handleClose}>
            Close
          </CloseButton>
        </NewsFooter>
      </NewsContent>
    </DialogModal>
  );
};
