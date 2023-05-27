import React from 'react';
import { Avatar, Layout, Menu, Button } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

import '../css/icon.css'
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const HeaderComponent = ({ menuItems, setShowLogin, isLogin, setIsLogin, userInfo }) => {
  const navigate = useNavigate();
  return (
    <Header className="header" style={{ display: 'flex', alignItems: 'center' }}>
      <div className="demo-logo"/>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['sub1']} items={menuItems} />
      <div style={{ marginLeft: 'auto', float: 'right' }}>
        {isLogin ? (
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => {navigate('/user-space')}}>
            <Avatar icon={<UserOutlined />} />
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '8px' }}>
              <span style={{ color: 'white', lineHeight: '1' }}>{userInfo.name}</span>
              <span style={{ color: 'gray', lineHeight: '1' }}>{userInfo.account}</span>
            </div>
            <Button 
              danger 
              type="primary" 
              icon={<LogoutOutlined />} 
              style={{ marginLeft: '8px' }}
              onClick={(e) => {
                e.stopPropagation();
                setIsLogin(false)
              }}
            />
          </div>
        ) : (
          <Button type="primary" icon={<UserOutlined />} onClick={() => setShowLogin(true)}>
            登录
          </Button>
        )}
      </div>
    </Header>
  );
};

export default HeaderComponent;