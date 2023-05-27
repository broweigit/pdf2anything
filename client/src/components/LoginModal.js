import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Modal, Space } from 'antd';

import userLogin from '../services/userLogin';
import { useEffect, useState } from 'react';
import userRegister from '../services/userRegister';

const LoginModal = ({showLogin, setShowLogin, setIsLogin, setUserInfo}) => {
  // login, register, forget
  const [modalStatus, setModalStatus] = useState('login');
  const [remember, setRemember] = useState(true);
  const [accountPlaceHolder, setAccountPlaceHolder] = useState(null);
  const [passwordPlaceHolder, setpasswordPlaceHolder] = useState(null);

  const onFinish = (values) => {
    console.log('Form values: ', values);

    if (modalStatus === 'login') {
        userLogin(values, setUserInfo, setIsLogin);
        setShowLogin(false);
    }
    else if (modalStatus === 'register') {
        userRegister(values, setModalStatus, setAccountPlaceHolder, setpasswordPlaceHolder);
    }
    else {
        alert('TODO 忘了就没了，哼喵');
    }

  };

  const handleCancel = () => {
    setShowLogin(false);
  };

  useEffect(() => {
    setModalStatus('login');
  }, [showLogin]);

  return (
    <Modal 
        open={showLogin}
        title={modalStatus === 'login' ? '用户登录' : modalStatus === 'register' ? '用户注册' : '忘记密码'} 
        footer={null} 
        onCancel={handleCancel}
    >
        <div style={{ margin: '25px 0px 15px 15px' }}>
            {modalStatus === 'login' && (
                <Form
                    name="normal_login"
                    initialValues={{
                        remember: remember,
                    }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="account"
                        rules={[
                        {
                            required: true,
                            message: 'Please input your Account!',
                        },
                        ]}
                    >
                        <Input prefix={<UserOutlined/>} placeholder='Account or Username' value={accountPlaceHolder} />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                        {
                            required: true,
                            message: 'Please input your Password!',
                        },
                        ]}
                    >
                        <Input prefix={<LockOutlined/>} type="password" placeholder='Password'value={passwordPlaceHolder} />
                    </Form.Item>

                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox onChange={(e) => {setRemember(e.target.checked)}}>Remember me</Checkbox>
                        </Form.Item>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Login
                            </Button>
                            <a onClick={() => {setModalStatus('forget')}}>
                                Forgot password 
                            </a>
                            <p> Or </p>
                            <a onClick={() => {setModalStatus('register')}}>
                                register now!
                            </a>
                        </Space>
                    </Form.Item>
                </Form>
            )}
            {modalStatus === 'register' && (
                <Form
                    name="register"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[
                            {
                            required: true,
                            message: 'Please input your username!',
                            },
                        ]}
                        >
                        <Input prefix={<UserOutlined/>} showCount={true} placeholder="Username" />
                    </Form.Item>
            
                    <Form.Item
                        name="password"
                        rules={[
                            {
                            required: true,
                            message: 'Please input your password!',
                            },
                        ]}
                        >
                        <Input prefix={<LockOutlined/>} showCount={true} type="password" placeholder="Password"/>
                    </Form.Item>
                    
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Register
                        </Button>
                    </Form.Item>
                </Form>
            )}
            {modalStatus === 'forget' && (
                <Form
                    name="forget"
                    onFinish={onFinish}
                >
                    <Form.Item
                    name="email"
                    rules={[
                        {
                        required: true,
                        message: 'Please input your email!',
                        },
                    ]}
                    >
                    <Input prefix={<UserOutlined/>} placeholder="Email" />
                    </Form.Item>
                    
                    <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                    </Form.Item>
                </Form>
            )}
        </div>
    </Modal>
  );
};
export default LoginModal;