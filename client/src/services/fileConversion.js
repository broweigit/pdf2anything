import axios from 'axios';

const convertFile = async (fileType) => {

  axios.get('http://127.0.0.1:5000/convert-file', {
      params: {
        fileType: fileType,
      }
  })
  .then(function(response) {
    alert(fileType);
    if (fileType === 'png') {
      const images = response.data.map((pngImage) => {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.src = pngImage;
          img.onload = () => {
            resolve(img);
          };
        });
      });
  
      // 等待所有图片加载完成
      Promise.all(images)
      .then((loadedImages) => {
          // 下载所有加载完成的图片
          loadedImages.forEach((image, index) => {
            const link = document.createElement('a');
            link.href = image.src;
            link.download = `image_${index}.png`;
            link.click();
          });
      });
    }
  })
  .catch(function(error) {
    console.log(error);
    // 处理请求错误
  });
};

export default convertFile;