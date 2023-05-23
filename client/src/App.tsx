import React, { useState, useEffect, useRef } from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, theme, ConfigProvider } from 'antd';

import SidebarComponent from './components/SidebarComponent';
import HeaderComponent from './components/HeaderComponent';

import StageComponent from './components/StageComponent';
import PlotStageComponent from './components/PlotStageComponent';

import getLayout from './services/layoutAnalysis';

import { handleThemeAlgChange } from './utils/handleThemeAlgChange';
import drawRectLayer from './utils/rectLayerDraw';
import ChatBox from './components/ChatBox';

import './live2d.css'
import ImageJComponent from './components/ImageJComponent';

function App() {
  // 全局数据
  // 正在操作的img
  const [img, setImg] = useState(null);
  const [cropCanvas, setCropCanvas] = useState(null);
  // 识别文字所用的语言
  const [ocrLang, setOcrLang] = useState('en');

  // 以下代码的目的是区分数据输入和数据视图。防止 “绘制 >> 更新数据 >> 更新绘制” 的循环
  // 矩形框数据输入 >> 绘制 控制链，通过赋值rectData，触发drawRectLayer，重新构建RectLayer对象组，拷贝至RectView，最后重新渲染Stage
  const [rectData, setRectData] = useState<{type: string, bbox: number[], res: string, img_idx: number}[]>([]);
  const [rectLayer, setRectLayer] = useState<{}[]>([]);
  // 绘制 >> 矩形框数据视图, 上面的步骤给每一个rect对象挂载update以反映变化，对应修改rectView。任何对当前LabelRect状态的读取只允许查看rectView
  const [rectView, setRectView] = useState<{}[]>([]);

  // 鼠标点击LabelRect, 控制当前选中ID
  const [selectedId, setSelectedId] = useState(null);
  // 识别结果表单的值，由于plot需要，故提升至App.js
  const [formValue, setFormValue] = useState(''); 

  // 当前Stage模式：['doc', 'plot']
  const [currStage, setCurrStage] = useState('doc');

  // chatgpt stage淡入淡出
  const [showChat, setShowChat] = useState(false);

  // 赋值rectData触发drawRectLayer
  useEffect(() => {
    drawRectLayer(rectData, setRectLayer, setSelectedId);
  }, [rectData]);

  // 拷贝rectLayer至RectView
  useEffect(() => {
    setRectView(rectLayer);
  }, [rectLayer]);

  const [stageWidth, setStageWidth] = useState(window.innerWidth - 225);
  const [stageHeight, setStageHeight] = useState(window.innerHeight - 85);

  useEffect(() => {
    const handleResize = () => {
      // 更新 Stage 组件的宽高
      setShowChat(false);
      setStageHeight(window.innerHeight - 85);
      setStageWidth(window.innerWidth - 225);
    };

    // 监听窗口大小变化事件
    window.addEventListener('resize', handleResize);
    // 初始化时立即触发一次
    handleResize();

    // 组件卸载时移除事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (showChat) {
      setStageWidth((window.innerWidth - 225) / 2);
    } else {
      setStageWidth(window.innerWidth - 225);
    }
  }, [showChat]);

  // 主题颜色
  const [themeState, setThemeState] = useState({
    token: {
      colorPrimary: '#1677ff',
    },
    algorithm: theme.defaultAlgorithm,
  });

  const items2 = [
    { 
      key: 'side1', 
      label: '版式分析',
      children: [
        { key: '1', label: '开始分析', 
          onClick: () => {
            getLayout(setRectData);
          } 
        }
      ], 
    },
    { 
      key: 'side2', 
      label: '信息提取', 
      children: [
        { key: '2', label: '全部提取' },
        { key: '3', label: '文字提取' },
        { key: '4', label: '表格提取' },
        { key: '5', label: '图表数据提取' }
      ],
    },
    { 
      key: 'side3', 
      label: 'ChatGPT',
      onClick:  () => {
        setShowChat(!showChat);
      } 
    },
    
    { 
      key: 'side4', 
      label: '设置',
      
      children: [
        { key: '6', 
          label: (
            <div>
              识别语言:{' '}
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{ocrLang}</span>
            </div>
          ),
          onClick:  () => {
            if (ocrLang === 'en') {
              setOcrLang('ch');
            } else {
              setOcrLang('en');
            }
          } 
        }, 
        { key: '7', label: '变更主题', onClick:  () => {handleThemeAlgChange(themeState, setThemeState);} }
      ],
    },
    { 
      key: 'side5', 
      label: 'DEBUG',
      onClick: () => {
        console.log(rectView)
        // console.log(img)
      } 
    }
  ];
  
  const items1 = [
    { 
      key: 'sub1', 
      icon: React.createElement(NotificationOutlined),
      label: '文档识别', 
      
      onClick: () => {
        setCurrStage('doc')
      } 
    },
    { 
      key: 'sub2',
      icon: React.createElement(LaptopOutlined),
      label: 'ImageJ',
      
      onClick: () => {
        setCurrStage('imageJ')
      } 
    }
  ];
  
  const scriptElement0 = document.createElement('script');
  scriptElement0.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
  scriptElement0.async = false;

  const scriptElement1 = document.createElement('script');
  scriptElement1.innerHTML = `
    var message_Path = '/live2d/';
    var home_Path = 'http://localhost:3000/';
  `;
  scriptElement1.async = false;

  const scriptElement2 = document.createElement('script');
  scriptElement2.src = '/live2d/js/live2d.js';
  scriptElement2.async = false;

  const scriptElement3 = document.createElement('script');
  scriptElement3.src = '/live2d/js/message.js';
  scriptElement3.async = false;
  
  const scriptElement4 = document.createElement('script');
  scriptElement4.innerHTML = `
      loadlive2d("live2d", "/live2d/model/tia/model.json");
  `;
  scriptElement4.async = false;

  useEffect(() => {
    document.body.appendChild(scriptElement0);
    document.body.appendChild(scriptElement1);
    document.body.appendChild(scriptElement2);
  }, []);

  useEffect(() => {
    if (showChat) {
      document.body.appendChild(scriptElement3);
      document.body.appendChild(scriptElement4);
    }
  }, [showChat]);

  return (
    <div className="App">
      <ConfigProvider
        theme={themeState}
      >
        <Layout>
          <HeaderComponent menuItems={items1} />
          <Layout>  
            <SidebarComponent menuItems={items2} />
            {currStage === 'imageJ' ? (
              <ImageJComponent
                width={stageWidth} 
                height={stageHeight} 
              />
            ) : (
              <>
                <Layout>
                  {currStage === 'doc' ? (
                    <StageComponent 
                      width={stageWidth} 
                      height={stageHeight} 
                      rectLayer={rectLayer}
                      rectView={rectView}
                      setRectView={setRectView}
                      selectedId={selectedId}
                      setSelectedId={setSelectedId}
                      img={img}
                      setImg={setImg}
                      cropCanvas={cropCanvas}
                      setCropCanvas={setCropCanvas}
                      ocrLang={ocrLang}
                      setCurrStage={setCurrStage}
                      formValue={formValue}
                      setFormValue={setFormValue}
                    />
                  ) : (
                    <PlotStageComponent
                      width={stageWidth} 
                      height={stageHeight} 
                      cropCanvas={cropCanvas}
                      currStage={currStage}
                      setCurrStage={setCurrStage}
                      setFormValue={setFormValue}
                    />
                  )}
                </Layout>
                { showChat && (
                  <Layout>
                    <ChatBox/>
                    <div id="landlord">
                      <div className="message" style={{opacity: 0}}></div>
                      <canvas id="live2d" width="280" height="250" className="live2d"></canvas>
                      <div className="hide-button">隐藏</div>
                    </div>
                  </Layout>
                )}
              </>
            )}
          </Layout>
        </Layout>
      </ConfigProvider>
    </div>
  );
}

export default App;