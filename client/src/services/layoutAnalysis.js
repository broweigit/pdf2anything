import axios from 'axios';
import { BASE_URL } from "../utils/url";

function getLayout(setRectData, pageId) {
  // 发送 GET 请求到 Flask 后端
  axios.get(BASE_URL + '/layout-analysis', { params: { pageId }, responseType: 'json' })
    .then(function(response) {
      const rectsWithIndex = response.data.map((rect, index) => {
        return {...rect, id: `rect${pageId}-${index}`}
      });
      setRectData(rectsWithIndex);
    })
    .catch(function(error) {
      alert(error);
    });
};

export default getLayout;