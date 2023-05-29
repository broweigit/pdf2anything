import axios from 'axios';
import { BASE_URL } from "../utils/url";

function extractTable(bbox, setFormValue, pageId) {
  // 发送 GET 请求到 Flask 后端
  axios.get(BASE_URL + '/table-extract', { 
        responseType: 'html', 
        params: {
            bbox: JSON.stringify(bbox),
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

export default extractTable;