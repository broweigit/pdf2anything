import axios from 'axios';
import { BASE_URL } from "../utils/url";

function extractText(bbox, setFormValue, ocrLang, pageId) {
  // 发送 GET 请求到 Flask 后端
  axios.get(BASE_URL + '/text-extract', { 
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