import { React, useEffect, useState, useRef } from 'react';
import { Stage, Layer, Text, Group, Rect, Image } from 'react-konva';
import { Layout, theme, FloatButton, Modal, Form, Input, Drawer } from 'antd';
import { RightOutlined, LeftOutlined, FileOutlined, PlayCircleOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';

import LabelRect from './LabelRect';
import MyModal from './CompareModal';

import sendPdf from '../services/sendPdf';
import sendImage from '../services/sendImage';

import { cutImage } from '../utils/cutImgROI';
import extractTable from '../services/tableExtract';
import extractText from '../services/textExtract';
import { resetUpload } from '../services/reset';

const { Content } = Layout;

const StageComponent = ({ width, height, setRectData, rectLayer, rectView, setRectView, 
  selectedId, setSelectedId, imgList, setImgList, selPageId, setSelPageId, cropCanvas, setCropCanvas, 
  ocrLang, setCurrStage, formValue, setFormValue, handleOpenSaveModal, refreshStagePosFunc, callChatFunc, 
  showChat, setRepaintReqOnViewUpdate, projectName
}) => {

  const [stageRef, setStageRef] = useState(null);
  const [floatButtonOffset, setFloatButtonOffset] = useState(60);

  // 用于使部分Stage内组件显示大小恒定：
  const [antiScale, setAntiScale] = useState(1);

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
      const prev_list_len = imgList? imgList.length : 0;

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
          refreshStagePos(image);
          setSelPageId(prev_list_len);
        });
      }
      reader.readAsDataURL(file);
    }

  }

  const handleDragOver = (e) => {
    e.preventDefault();
  }

  // 经常要用的重新定位stage
  const refreshStagePos = (image) => {
    const stage = stageRef;
    if (stage) {
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
      setAntiScale(1 / newScale);
    }
  }

  refreshStagePosFunc.current = refreshStagePos;

  useEffect(() => {
    if (imgList) {
      refreshStagePos(imgList[selPageId]);
    }
    setFloatButtonOffset(window.innerWidth - width - 220 + 60);
  }, [width, height]);

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
    setAntiScale(1 / newScale);
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
    // 在这里处理表单提交的逻辑，包括更新RectView，以及绘制？？TODO
    console.log('表单提交成功', formValue);
    setRepaintReqOnViewUpdate(true);
    RectViewUpdate(selectedId, {result: formValue});
  };

  const handleClear = () => {
    // 在这里处理清空表单的逻辑
    setFormValue('');
    console.log('表单已清空');
  };

  // LabelRect对象发生任何变化，都需要向上通过call函数以不同命令更新rectLayer
  const callRectView = (id, caller, newProps) => {

    // 更新：将新数据覆盖到对应id的View上
    if (caller === 'update') {
      RectViewUpdate(id, newProps);
    }
    
    // 删除对应id的View
    else if (caller === 'delete') {
      RectViewDelete(id);
    }

    // OCR提取信息
    else if (caller === 'extract') {
      const rectTarget = rectView[selPageId].find(rect => rect.id === id);
      const bbox = [rectTarget.x, rectTarget.y, rectTarget.width, rectTarget.height];

      // 将cropImg绘制到一个canvas上
      const canvas = cutImage(imgList[selPageId], bbox)

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

      // 更新RectView(延后到Modal Submit)
    }

    // 与chatgpt互动
    else if (caller === 'chat') {
      const rectTarget = rectView[selPageId].find(rect => rect.id === id);
      console.log(rectTarget)
      callChatFunc.current(rectTarget.result);
    }

    else {
      alert(`callRectView caller ERROR, No ${caller} is availible`)
    }
  }
  // 封装将newProps添加到RectView的操作
  const RectViewUpdate = (id, newProps) => {
    setRectView(prevState => {
      const newView = { ...prevState };
      if (newView[selPageId]) {
        newView[selPageId] = newView[selPageId].map(rect => {
          if (rect.id === id) {
            return {
              ...rect,
              ...newProps,
            };
          }
          return rect;
        });
      } else {
        alert('Error, RectView caller run into unexpected pageId!');
      }
      return newView;
    });
  }
  // 封装将某id的rect从RectView移除的操作
  const RectViewDelete = (id) => {
    setRectView(prevState => {
      const newView = { ...prevState };
      if (newView[selPageId]) {
        newView[selPageId] = prevState[selPageId].filter(rect => rect.id !== id);
      } else {
        alert('Error, RectView caller run into unexpected pageId!');
      }
      return newView;
    });
  }

  const RectViewAdd = (id, type, bbox) => {
    setRectView(prevState => {
      const newView = { ...prevState };
      if (newView[selPageId]) {
        const existingRect = prevState[selPageId].find(rect => rect.id === id);
        if (existingRect) {
          // ID 已存在，执行相应的逻辑（如提示错误、忽略等）
          alert(`Error: ID ${id} already exists in rectView!`);
          return prevState; // 返回之前的状态，不做任何修改
        } else {
          newView[selPageId] = [...prevState[selPageId], { 
            id, 
            x: bbox[0], 
            y: bbox[1],
            width: bbox[2],
            height: bbox[3],
            label: type,
            hasOCR: false 
          }];
        }
      } else {
        alert('Error, RectView caller encountered unexpected pageId!');
      }
      return newView;
    });
  };

  // 以下为工具按钮事件(添加矩形框)
  const handleToolClick = (label) => {
    setRepaintReqOnViewUpdate(true);
    let index = 0;
    let id = `rect${selPageId}-${index}`;
    while (rectView[selPageId].some(rect => rect.id === id)) {
      index++;
      id = `rect${selPageId}-${index}`;
    }
    const stage = stageRef;
    const stagePos = stage.position();
    console.log(stagePos);
    RectViewAdd(id, label, [-stagePos.x, -stagePos.y, 200, 200]);
  };


  // 以下为悬浮按钮事件处理
  const handleFileButtonClick = () => {
    document.getElementById('fileInput').click();
  };

  const handleNextImage = () => {
    if (selPageId < imgList.length - 1) {
      setSelPageId((prevIndex) => prevIndex + 1);
      refreshStagePos(imgList[selPageId + 1]);
    }
  };

  const handlePrevImage = () => {
    if (selPageId > 0) {
      setSelPageId((prevIndex) => prevIndex - 1);
      refreshStagePos(imgList[selPageId - 1]);
    }
  };

  const handleDelete = () => {
    // 清空初始化
    setRectView({});
    setRectData([]);
    setImgList(null);
    setSelPageId(0);
    setSelectedId(null);
    const stage = stageRef;
    stage.scale({ x: 1, y: 1 });
    setAntiScale(1);
    stage.position({x: 0, y: 0})
    resetUpload();
  };

  // 一个Modal，用于给所有Konva提供输入Form
  // 传参: setModalVisible，inputValue和setCallback
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const callbackRef = useRef(null);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleModalConfirm = () => {
    if (callbackRef.current) {
      callbackRef.current(inputValue); // 通过 callbackRef 调用最新的回调函数
    }
    setModalVisible(false);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  // tools 的动效 TODO

  // 主题颜色
  const {
    token: { colorPrimaryBgHover, colorTextHeading, colorPrimary, colorFillAlter, colorBorderSecondary, borderRadiusLG },
  } = theme.useToken();

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
    background: colorFillAlter,
    borderRadius: borderRadiusLG,
  };
  
  const cardToolData = [
    { show: 'text', label: 'text', color: 'darkblue' },
    { show: 'table', label: 'table', color: 'darkgreen' },
    { show: 'title', label: 'title', color: 'blue' },
    { show: 'ref', label: 'reference', color: 'green' },
    { show: 'figure', label: 'figure', color: 'red' }
  ];

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
          <div style={containerStyle}>
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
                        modalUtils={{setModalVisible, callbackRef}}
                        antiScale={antiScale}
                        hasOCR={rect.hasOCR}
                        showChat={showChat}
                      />
                  ))}

                </Layer>
            </Stage>

            <Modal
              title="输入"
              open={modalVisible}
              onOk={handleModalConfirm}
              onCancel={handleModalCancel}
            >
              <Form>
                <Form.Item label="类型">
                  <Input value={inputValue} onChange={handleInputChange} />
                </Form.Item>
              </Form>
            </Modal>
            
            <input
              id="fileInput"
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              multiple
            />

            {imgList && (
              <>
                <FloatButton
                  icon={<LeftOutlined />}
                  badge={{ count: selPageId, color: colorPrimary}}
                  onClick={handlePrevImage}
                  style={{
                    right: 150 + floatButtonOffset,
                    border: `2px solid ${colorPrimary}`
                  }}
                />
                <FloatButton
                  description={`P${selPageId + 1}`}
                  shape="square"
                  style={{
                    right: 100 + floatButtonOffset,
                    border: `2px solid ${colorPrimary}`
                  }}
                />
                <FloatButton
                  icon={<RightOutlined />}
                  badge={{ count: imgList.length - selPageId - 1, color: colorPrimary}}
                  onClick={handleNextImage}
                  style={{
                    right: 50 + floatButtonOffset,
                    border: `2px solid ${colorPrimary}`
                  }}
                />
              </>
            )}

            <FloatButton.Group
              shape="circle"
              style={{
                right: floatButtonOffset,
              }}
              trigger="click"
              className='floatbutton'
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
                    icon={<PlayCircleOutlined />}
                    tooltip={<div>Layout analysis</div>}
                  />
                  <FloatButton
                    icon={<DeleteOutlined />}
                    tooltip={<div>Clear all pages</div>}
                    onClick={handleDelete}
                  />
                  <FloatButton
                    icon={<SaveOutlined />}
                    tooltip={<div>Save Project</div>}
                    onClick={handleOpenSaveModal}
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
            <Drawer
              title={`当前项目：${projectName}    ⬇下滚查看工具栏`}
              placement="top"
              mask={false}
              open={imgList}
              height={55}
              closable={false}
              zIndex={'0'}
              getContainer={false}
              className='tool'
            >
              <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                {cardToolData.map((tool, index) => (
                  <button
                    key={index}
                    style={{
                      width: '60px',
                      height: '40px',
                      marginRight: '16px',
                      border: '4px solid',
                      borderRadius: '5px',
                      borderColor: tool.color,
                      backgroundColor: 'transparent',
                      fontFamily: 'Calibri',
                      fontSize: '20px',
                      color: tool.color,
                      cursor: 'pointer', // 添加鼠标指针样式
                    }}
                    onClick={() => {handleToolClick(tool.label)}} // 添加点击事件处理函数
                  >
                    {tool.show}
                  </button>
                ))}
              </div>

            </Drawer>
          </div>
        </Content>
    </Layout>
  );
};

export default StageComponent;