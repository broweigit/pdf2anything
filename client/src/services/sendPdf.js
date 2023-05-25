import axios from 'axios';

function sendPdf(file, list_resolve) {
  // 创建 FormData 对象
  var formData = new FormData();
  
  // 将文件添加到 FormData 中
  formData.append('file', file);

  axios.post('http://127.0.0.1:5000/upload-pdf', formData)
    .then(function (response) {
        return response.data;
    })
    .then((pngImages) => {
        const images = pngImages.map((pngImage) => {
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
            // 返回所有加载完成的图片
            list_resolve(loadedImages);
        });
    })
    .catch((error) => {
      console.log('Error converting Pdf to PNG:', error);
      alert(error);
    });
};

export default sendPdf;