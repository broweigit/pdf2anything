import { useState } from 'react';
import { Layout, Form, Input, Button } from 'antd';

const { Content } = Layout;

const UserInterface = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 在此处执行登录逻辑
    console.log('Username:', username);
    console.log('Password:', password);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ margin: '16px' }}>
        <Form onSubmit={handleSubmit}>
          <Form.Item label="用户名">
            <Input value={username} onChange={handleUsernameChange} />
          </Form.Item>
          <Form.Item label="密码">
            <Input.Password value={password} onChange={handlePasswordChange} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">登录</Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default UserInterface;