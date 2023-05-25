import { React, useState } from 'react';
import { Stage, Layer, Text, Group, Rect, Image } from 'react-konva';
import { Layout, theme, Affix, Space, Button, FloatButton } from 'antd';
import { RightOutlined, LeftOutlined, FileOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';

import LabelRect from './LabelRect';
import MyModal from './CompareModal';

import sendPdf from '../services/sendPdf';
import sendImage from '../services/sendImage';

import { cutImage } from '../utils/cutImgROI';
import extractTable from '../services/tableExtract';
import extractText from '../services/textExtract';

const { Content } = Layout;

const StageComponent = ({ width, height, rectLayer, rectView, setRectView, 
  selectedId, setSelectedId, imgList, setImgList, selPageId, setSelPageId, cropCanvas, setCropCanvas, 
  ocrLang, setCurrStage, formValue, setFormValue }) => {

  const [stageRef, setStageRef] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFile(files);
  }

  const handleFileSelect = (e) => {
    const files = e.target.files;
    handleFile(files);
  };

  // 松鼠标，放文件
  const handleFile = async (files) => {

    for (const file of files) {
      const reader = new FileReader();

      reader.onload = (event) => {
        new Promise((resolve) => {
          if (file.type === 'application/pdf') {
            sendPdf(file, resolve);
          } 
          else if (file.type.includes('image')) {
            sendImage(file, resolve);
          }
        }).then((image_list) => {
          setImgList(image_list);
          const image = image_list[selPageId];

          const stage = stageRef.getStage();
          const ratio = image.width / image.height;
          let newScale, offX, offY;
          if (stage.width() / stage.height() > ratio) {
            // Stage 宽高比大于图片比例，按高度缩放
            newScale = stage.height() / image.height;
            offX = (stage.width() - stage.height() * ratio) / 2;
            offY = 0;
          } else {
            // Stage 宽高比小于图片比例，按宽度缩放
            newScale = stage.width() / image.width;
            offX = 0;
            offY = (stage.height() - stage.width() / ratio) / 2;
          }
          stage.scale({ x: newScale, y: newScale });
          stage.position({x: offX, y: offY})
        });
      }
      reader.readAsDataURL(file);
    }

  }

  const handleDragOver = (e) => {
    e.preventDefault();
  }

  // 鼠标滚轮，放缩整体
  
  const handleWheel = (e) => {
    if (!imgList) {
      return;
    }
    e.evt.preventDefault(); // 阻止默认事件
    const stage = stageRef;
    const pointerPos = stage.getPointerPosition(); // 获取鼠标在舞台中的位置
    const mousePointTo = {
      x: (pointerPos.x - stage.x()) / stage.scaleX(), // 获取鼠标在缩放前画布中的相对位置
      y: (pointerPos.y - stage.y()) / stage.scaleY(),
    };
    const newScale = Math.max(0.2, stage.scaleX() - e.evt.deltaY / 2000); // 计算新的缩放比例
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
      const canvas = cutImage(imgList[selPageId], bbox)

      let ocrResult = null;
      // 根据label选择service
      if (rectTarget.label === 'table') {
        // 表格识别
        extractTable(bbox, setFormValue, selPageId);
      }
      else if (rectTarget.label === 'title' 
        || rectTarget.label === 'text' 
        || rectTarget.label === 'reference') {
        // 文本识别
        extractText(bbox, setFormValue, ocrLang, selPageId);
      }
      else if (rectTarget.label === 'figure') {
        // Stage转交给plot
        setCurrStage('plot');
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

  const handleFileButtonClick = () => {
    document.getElementById('fileInput').click();
  };

  const handleNextImage = () => {
    if (selPageId < imgList.length - 1) {
      setSelPageId((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (selPageId > 0) {
      setSelPageId((prevIndex) => prevIndex - 1);
    }
  };

  const handleDelete = () => {
    setImgList(null);
    setSelPageId(0);
    fetch('http://localhost:5000/upload-reset', {
      method: 'POST',
    })
      .then((response) => {
        if (response.ok) {
          console.log('Reset request sent: Success');
        } else {
          console.log('Reset request sent: Error');
        }
      })
      .catch((error) => {
        console.error('Error resetting Files:', error);
      });
  };

  // 主题颜色
  const {
    token: { colorPrimaryBgHover, colorTextHeading, colorPrimary },
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
                scaleX={1}
                scaleY={1}
                onWheel={handleWheel}
                draggable={imgList}
            >
                <Layer onClick={handleLostFocus}>
                    <Group visible={!imgList}>
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
                    {imgList && (
                      <Image
                        image={imgList[selPageId]}
                      />
                    )}
                </Layer>
                <Layer>
                {rectLayer.map((rect) => (
                  <LabelRect
                    id={rect.id}
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    initLabel={rect.label}
                    isSelected={selectedId === rect.id}
                    onSelect={rect.onSelect}
                    callRectView={(caller, newProps) => callRectView(rect.id, caller, newProps)}
                  />
                ))}

                </Layer>
            </Stage>
            
            <input
              id="fileInput"
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              multiple
            />

            <FloatButton.Group
              shape="circle"
              style={{
                right: 40,
              }}
              trigger="click"
            >
              <FloatButton
                icon={<FileOutlined />}
                tooltip={<div>Select Files: images, pdf</div>}
                onClick={handleFileButtonClick}
                type="primary"
              />
              {imgList && (
                <>
                  <FloatButton
                    icon={<LeftOutlined />}
                    tooltip={<div>Previous Page</div>}
                    badge={{ count: selPageId, color: colorPrimary}}
                    onClick={handlePrevImage}
                  />
                  <FloatButton
                    icon={<RightOutlined />}
                    tooltip={<div>Next page</div>}
                    badge={{ count: imgList.length - selPageId - 1, color: colorPrimary}}
                    onClick={handleNextImage}
                  />
                  <FloatButton
                    icon={<PlayCircleOutlined />}
                    tooltip={<div>Layout analysis</div>}
                  />
                  <FloatButton
                    icon={<DeleteOutlined />}
                    tooltip={<div>Clear all pages</div>}
                    onClick={handleDelete}
                  />
                </>
              )}
            </FloatButton.Group>

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