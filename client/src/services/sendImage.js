import axios from 'axios';
import { BASE_URL } from "../utils/url";

function sendImage(img, list_resolve) {
  // 创建 FormData 对象
  var formData = new FormData();
  
  // 将图片添加到 FormData 中
  formData.append('image', img);

  axios.post(BASE_URL + '/upload-image', formData)
    .then((response) => {
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
      console.log('Error converting Img to PNG:', error);
      alert(error);
    });
};

export default sendImage;