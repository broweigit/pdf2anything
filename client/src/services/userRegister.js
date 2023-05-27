import axios from 'axios';

function userRegister(values, setModalStatus, setAccountPlaceHolder, setpasswordPlaceHolder) {
  axios.get('http://127.0.0.1:5000/user/register', { 
        params: {
            username: values.username,
            password: values.password
        }
    })
    .then(function(response) {
        console.log(response.data);
        const account = response.data;
        setAccountPlaceHolder(account);
        setpasswordPlaceHolder(values.password);
        setModalStatus('login');
    })
    .catch(function(error) {
        alert('注册失败');
        console.log(error);
    });
};

export default userRegister;