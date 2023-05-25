import axios from 'axios';

function getLayout(setRectData, pageId) {
  // 发送 GET 请求到 Flask 后端
  axios.get('http://127.0.0.1:5000/layout-analysis', { params: { pageId }, responseType: 'json' })
    .then(function(response) {
      setRectData(response.data)
    })
    .catch(function(error) {
      alert(error);
    });
};

export default getLayout;