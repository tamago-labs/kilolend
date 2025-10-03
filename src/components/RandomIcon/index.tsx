import React, { useState, useEffect } from "react";
import styled from "styled-components";

const images = [
  "./images/icon-robot.png",
  "./images/icon-tiger.png",
  "./images/icon-penguin.png",
  "./images/icon-snake.png"
];

const SwiperContainer = styled.div`
  position: relative;
  width: 80%;
  height: 80%;
  overflow: hidden;
`;

const SwiperSlide = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const RandomIcon = () => {
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    // Pick a random image once when mounted
    const newImg = images[Math.floor(Math.random() * images.length)];
    setCurrentImage(newImg);
  }, []);

  return (
    <SwiperContainer>
      {currentImage && (
        <SwiperSlide src={currentImage} alt="random-icon" />
      )}
    </SwiperContainer>
  );
};

export default RandomIcon;
