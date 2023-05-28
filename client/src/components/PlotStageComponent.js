import { React, useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import { Layout, theme, Modal, Form, Input, FloatButton } from 'antd';

import LabelDot from './LabelDot';
import calcImagePos from '../utils/calcImagePos';
import extractPlot from '../services/plotDigitalize';

const { Content } = Layout;

const PlotStageComponent = ({ width, height, cropCanvas, currStage, setFormValue }) => {
  const stageRef = useRef(null);
  const imgLayerRef = useRef(null);
  const dotLayerRef = useRef(null);

  // 拾色器
  const [color, setColor] = useState('');
  const [rgb, setRgb] = useState('');
  const colorRectRef = useRef(null);
  const colorTextRef = useRef(null);

  // 图上所有点的存放
  const [dotsData, setDotsData] = useState([]);

  // 当前Stage的状态
  const [opState, setOpState] = useState('X1');
  // 控制Modal的显示
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  // Modal内部需要获取的信息
  const [modalForm, setModalForm] = useState({});
  // 临时存储（实际XY像素坐标）
  const [temp, setTemp] = useState({});

  const formRef = useRef(null);

  // 状态转移
  const toNextState = () => {
    switch (opState) {
      case 'X1':
        setOpState('X2');
        break;
      case 'X2':
        setOpState('Y1');
        break;
      case 'Y1':
        setOpState('Y2');
        break;
      case 'Y2':
        setOpState('Ref');
        break;
      case 'Ref':
        setOpState('result');
        break;
      case 'result':
        setOpState('X1');
        break;
      default:
        // 处理未知状态
        break;
    }
  };

  // 设置当前展示Plot
  useEffect(() => {
    if (currStage === 'plot') {
      const newImg = new Image();
      newImg.src = cropCanvas.toDataURL();
      newImg.onload = () => {
        const stage = stageRef.current;
        const layer = imgLayerRef.current;
        console.log(layer)
        
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
        stage.position({x: offX, y: offY});
        layer.batchDraw();
        layer.add(
          new window.Konva.Image({
            image: newImg,
            x: 0,
            y: 0,
            width: newImg.width,
            height: newImg.height
          })
        );
        layer.draw();
      };
    }
  }, []);

  // 鼠标滚轮，放缩整体
  
  const handleWheel = (e) => {
    e.evt.preventDefault(); // 阻止默认事件
    const stage = stageRef.current;
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

  // 点击添加锚点
  const handleStageClick = (e) => {
    const stage = stageRef.current;
    const layer = dotLayerRef.current;

    // 获取点击位置相对于舞台的坐标
    const pos = calcImagePos(stage.getPointerPosition(), stage);
    if (opState === 'X1' || opState === 'X2' || opState === 'Y1' || opState === 'Y2' ) {
      // 显示Modal
      setModalForm({X: null, Y: null});
      setTemp({x: pos.x, y: pos.y})
      setIsModalVisible(true);
    } else if (opState === 'Ref'){
      const X1 = dotsData.find(obj => obj.label === 'X1');
      const X2 = dotsData.find(obj => obj.label === 'X2');
      const Y1 = dotsData.find(obj => obj.label === 'Y1');
      const Y2 = dotsData.find(obj => obj.label === 'Y2');
      setModalForm({ X1, X2, Y1, Y2 });
      setIsConfirmModalVisible(true);
    } else {
      alert('重新识别？');
      setDotsData([]);
      toNextState();
    }

    // 更新图层
    layer.batchDraw();
  };

  // Modal事件
  const handleModalConfirm = () => {
    // 创建新的数据对象
    const newData = {
      label: opState,
      x: temp.x,
      y: temp.y,
      dataX: modalForm.X,
      dataY: modalForm.Y
    };
    // 更新 dotsData 数组
    setDotsData((prevData) => [...prevData, newData]);
    console.log(dotsData);

    setIsModalVisible(false);
    toNextState();
  };

  const handleConfirmModalConfirm = () => {
    setIsConfirmModalVisible(false);
    toNextState();
    // 数据提取
    const X1 = modalForm.X1;
    const X2 = modalForm.X2;
    const Y1 = modalForm.Y1; 
    const Y2 = modalForm.Y2;
    const x1 = [X1.x, X1.y, X1.dataX, X1.dataY];
    const x2 = [X2.x, X2.y, X2.dataX, X2.dataY];
    const y1 = [Y1.x, Y1.y, Y1.dataX, Y1.dataY]; 
    const y2 = [Y2.x, Y2.y, Y2.dataX, Y2.dataY];
    extractPlot(cropCanvas, setFormValue, x1, x2, y1, y2, rgb)
    .then(plotResult => {
      setDotsData(plotResult);
    })
    .catch(error => {
      // 处理错误情况
    });
  };
  
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleConfirmModalCancel = () => {
    setIsConfirmModalVisible(false);
  };

  

  const handleMouseMove = (e) => {
    if (opState === 'Ref') {
      const stage = stageRef.current;
      const colorRect = colorRectRef.current;
      const colorText = colorTextRef.current;

      // 获取鼠标在舞台中的位置
      const pos = calcImagePos(stage.getPointerPosition(), stage);

      // 获取鼠标所指像素点的颜色
      // const pixel = stage.getIntersection(pos);
      const ctx = cropCanvas.getContext('2d');
      const imageData = ctx.getImageData(pos.x, pos.y, 1, 1);
      const pixel = imageData.data;

      if (pixel) {
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];
      
        const pixelColor = `rgb(${r}, ${g}, ${b})`;
        const pixelRGB = [pixel[0], pixel[1], pixel[2]];
      
        setColor(pixelColor);
        setRgb(pixelRGB);
      }

      // 更新取色框的位置
      colorRect.position({
        x: pos.x + colorRect.width() / 2,
        y: pos.y + colorRect.height() / 2,
      });
      colorText.position({
        x: pos.x + colorRect.width() / 2,
        y: pos.y + colorRect.height() / 2 - 20,
      });

      colorRect.getLayer().batchDraw();
    }
  };

  // 主题颜色
  const {
    token: { colorPrimaryBgHover, colorTextHeading },
  } = theme.useToken();

  return (
    <Layout>
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
              ref={stageRef}
              scaleX={1}
              scaleY={1}
              onWheel={handleWheel}
              onClick={handleStageClick}
              onMouseMove={handleMouseMove}
              draggable={true}
          >
              <Layer ref={imgLayerRef}>
              </Layer>

              <Layer ref={dotLayerRef}>
                {dotsData.map((dot) => (
                  <LabelDot label={dot.label} x={dot.x} y={dot.y} dataX={dot.dataX} dataY={dot.dataY} />
                ))}
              </Layer>
              { (opState === 'Ref') && (
                <Layer>
                  {/* 取色框 */}
                  <Rect
                    x={0}
                    y={0}
                    width={30}
                    height={30}
                    stroke={'black'}
                    fill={color}
                    ref={colorRectRef}
                    
                  />
                  <Text
                    x={0}
                    y={0}
                    text={`RGB: ${rgb}`}
                    ref={colorTextRef}
                  />
                </Layer>
              )}

          </Stage>
          <Modal
            title="Anchor"
            open={isModalVisible}
            onOk={handleModalConfirm}
            onCancel={handleModalCancel}
          >
            <Form ref={formRef}>
              {Object.entries(modalForm).map(([key, value]) => (
                <Form.Item key={key} label={key}>
                  <Input
                    value={value}
                    onChange={e => {
                      const updatedValue = e.target.value;
                      setModalForm(prevForm => ({
                        ...prevForm,
                        [key]: updatedValue,
                      }));
                    }}
                  />
                </Form.Item>
              ))}
            </Form>
          </Modal>
          <Modal
            title="Confirm"
            open={isConfirmModalVisible}
            onOk={handleConfirmModalConfirm}
            onCancel={handleConfirmModalCancel}
          >
            <p>{`X轴:从(${modalForm.X1?.dataX}, ${modalForm.X1?.dataY})到(${modalForm.X2?.dataX}, ${modalForm.X2?.dataY})`}</p>
            <p>{`Y轴:从(${modalForm.Y1?.dataX}, ${modalForm.Y1?.dataY})到(${modalForm.Y2?.dataX}, ${modalForm.Y2?.dataY})`}</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p style={{ marginRight: '10px' }}>{`目标颜色：`}</p>
              <div style={{ backgroundColor: color, width: '20px', height: '20px' }}></div>
            </div>
          </Modal>
        </Content>
    </Layout>
  );
};

export default PlotStageComponent;