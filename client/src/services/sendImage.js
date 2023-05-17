import axios from 'axios';

function sendImage(img) {
  // 创建 FormData 对象
  var formData = new FormData();
  
  // 将图片添加到 FormData 中
  formData.append('image', img);

  axios.post('http://127.0.0.1:5000/upload-image', formData)
    .then(function (response) {
        console.log(response.data)
    })
    .catch(function (error) {
      alert(error);
    });
};

export default sendImage;