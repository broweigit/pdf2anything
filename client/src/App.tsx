import React, { useState, useEffect, useRef } from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, theme, ConfigProvider } from 'antd';

import SidebarComponent from './components/SidebarComponent';
import StageComponent from './components/StageComponent';
import HeaderComponent from './components/HeaderComponent';

import getLayout from './services/layoutAnalysis';

import { handleThemeAlgChange } from './utils/handleThemeAlgChange';
import drawRectLayer from './utils/rectLayerDraw';

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

  // 赋值rectData触发drawRectLayer
  useEffect(() => {
    drawRectLayer(rectData, setRectLayer, setSelectedId);
  }, [rectData]);

  // 拷贝rectLayer至RectView
  useEffect(() => {
    setRectView(rectLayer);
  }, [rectLayer]);

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
      label: 'ChatGPT'
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
        } }, 
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
  
  const items1 = [UserOutlined, LaptopOutlined, NotificationOutlined].map((icon, index) => {
    const key = String(index + 1);
  
    return {
      key: `sub${key}`,
      icon: React.createElement(icon),
      label: `subnav ${key}`,
  
      children: new Array(4).fill(null).map((_, j) => {
        const subKey = index * 4 + j + 1;
        return {
          key: subKey,
          label: `option${subKey}`,
        };
      }),
    };
  });

  return (
    <div className="App">
      <ConfigProvider
        theme={themeState}
      >
        <Layout>
          <HeaderComponent menuItems={items1} />
          <Layout>
            <SidebarComponent menuItems={items2} />
            <Layout>
              <StageComponent 
                width={window.innerWidth - 225} 
                height={window.innerHeight - 85} 
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
                />
            </Layout>
          </Layout>
        </Layout>
      </ConfigProvider>
    </div>
  );
}

export default App;