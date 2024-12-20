import React from "react";
import styled, { keyframes } from "styled-components";

const quiet = keyframes`
  25% {
    transform: scaleY(0.6);
  }
  50% {
    transform: scaleY(0.4);
  }
  75% {
    transform: scaleY(0.8);
  }
`;

const normal = keyframes`
  25% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.4);
  }
  75% {
    transform: scaleY(0.6);
  }
`;

const loud = keyframes`
  25% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.4);
  }
  75% {
    transform: scaleY(1.2);
  }
`;

const BoxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: 1em;
  --boxSize: 8px;
  --gutter: 4px;
  width: calc((var(--boxSize) + var(--gutter)) * 5);
`;

interface BoxProps {
  color?: string;
}

const Box = styled.div<BoxProps>`
  transform: scaleY(0.4);
  height: 100%;
  width: var(--boxSize);
  background: ${(props) => props.color || "#12e2dc"};
  animation-duration: 1.2s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  border-radius: 8px;
`;

const Box1 = styled(Box)`
  animation-name: ${quiet};
`;

const Box2 = styled(Box)`
  animation-name: ${normal};
`;

const Box3 = styled(Box)`
  animation-name: ${quiet};
`;

const Box4 = styled(Box)`
  animation-name: ${loud};
`;

const Box5 = styled(Box)`
  animation-name: ${quiet};
`;

interface AnimatedWavesProps {
  color?: string;
}

const AnimatedWaves: React.FC<AnimatedWavesProps> = ({ color }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <BoxContainer>
        <Box1 color={color} />
        <Box2 color={color} />
        <Box3 color={color} />
        <Box4 color={color} />
        <Box5 color={color} />
      </BoxContainer>
    </div>
  );
};

export default AnimatedWaves;
