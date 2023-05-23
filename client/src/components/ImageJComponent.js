import { React, useState, useEffect } from 'react';
import { Stage, Layer, Image, Rect, Group, Text } from 'react-konva';
import { Affix, Layout, theme, Button, Space } from 'antd';
import convertImagesToPNG from '../services/ImageConvert';
import { RightOutlined, LeftOutlined, FileOutlined, PlayCircleOutlined } from '@ant-design/icons';
import imageJAnalysis from '../services/ImageAnalysis';

const { Content } = Layout;

const ImageJComponent = ({ width, height }) => {
  const [stageRef, setStageRef] = useState(null);
  const [secondStageRef, setSecondStageRef] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(null);
  const [resultImages, setResultImages] = useState(null);
  
  const [analysisLock, setAnalysisLock] = useState(false);

  // 鼠标滚轮，放缩整体

  const handleWheel = (e) => {
    e.evt.preventDefault(); // 阻止默认事件
    const stage = stageRef;
    const pointerPos = stage.getPointerPosition(); // 获取鼠标在舞台中的位置
    const mousePointTo = {
      x: (pointerPos.x - stage.x()) / stage.scaleX(), // 获取鼠标在缩放前画布中的相对位置
      y: (pointerPos.y - stage.y()) / stage.scaleY(),
    };
    const newScale = Math.max(0.3, stage.scaleX() - e.evt.deltaY / 500); // 计算新的缩放比例
    const newPos = {
      x: pointerPos.x - mousePointTo.x * newScale, // 计算缩放后画布需要平移的距离
      y: pointerPos.y - mousePointTo.y * newScale,
    };
    stage.scale({ x: newScale, y: newScale }); // 缩放画布
    stage.position(newPos); // 平移画布
    stage.batchDraw(); // 更新画布

    const stage2 = secondStageRef;
    stage2.scale({ x: newScale, y: newScale }); // 缩放画布
    stage2.position(newPos); // 平移画布
    stage2.batchDraw(); // 更新画布
  };

  // 主题颜色
  const {
    token: { colorPrimaryBgHover },
  } = theme.useToken();

  useEffect(() => {
    // 预加载图片
    const loadImages = () => {
      const file = imageFiles[currentImageIndex];
  
      new Promise((resolve) => {
        if (file.type === 'image/tiff') {
          convertImagesToPNG(file)
          .then((pngImage) => {
            const img = new window.Image();
            img.src = pngImage;
            img.onload = () => {
              resolve(img);
            };
          })
          .catch((error) => {
            console.log('Error converting TIFF to PNG:', error);
            resolve(null); // Resolve with null if conversion fails
          });
        } else {
          // 非 TIFF 文件类型直接创建 img 元素
          const img = new window.Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => {
            resolve(img);
          };
        }
      }).then((image) => {
        setLoadedImages(image);
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

        const stage2 = secondStageRef;
        stage2.scale({ x: newScale, y: newScale });
        stage2.position({x: offX, y: offY})
      });
    };
  
    if (imageFiles.length > 0 && currentImageIndex >= 0 && currentImageIndex < imageFiles.length) {
      loadImages();
    }
  }, [imageFiles, currentImageIndex]);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    setImageFiles(imageFiles);
    setCurrentImageIndex(0);
  };

  const handleButtonClick = () => {
    if (analysisLock) return;
    document.getElementById('fileInput').click();
  };

  const handleNextImage = () => {
    if (analysisLock) return;
    if (currentImageIndex < imageFiles.length - 1) {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (analysisLock) return;
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleStart = () => {
    setAnalysisLock(true);
    for (let i = 0; i < imageFiles.length; i++) {
      new Promise((resolve) => {
        if (imageFiles[i].type === 'image/tiff') {
          convertImagesToPNG(imageFiles[i])
          .then((pngImage) => {
            const img = new window.Image();
            img.src = pngImage;
            img.onload = () => {
              resolve(img);
            };
          })
          .catch((error) => {
            console.log('Error converting TIFF to PNG:', error);
            resolve(null); // Resolve with null if conversion fails
          });
        } else {
          // 非 TIFF 文件类型直接创建 img 元素
          const img = new window.Image();
          img.src = URL.createObjectURL(imageFiles[i]);
          img.onload = () => {
            resolve(img);
          };
        }
      }).then((left_image) => {
        new Promise((resolve) => {
          imageJAnalysis(imageFiles[i], imageFiles.length)
          .then((pngImage) => {
            const img = new window.Image();
            img.src = pngImage;
            img.onload = () => {
              resolve(img);
            };
          })
          .catch((error) => {
            console.log('Error Analysising:', error);
            resolve(null); // Resolve with null if conversion fails
          });
        }).then((image) => {
          setLoadedImages(left_image);
          setResultImages(image);
        });
      });
    }
  };

  return (
    <Layout>
      <Content
        style={{
          padding: 10,
          margin: 0,
          minHeight: 280,
          background: colorPrimaryBgHover,
        }}
      >
        <div style={{ display: 'flex' }}>
          <Stage 
            width={width / 2} 
            height={height} 
            ref={setStageRef} 
            scaleX={1} 
            scaleY={1}
            onWheel={handleWheel}
            draggable={!analysisLock}
          >
            <Layer>
              {loadedImages && (
                <Image
                  image={loadedImages}
                />
              )}
            </Layer>
          </Stage>
          <Stage 
            width={width / 2} 
            height={height} 
            ref={setSecondStageRef} 
            scaleX={1} 
            scaleY={1}
            onWheel={handleWheel}
            draggable={!analysisLock}
          >
            <Layer>
              {resultImages && (
                <Image
                  image={resultImages}
                />
              )}
            </Layer>
          </Stage>
        </div>
        <input
          id="fileInput"
          type="file"
          directory=""
          webkitdirectory=""
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          multiple
        />
        <Affix offsetBottom={80}>
          <Space direction="vertical" size="middle" style={{ marginBottom: '8px' }}>
            <Button size="large" type="primary" icon={<FileOutlined />} onClick={handleButtonClick}></Button>
            {loadedImages && (
              <>
              <Button size="large" type="primary" shape="circle" icon={<LeftOutlined />} onClick={handlePrevImage} />
              <Button size="large" type="primary" shape="circle" icon={<RightOutlined />} onClick={handleNextImage} />
              <Button size="large" type="primary" shape="circle" icon={<PlayCircleOutlined/>} onClick={handleStart} />
              </>
            )}
          </Space>
        </Affix>
      </Content>
    </Layout>
  );
};

export default ImageJComponent;
