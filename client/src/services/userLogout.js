import axios from 'axios';

function userLogout(setIsLogin) {
  axios.get('http://127.0.0.1:5000/user/logout')
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