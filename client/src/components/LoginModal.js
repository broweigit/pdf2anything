import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Modal } from 'antd';

import '../css/login.css'
import userLogin from '../services/userLogin';

const LoginModal = ({showLogin, setShowLogin, setIsLogin, setUserInfo}) => {
  const onFinish = (values) => {
    console.log('Form values: ', values);

    userLogin(values, setUserInfo, setIsLogin);

    setShowLogin(false);
  };

  const handleCancel = () => {
    setShowLogin(false);
  };
  return (
    <Modal open={showLogin} footer={null} onCancel={handleCancel}>
        <div style={{ margin: '20px' }}>
            <Form
                name="normal_login"
                className="login-form"
                initialValues={{
                    remember: true,
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
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
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
                    <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Password"
                    />
                </Form.Item>

                <Form.Item>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                </Form.Item>

                <a className="login-form-forgot" href="">
                    Forgot password 
                </a>
                Or <a href="">register now!</a>
                
                <Button type="primary" htmlType="submit">
                    Login
                </Button>
            </Form>
        </div>
    </Modal>
  );
};
export default LoginModal;