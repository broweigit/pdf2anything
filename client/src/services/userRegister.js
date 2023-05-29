import axios from 'axios';
import { BASE_URL } from "../utils/url";

function userRegister(values, setModalStatus, setAccountPlaceHolder, setpasswordPlaceHolder) {
  axios.get(BASE_URL + '/user/register', { 
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