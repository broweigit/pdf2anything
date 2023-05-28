import React, { useState } from 'react';
import { Circle, Label, Tag, Text } from 'react-konva';

const LabelDot = ({ label, x, y, dataX, dataY, antiScale }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  let fill = 'grey'; // 默认灰色
  if (label === 'X1' || label === 'X2') {
    fill = 'blue'; // X 系列颜色为蓝色
  }
  if (label === 'Y1' || label === 'Y2') {
    fill = 'red'; // Y 系列颜色为红色
  } else if (label === 'Ref') {
    fill = 'darkGreen'; // Ref 标签颜色为深绿色
  } else if (label === 'result') {
    fill = 'black'; // result 为黑色？
  }

  return (
    <React.Fragment>
      <Circle
        x={x}
        y={y}
        radius={4}
        fill={fill}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        scale={{x: antiScale, y: antiScale}}
      />
      {isHovered && (
        <Label x={x} y={y - 20} scale={{x: antiScale, y: antiScale}}>
          <Tag
            fill="#FFF"
            stroke="#000"
            pointerDirection="down"
            pointerWidth={10}
            pointerHeight={10}
            lineJoin="round"
            shadowColor="#000"
            shadowBlur={5}
            shadowOffsetX={5}
            shadowOffsetY={5}
          />
          <Text
            text={`${label}: x=${dataX}, y=${dataY}`}
            fontSize={14}
            padding={5}
            fill="#000"
          />
        </Label>
      )}
    </React.Fragment>
  );
};

export default LabelDot;
