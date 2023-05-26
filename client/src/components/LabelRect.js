import React, { useRef, useState, useEffect } from "react";
import { Rect, Group, Text, Tag, Label, Transformer } from "react-konva";
import { Button, Modal } from 'antd';

import LabelRectDropdown from "./LabelRectDropdown";
import calcImagePos from "../utils/calcImagePos";

const LabelRect = ({ x, y, width, height, initLabel, isSelected, onSelect, callRectView }) => {
  const groupRef = useRef();
  const labelRef = useRef();
  const rectRef = useRef();
  const trRef = useRef();

  const strokeWidth = 2;
  const fill = "transparent"

  // 依据颜色设置矩形框颜色
  const [stroke, setStroke] = useState("black");
  const [label, setLabel] = useState(initLabel);

  useEffect(() => {
    switch (label) {
      case "text":
        setStroke("darkblue");
        break;
      case "table":
        setStroke("darkgreen");
        break;
      case "title":
        setStroke("blue");
        break;
      case "reference":
        setStroke("green");
        break;
      case "figure":
        setStroke("red");
        break;
      default:
        setStroke("grey");
        break;
    }
  }, [label]);


  // 选中状态变化时
  React.useEffect(() => {
    // 添加选中状态时添加transformer
    if (isSelected) {
      trRef.current.nodes([rectRef.current]);
      trRef.current.getLayer().batchDraw();
    }
    else {
      // 失去焦点，清理Menu
      setShowMenu(false)
    }
  }, [isSelected]);

  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // 右键打开Menu
  const handleContextMenu = (event) => {
    event.evt.preventDefault();
    const stage = event.currentTarget.getStage();
    const mousePos = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const relativeMousePos = transform.point(mousePos);
    setShowMenu(true);
    setMenuPosition({
      x: relativeMousePos.x, 
      y: relativeMousePos.y
    });
  };

  // 左键单击
  const handleClick = (event) => {
    onSelect()
    // 获得当前rect相对与图片的像素位置
    const rect = rectRef.current;
    const stage = rect.getStage();
    const rectAbs = rect.getClientRect();
    console.log({
      x: (rectAbs.x - stage.x()) / stage.scaleX(), 
      y: (rectAbs.y - stage.y()) / stage.scaleY(), 
      width: rect.width(),
      height: rect.height()
    })
    
    setShowMenu(false)
  };

  // 放缩，拖动结束时更新上层RectView数据
  const handleUpdate = (e) => {
    const rect = rectRef.current;
    const stage = rect.getStage();
    const rectAbs = rect.getClientRect();
    const rectStagePos = {x: rectAbs.x, y: rectAbs.y};
    const rectRelPos = calcImagePos(rectStagePos, stage);
    // call update
    callRectView('update', {
      x: rectRelPos.x, 
      y: rectRelPos.y, 
      width: rect.width(), 
      height: rect.height()
    });
  };

  // 下拉栏处理函数
  const handleIdentify = (e) => {
      setShowMenu(false);
      // 处理“识别”选项
      callRectView('extract', {});
  };

  const handleEditType = (e) => {
      setShowMenu(false);
      // 处理“修改类型”选项
      setLabel('text');
      // call update
      callRectView('update', {label: 'text'});
  };

  const handleRemove = (e) => {
      // 处理“删除”选项
      setShowMenu(false);
      const del = groupRef.current;

      // 完全销毁
      // const delTr = trRef.current;
      // del.destroy();
      // delTr.destroy();
      
      // 隐藏，以便重新恢复
      del.visible(false)
      callRectView('delete', {})

  };

  return (
    <React.Fragment>
      <Group
        x={x}
        y={y}
        ref={groupRef}
        onClick={handleClick}
        onTap={handleClick}
        draggable
        onContextMenu={handleContextMenu}
        onDragStart={() => {setShowMenu(false)}}
        onDragEnd={handleUpdate}
      >
        <Rect
          width={width}
          height={height}
          ref={rectRef}
          strokeWidth={strokeWidth}
          stroke={stroke}
          fill={fill}
        />
        <Label y={-18} opacity={0.65} ref={labelRef}>
          <Tag
            pointerDirection={'left'}
            pointerWidth={20}
            pointerHeight={28}
            fill={stroke}
          />
          <Text
            text={label}
            fontFamily="Calibri"
            strokeWidth={2}
            fontSize={28}
            fill={'white'}
          />
        </Label>
      </Group>
      {(isSelected && groupRef.current.visible()) && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          resizeEnabled={true}
          centeredScaling={false}
          anchorSize={10}
          keepRatio={false}
          skipTransform={true}
          onTransform={(e) => {
            const rect = rectRef.current; // 获取Rect节点
            const scaleX = rect.scaleX();
            const scaleY = rect.scaleY();
            rect.width(rect.width() * scaleX); // 直接计算并修改Rect的宽高
            rect.height(rect.height() * scaleY);
            rect.scaleX(1); // 使scale回归正常
            rect.scaleY(1);

            // 移动 label 到正确的位置
            labelRef.current.x(rect.x());
            labelRef.current.y(rect.y() - 18);
          }}
          onTransformEnd={handleUpdate}
        />
      )}
      {showMenu && (
         <LabelRectDropdown 
            x={menuPosition.x} y={menuPosition.y} width={150} height={40}
            handleIdentify={handleIdentify}
            handleEditType={handleEditType}
            handleRemove={handleRemove}/>
      )}
    </React.Fragment>
  );
};

export default LabelRect;
