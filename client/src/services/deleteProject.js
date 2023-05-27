import axios from "axios";

function deleteProject(projectId) {
    axios.get('http://127.0.0.1:5000/delete-project', {
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