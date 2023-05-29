import axios from 'axios';
import { BASE_URL } from "../utils/url";

function loadProjectList(setProjectList, userInfo) {

  axios.get(BASE_URL + '/get-project-list', 
    {params: {
        userId: userInfo.userId,
    }}
  )
    .then((response) => {
      // 处理请求成功的逻辑
      console.log('获取项目列表成功');
      console.log(response.data)
      setProjectList(response.data);
      // 可以在这里进行其他的操作，比如显示成功提示、重定向等
    })
    .catch((error) => {
      // 处理请求失败的逻辑
      alert('获取项目列表失败');
      console.error(error);
      // 可以在这里进行错误处理，比如显示错误提示、回滚操作等
    });
}

export default loadProjectList;