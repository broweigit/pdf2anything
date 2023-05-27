import axios from 'axios';

function saveProject(projectName, jsonData, projectDate, userInfo) {

  const formData = new FormData();
  formData.append('projectName', projectName);
  formData.append('jsonData', jsonData);
  formData.append('projectDate', projectDate);
  formData.append('userId', userInfo.userId);


  axios.post('http://127.0.0.1:5000/save-project', formData)
    .then((response) => {
      // 处理请求成功的逻辑
      console.log('保存项目成功');
      console.log(response.data);
      // 可以在这里进行其他的操作，比如显示成功提示、重定向等
    })
    .catch((error) => {
      // 处理请求失败的逻辑
      alert('保存项目失败');
      console.error(error);
      // 可以在这里进行错误处理，比如显示错误提示、回滚操作等
    });
}

export default saveProject;