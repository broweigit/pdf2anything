import React, { useState, useEffect, useRef } from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Route, Routes, useNavigate  } from 'react-router-dom';
import { Layout, theme, ConfigProvider, Modal } from 'antd';

import SidebarComponent from './components/SidebarComponent';
import HeaderComponent from './components/HeaderComponent';

import UserInterface from './components/UserSpace';

import StageComponent from './components/StageComponent';
import PlotStageComponent from './components/PlotStageComponent';

import getLayout from './services/layoutAnalysis';

import { handleThemeAlgChange } from './utils/handleThemeAlgChange';
import drawRectLayer from './utils/rectLayerDraw';
import ChatBox from './components/ChatBox';
import LoginModal from './components/LoginModal';

import './live2d.css'
import { resetUpload } from './services/reset';



function App() {
  // 页面router
  const navigate = useNavigate();

  // 以下为全局数据
  // 项目图片列表
  const [imgList, setImgList] = useState(null);
  // 当前为第几张图片
  const [selPageId, setSelPageId] = useState(0);
  const [cropCanvas, setCropCanvas] = useState(null);
  // 识别文字所用的语言
  const [ocrLang, setOcrLang] = useState('en');
  // 鼠标点击LabelRect, 控制当前选中ID
  const [selectedId, setSelectedId] = useState(null);
  // 登录状态
  const [isLogin, setIsLogin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  // OCR识别结果表单的值，由于plot需要，故提升至App.js
  const [formValue, setFormValue] = useState(''); 

  // 以下代码的目的是区分数据输入和数据视图。防止 “绘制 >> 更新数据 >> 更新绘制” 的循环
  // 矩形框数据输入 >> 绘制 控制链，通过赋值rectData，触发drawRectLayer，重新构建RectLayer对象组，拷贝至RectView，最后重新渲染Stage
  // 绘制 >> 矩形框数据视图, 上面的步骤给每一个rect对象挂载update以反映变化，对应修改rectView。任何对当前LabelRect状态的读取只允许查看rectView
  // 这样, 想在Stage上绘制LabelRect的同时将数据保留到rectView， 只需传入setRectData，读取数据只需传入rectView
  const [rectData, setRectData] = useState<{id: string, type: string, bbox: number[], res: string, img_idx: number}[]>([]);
  const [rectLayer, setRectLayer] = useState<{}[]>([]);
  const [rectView, setRectView] = useState<{ [pageId: number]: {}[] }>({}); // Mutipage更新
  // RePaint 代表该次RectData修改由换页触发而非版式分析，截断Layer>>View信号
  const isRepaintRef = useRef(false);
  // 赋值rectData触发drawRectLayer
  useEffect(() => {
    if (imgList) {
      drawRectLayer(rectData, setRectLayer, setSelectedId, imgList[selPageId]);
    }
    else {
      setRectLayer([]);
    }
  }, [rectData]);
  // 赋值rectLayer触发拷贝至RectView
  useEffect(() => {
    if (!isRepaintRef.current) {
      setRectView(prevRectView => {
        const newView = { ...prevRectView };
        newView[selPageId] = rectLayer;
        return newView;
      });
    }
    isRepaintRef.current = false;
  }, [rectLayer]);
  // 只允许用setRectData，rectView！！(将额外数据加入rectView或挂载操纵函数时需要用到setRectView)

  const setRectDataFromRectView = () => {
    console.log(rectView)
    setSelectedId(null);
    if (selPageId in rectView) {
      isRepaintRef.current = true;
      if (imgList) {
        // Repaint Cleanup Layer to solve Delete Bug, but don't know why...
        drawRectLayer([], setRectLayer, setSelectedId, imgList[selPageId]);
      }
      setRectData(
        rectView[selPageId].map((view: any) => (
          {
            id: view.id,
            bbox: [view.x, view.y, view.x + view.width, view.y + view.height],
            img_idx: 0,
            res: '',
            type: view.label,
          }
        ))
      )
    }
    else {
      setRectData([]);
    }
  }
  
  // 换页时，需将rectView中的矩形框相关内容放入rectData中，以重新绘制
  useEffect(() => {
    setRectDataFromRectView();
  }, [selPageId]);

  // 保存和读取
  // 导出为 JSON 文件
  function exportDataToJSON() {
    // 要保存的变量
    const data = {
      rectView,
      ocrLang,
    };

    const jsonData = JSON.stringify(data, null, 2);
    return jsonData;
  }

  function downloadJSON(jsonData) {
    // 提供下载：
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    link.click();

    URL.revokeObjectURL(url);
  }

  // 从 JSON 文件导入数据
  function importDataFromJSON(jsonData) {
    
    const data = JSON.parse(jsonData);

    setRectView(data.rectView);
    setOcrLang(data.ocrLang);
  }



  // 以下为登录相关
  // 退出登录清空用户数据
  useEffect(() => {
    if (!isLogin) {
      setUserInfo(null);
    }
  }, [isLogin]);


  // 以下为界面渲染相关
  // 当前Stage模式：['doc', 'plot']
  const [currStage, setCurrStage] = useState('doc');
  // chatgpt stage淡入淡出（TODO）
  const [showChat, setShowChat] = useState(false);
  // 显示Login弹窗
  const [showLogin, setShowLogin] = useState(false);
  
  // 页面初始化时，需清理后端imgs，与前端保持一致
  // 同时，需要检查后端是否在线 TODO
  useEffect(() => {
    resetUpload();
  }, []);

  // Stage宽高
  const [stageWidth, setStageWidth] = useState(window.innerWidth - 225);
  const [stageHeight, setStageHeight] = useState(window.innerHeight - 85);

  // 窗口变化时重新调整Stage宽高
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

  // ChatGPT组件显示时对半分宽度
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

  // 以下为Header，SideBar的元素
  const items2 = [
    { 
      key: 'side1', 
      label: '版式分析',
      children: [
        { key: 'side1-1', label: '单页分析', 
          onClick: () => {
            getLayout(setRectData, selPageId);
          } 
        },
        { key: 'side1-2', label: '全部分析', 
          onClick: () => {
            alert();
          } 
        }
      ], 
    },
    { 
      key: 'side2', 
      label: '信息提取', 
      children: [
        { key: 'side2-2', label: '全部提取' },
        { key: 'side2-3', label: '文字提取' },
        { key: 'side2-4', label: '表格提取' },
        { key: 'side2-5', label: '图表数据提取' }
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
        { key: 'side4-6', 
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
        { key: 'side4-7', label: '变更主题', onClick:  () => {handleThemeAlgChange(themeState, setThemeState);} }
      ],
    },
    { 
      key: 'side5', 
      label: 'DEBUG1',
      onClick: () => {
        // console.log(rectView)
        setDebugTempVar(exportDataToJSON());
      } 
    },
    { 
      key: 'side6', 
      label: 'DEBUG2',
      onClick: () => {
        importDataFromJSON(debugTempVar);
      } 
    }
  ];

  const [debugTempVar, setDebugTempVar] = useState('');
  
  const items1 = [
  
    { 
      key: 'sub1', 
      icon: React.createElement(NotificationOutlined),
      label: '文档识别', 
      
      onClick: () => {
        setCurrStage('doc')
        navigate('/');
      } 
    },
    { 
      key: 'sub2', 
      icon: React.createElement(UserOutlined),
      label: '用户空间', 
      
      onClick: () => {
        navigate('/user-space');
      } 
    },
  ];
  
  // 以下为live2D相关加载script挂载
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
          <HeaderComponent 
            menuItems={items1} 
            setShowLogin={setShowLogin} 
            isLogin={isLogin} 
            setIsLogin={setIsLogin}
            userInfo={userInfo}
          />
            <Routes>
              <Route path="/user-space" element={<UserInterface/>}/>
              <Route path="/" element={
                <>
                  <Layout>  
                    <SidebarComponent menuItems={items2} />
                    <Layout>
                      <StageComponent 
                        width={stageWidth} 
                        height={stageHeight} 
                        setRectData={setRectData}
                        rectLayer={rectLayer}
                        rectView={rectView}
                        setRectView={setRectView}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        imgList={imgList}
                        setImgList={setImgList}
                        selPageId={selPageId}
                        setSelPageId={setSelPageId}
                        cropCanvas={cropCanvas}
                        setCropCanvas={setCropCanvas}
                        ocrLang={ocrLang}
                        setCurrStage={setCurrStage}
                        formValue={formValue}
                        setFormValue={setFormValue}
                      />
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
                    
                    {currStage === 'plot' && (
                        <Modal 
                          open={true} 
                          width={stageWidth * 0.9} 
                          onOk={() => {setCurrStage('doc')}} 
                          onCancel={() => {setCurrStage('doc')}} 
                        >
                          <PlotStageComponent
                            width={stageWidth * 0.9 - 70} 
                            height={stageHeight * 0.9 - 70} 
                            cropCanvas={cropCanvas}
                            currStage={currStage}
                            setFormValue={setFormValue}
                          />
                        </Modal>
                      )}
                  </Layout>
                </>
              }/>
            </Routes>
        </Layout>
        <LoginModal
          showLogin={showLogin}
          setShowLogin={setShowLogin}
          setIsLogin={setIsLogin}
          setUserInfo={setUserInfo}
        />
      </ConfigProvider>
    </div>
  );
}

export default App;