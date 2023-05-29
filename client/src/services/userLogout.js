import axios from 'axios';
import { BASE_URL } from "../utils/url";

function userLogout(setIsLogin) {
  axios.get(BASE_URL + '/user/logout')
    .then(function(response) {
        console.log(response.data);
        setIsLogin(false);
    })
    .catch(function(error) {
        alert('登出失败？！');
        console.log(error);
    });
};

export default userLogout;