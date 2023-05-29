import axios from "axios";
import { BASE_URL } from "../utils/url";

function deleteProject(projectId) {
    axios.get(BASE_URL + '/delete-project', {
        params: {
            pid: projectId
        }
    })
    .then(function(response) {
      console.log(response.data);
    })
    .catch(function(error) {
      alert('删除失败');
      console.log(error);
      // 处理请求错误
    });
}

export default deleteProject;