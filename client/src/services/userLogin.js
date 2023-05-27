import axios from 'axios';

function userLogin(values, setUserInfo, setIsLogin) {
  axios.get('http://127.0.0.1:5000/user/login', { 
        params: {
            account: values.account,
            password: values.password
        }
    })
    .then(function(response) {
        console.log(response.data);
        const responseUser = response.data;
        setUserInfo({ userId: responseUser.userId, name: responseUser.username, account: responseUser.account });
        setIsLogin(true);
    })
    .catch(function(error) {
        alert('登陆失败');
        console.log(error);
        setIsLogin(false);
    });
};

export default userLogin;