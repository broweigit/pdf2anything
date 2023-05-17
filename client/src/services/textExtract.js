import axios from 'axios';

function extractText(bbox, setFormValue, ocrLang) {
  // 发送 GET 请求到 Flask 后端
  axios.get('http://127.0.0.1:5000/text-extract', { 
        params: {
            bbox: JSON.stringify(bbox),
            lang: ocrLang
        }
    })
    .then(function(response) {
        console.log(response.data)
        setFormValue(response.data)
    })
    .catch(function(error) {
        alert(error);
    });
};

export default extractText;