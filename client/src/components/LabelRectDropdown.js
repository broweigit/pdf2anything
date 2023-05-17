import React, { useState } from "react";
import { Rect, Text, Layer, Group } from "react-konva";
  
const LabelRectDropdown = ({ x, y, width, height, handleIdentify, handleEditType, handleRemove }) => {
    
    const items = [
        {
            label: '识别',
            key: '1',
            handleSelect: handleIdentify
        },
        {
            label: '修改类型',
            key: '2',
            handleSelect: handleEditType
        },
        {
            label: '删除',
            key: '3',
            handleSelect: handleRemove
        },
    ]

    return (
        <Group>

            {items.map((item, index) => (
                <Group
                    key={item.key}
                    x={x}
                    y={y + height * (index)}
                    onClick={item.handleSelect}
                    onTap={item.handleSelect}
                >
                    <Rect
                    width={width}
                    height={height}
                    fill="white"
                    stroke="black"
                    />
                    <Text
                    x={10}
                    y={10}
                    text={item.label}
                    />
                </Group>
            ))}

        </Group>
    );
};

export default LabelRectDropdown;