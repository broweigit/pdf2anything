import axios from 'axios';

function extractText(bbox, setFormValue, ocrLang, pageId) {
  // 发送 GET 请求到 Flask 后端
  axios.get('http://127.0.0.1:5000/text-extract', { 
        params: {
            bbox: JSON.stringify(bbox),
            lang: ocrLang,
            pageId
        }
    })
    .then(function(response) {
        setFormValue(response.data)
    })
    .catch(function(error) {
        alert(error);
    });
};

export default extractText;