

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

const images = [
  "./images/icon-robot.png",
  "./images/icon-tiger.png",
  "./images/icon-penguin.png",
  "./images/icon-snake.png"
];


const IconImage = styled.img`
  width: 80%;
  height: 80%;
  object-fit: contain;
  
  @media (max-width: 480px) {
    width: 65%;
    height: 65%;
  }
`;

const slideInLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutLeft = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const SwiperContainer = styled.div`
  position: relative;
  width: 80%;
  height: 80%;
  overflow: hidden;
 
`;

const SwiperSlide = styled.img<{ $direction: "left" | "right"; $animateOut?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;

  animation: ${({ $direction, $animateOut }) => {
      if ($direction === "left") return $animateOut ? slideOutLeft : slideInLeft;
      if ($direction === "right") return $animateOut ? slideOutRight : slideInRight;
      return "none";
    }}
    0.6s ease forwards;
`;

const RandomIcon = () => {

	const [currentImage, setCurrentImage] = useState(images[0]);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // animate out first
      setAnimateOut(true);

      // after out animation, change image + direction
      setTimeout(() => {
        const newImg = images[Math.floor(Math.random() * images.length)];
        const newDir = Math.random() > 0.5 ? "left" : "right";
        setCurrentImage(newImg);
        setDirection(newDir);
        setAnimateOut(false);
      }, 600); // match animation duration
    }, Math.floor(Math.random() * 5000) + 5000); // 5–10s random

    return () => clearInterval(interval);
  }, []);


	return (
		 <SwiperContainer>
      <SwiperSlide
        src={currentImage}
        alt="random-icon"
        $direction={direction}
        $animateOut={animateOut}
      />
    </SwiperContainer>
		)
}

export default RandomIcon