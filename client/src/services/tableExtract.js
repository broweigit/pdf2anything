import axios from 'axios';

function extractTable(bbox, setFormValue) {
  // 发送 GET 请求到 Flask 后端
  axios.get('http://127.0.0.1:5000/table-extract', { 
        responseType: 'html', 
        params: {
            bbox: JSON.stringify(bbox)
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

export default extractTable;