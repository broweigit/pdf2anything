import React from 'react';
import { Layout, Menu } from 'antd';

const { Header } = Layout;

const HeaderComponent = ({ menuItems }) => {
  return (
    <Header className="header">
      <div className="logo"/>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']} items={menuItems} />
    </Header>
  );
};

export default HeaderComponent;