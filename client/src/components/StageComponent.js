import { React, useState } from 'react';
import { Stage, Layer, Text, Line, Group, Rect } from 'react-konva';
import { Layout, theme } from 'antd';

import sendImage from '../services/sendImage';
import LabelRect from './LabelRect';
import MyModal from './CompareModal';

import { cutImage } from '../utils/cutImgROI';
import extractTable from '../services/tableExtract';
import extractText from '../services/textExtract';
import extractPlot from '../services/plotDigitalize';

const { Content } = Layout;

const StageComponent = ({ width, height, rectLayer, rectView, setRectView, selectedId, setSelectedId, img, setImg, cropCanvas, setCropCanvas, ocrLang }) => {
    const [stageRef, setStageRef] = useState(null);
    const [uploadRef, setUploadRef] = useState(null);
    // 只有在操作图片时解禁拖动，放缩
    const [isImgLoaded, setIsImgLoaded] = useState(false);

    // 松鼠标，放文件
    const handleDrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        // 读取文件内容并显示
        const reader = new FileReader();
        reader.onload = (event) => {
        const newImg = new window.Image();
        newImg.src = event.target.result;
        newImg.onload = async () => {
          // 发往后端
          sendImage(file);
          // 设置前端img
          setImg(newImg);

          const stage = stageRef.getStage();
          const layer = stage.findOne('Layer');
          const konvaImg = new window.Image();
          konvaImg.src = event.target.result;
          konvaImg.onload = () => {
            const ratio = newImg.width / newImg.height;
            let newScale, offX, offY;
            if (stage.width() / stage.height() > ratio) {
              // Stage 宽高比大于图片比例，按高度缩放
              newScale = stage.height() / newImg.height;
              offX = (stage.width() - stage.height() * ratio) / 2;
              offY = 0;
            } else {
              // Stage 宽高比小于图片比例，按宽度缩放
              newScale = stage.width() / newImg.width;
              offX = 0;
              offY = (stage.height() - stage.width() / ratio) / 2;
            }
            stage.scale({ x: newScale, y: newScale });
            // stage.offsetX(-offX);
            // stage.offsetY(-offY);
            stage.position({x: offX, y: offY})
            uploadRef.visible(false);
            layer.batchDraw();
            layer.add(
              new window.Konva.Image({
                image: konvaImg,
                x: 0,
                y: 0,
                width: newImg.width,
                height: newImg.height,
              })
            );
            layer.draw();

            setIsImgLoaded(true)
          }
        }
    }
    reader.readAsDataURL(file);
  }

  const handleDragOver = (e) => {
    e.preventDefault();
  }

  // 鼠标滚轮，放缩整体
  const [scale, setScale] = useState(1);
  
  const handleWheel = (e) => {
    if (!isImgLoaded) {
      return;
    }
    e.evt.preventDefault(); // 阻止默认事件
    const stage = stageRef;
    const pointerPos = stage.getPointerPosition(); // 获取鼠标在舞台中的位置
    const mousePointTo = {
      x: (pointerPos.x - stage.x()) / stage.scaleX(), // 获取鼠标在缩放前画布中的相对位置
      y: (pointerPos.y - stage.y()) / stage.scaleY(),
    };
    const newScale = Math.max(0.3, stage.scaleX() - e.evt.deltaY / 500); // 计算新的缩放比例
    stage.scale({ x: newScale, y: newScale }); // 缩放画布
    const newPos = {
      x: pointerPos.x - mousePointTo.x * newScale, // 计算缩放后画布需要平移的距离
      y: pointerPos.y - mousePointTo.y * newScale,
    };
    stage.position(newPos); // 平移画布
    stage.batchDraw(); // 更新画布
  };

  // 鼠标点击LabelRect以外的区域
  const handleLostFocus = (e) => {
    setSelectedId(null);
  };

  // 识别结果对比表单
  const [formValue, setFormValue] = useState(''); // 表单的值
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = () => {
    // 在这里处理表单提交的逻辑，例如发送请求等操作
    console.log('表单提交成功', formValue);
  };

  const handleClear = () => {
    // 在这里处理清空表单的逻辑
    setFormValue('');
    console.log('表单已清空');
  };

  // 用于给LabelRect变换后更新rectLayer
  const callRectView = (id, caller, newProps) => {

    // 更新：将新数据覆盖到对应id的View上
    if (caller === 'update') {
      setRectView(prevState => prevState.map(rect => {
        if (rect.id === id) {
          return {
            ...rect,
            ...newProps,
          };
        }
        return rect;
      }));
    }
    
    // 删除对应id的View
    else if (caller === 'delete') {
      setRectView(prevState => prevState.filter(rect => rect.id !== id));
    }

    // OCR提取信息
    else if (caller === 'extract') {
      const rectTarget = rectView.find(rect => rect.id === id);
      const bbox = [rectTarget.x, rectTarget.y, rectTarget.width, rectTarget.height];

      // 将cropImg绘制到一个canvas上
      const canvas = cutImage(img, bbox)

      let ocrResult = null;
      // 根据label选择service
      if (rectTarget.label === 'table') {
        // 表格识别
        extractTable(bbox, setFormValue);
      }
      else if (rectTarget.label === 'title' 
        || rectTarget.label === 'text' 
        || rectTarget.label === 'reference') {
        // 文本识别
        extractText(bbox, setFormValue, ocrLang);
      }
      else if (rectTarget.label === 'figure') {
        // 数据提取
        // Debug Test
        const x1 = [461,688,'0','0'];
        const x2 = [1785,688,'3','0'];
        const y1 = [461,688,'0','0'];
        const y2 = [461,204,'0','2'];
        const refColor = [228,49,52];
        extractPlot(canvas, setFormValue, x1,x2,y1,y2,refColor);
      }

      setCropCanvas(canvas);
      setIsModalOpen(true);

      // 更新RectView
      setRectView(prevState => prevState.map(rect => {
        if (rect.id === id) {
          return {
            ...rect,
            ...{result: ocrResult},
          };
        }
        return rect;
      }));
    }

    else {
      alert('callRectView caller ERROR, No ', caller)
    }
  }

  // 主题颜色
  const {
    token: { colorPrimaryBgHover, colorTextHeading },
  } = theme.useToken();

  return (
    <Layout onDrop={handleDrop} onDragOver={handleDragOver}>
        
        <Content
            style={{
                padding: 10,
                margin: 0,
                minHeight: 280,
                background: colorPrimaryBgHover
            }}
        >
            <Stage 
                width={width} 
                height={height} 
                ref={setStageRef}
                scaleX={scale}
                scaleY={scale}
                onWheel={handleWheel}
                draggable={isImgLoaded}
            >
                <Layer onClick={handleLostFocus}>
                    <Group visible={true} ref={setUploadRef}>
                        <Rect
                            x={10}
                            y={10}
                            align="center"
                            width={width - 20}
                            height={height - 20}
                            stroke={colorTextHeading}
                            strokeWidth={3}
                            cornerRadius={10}
                            dash={[10, 5]} // 添加虚线边框
                        />
                        <Text
                            className="upload-text"
                            text="请将文件拖曳至此处"
                            fontSize={24}
                            fill={colorTextHeading}
                            x={width / 2  - 128}
                            y={height / 2  - 16}
                        />
                    </Group>
                </Layer>
                <Layer>
                {rectLayer.map((rect) => (
                  <LabelRect
                    id={rect.id}
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    label={rect.label}
                    isSelected={selectedId === rect.id}
                    onSelect={rect.onSelect}
                    callRectView={(caller, newProps) => callRectView(rect.id, caller, newProps)}
                  />
                ))}

                </Layer>
            </Stage>

            <MyModal
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              formValue={formValue}
              setFormValue={setFormValue}
              onConfirm={handleSubmit}
              onCancel={handleClear}
              cropCanvas={cropCanvas}
            />
        </Content>
    </Layout>
  );
};

export default StageComponent;