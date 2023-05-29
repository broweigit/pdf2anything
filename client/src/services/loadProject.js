import axios from 'axios';
import { BASE_URL } from "../utils/url";

function loadProject(projectId, loadProjectFromBackend) {
  axios.get(BASE_URL + '/load-project', {
    params: {
      pid: projectId
    }
  })
    .then(function(response) {
      console.log(response.data);
      // 处理返回的项目数据
      const jsonData = response.data.jsonData;
      const imgList = response.data.imgList;
      new Promise((list_resolve) => {
        const images = imgList.map((pngImage) => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.src = pngImage;
            img.onload = () => {
              resolve(img);
            };
          });
        });
    
        // 等待所有图片加载完成
        Promise.all(images)
        .then((loadedImages) => {
            // 返回所有加载完成的图片
            list_resolve(loadedImages);
        });
      }).then((image_list) => {
        loadProjectFromBackend(jsonData, image_list);
      });
      
    })
    .catch(function(error) {
      console.log(error);
      // 处理请求错误
    });
}

export default loadProject;
