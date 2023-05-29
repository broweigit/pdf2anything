import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Circle, Text } from 'react-konva';
import { theme } from 'antd';

const FileConversionStage = ({width, height, setConvFileType}) => {
  
  // 主题颜色
  const {
    token: { colorPrimaryBgHover, colorBgContainer },
  } = theme.useToken();

  const fileTypes = [
    { src: './pdf-icon.svg', x: width / 4, y: height / 8, text: 'PDF' },
    { src: './png-icon.svg', x: (width / 8) * 4, y: height / 8, text: 'PNG' },
    { src: './doc-icon.svg', x: width / 8, y: height / 2, text: 'DOC' },
    { src: './txt-icon.svg', x: (width / 8) * 3, y: height / 2, text: 'TXT' },
    { src: './xls-icon.svg', x: (width / 8) * 5, y: height / 2, text: 'XLS' },
  ];

  const imageRefs = useRef([]);

  const [circlePosition, setCirclePosition] = useState({ x: width / 2 - width / 16, y: height / 2 });
  const [bgColor, setBgColor] = useState(colorPrimaryBgHover);
  const [fileText, setFileText] = useState(''); // Text to display

  const handleFileClick = (index) => {
    // Reset all images to dim effect
    imageRefs.current.forEach((imageRef) => {
      if (imageRef) {
        imageRef.to({ opacity: 0.5 });
      }
    });

    // Highlight the clicked image
    const clickedImage = imageRefs.current[index];
    if (clickedImage) {
      clickedImage.to({ opacity: 1 });

      // 更新圆球位置为被点击图标的中心位置
      const clickedImagePosition = clickedImage.getAbsolutePosition();
      setCirclePosition({
        x: clickedImagePosition.x + clickedImage.width() / 2,
        y: clickedImagePosition.y + clickedImage.height() / 2,
      });
    }
    // Set different color based on index
    switch (index) {
      case 0:
        setBgColor('rgb(205, 32, 32)'); // Pdf
        setFileText('转换为 PDF'); // Set text for PDF file
        setConvFileType('pdf');
        break;
      case 1:
        setBgColor('rgb(207, 94, 192)'); // Png
        setFileText('转换为 PNG'); // Set text for PNG file
        setConvFileType('png');
        break;
      case 2:
        setBgColor('rgb(73, 135, 210)'); // Doc
        setFileText('转换为 DOC'); // Set text for DOC file
        setConvFileType('doc');
        break;
      case 3:
        setBgColor('rgb(140, 198, 63)'); // txt
        setFileText('转换为 TXT'); // Set text for TXT file
        setConvFileType('txt');
        break;
      case 4:
        setBgColor('rgb(51, 186, 115)'); // excel
        setFileText('转换为 Excel'); // Set text for Excel file
        setConvFileType('xls');
        break;
      default:
        setBgColor(colorPrimaryBgHover); // Default color
    }
  };

  const layerRef = useRef(null);

  let loaded = false;

  useEffect(() => {
    const loadIcons = async () => {
      const loadedIcons = await Promise.all(
        fileTypes.map((fileType, index) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = fileType.src;
            img.onload = () => {
              const kimg = new window.Konva.Image({
                x: fileType.x,
                y: fileType.y,
                width: width / 8,
                height: height / 3,
                image: img,
                opacity: 0.3,
              });
              kimg.on('click', () => handleFileClick(index));
              imageRefs.current[index] = kimg;
              resolve(kimg);
            };
          });
        })
      );
      loadedIcons.forEach(function(icon) {
        layerRef.current.add(icon);
      });
      // handleFileClick(0);
    };
  
    if (!loaded) {
      loadIcons();
      loaded = true;
    }

  }, []);
  

  return (
    <div style={{ background: `linear-gradient(to bottom, #FFFFFF, ${bgColor})`, padding: '20px', borderRadius: '5px', boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)' }}>
      <Stage width={width} height={height}>
        <Layer>
          <Circle
            x={circlePosition.x}
            y={circlePosition.y}
            radius={width / 8}
            fill={'white'}
            opacity={0.3}
          />
        </Layer>
        <Layer ref={layerRef}>
        </Layer>
        <Layer>
          <Text
            text={fileText}
            x={width / 3}
            y={height - 80}
            fontSize={48}
            fontFamily="Arial"
            fill={colorBgContainer}
            align="center"
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default FileConversionStage;