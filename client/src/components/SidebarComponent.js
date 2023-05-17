import React from 'react';
import { Layout, Menu, theme, FloatButton } from 'antd';

const { Sider } = Layout;

const SiderbarComponent = ({ menuItems }) => {
  const {
    token: { colorFillLayout },
  } = theme.useToken();
  return (
    <Sider width={200} style={{ background: colorFillLayout }}>
    <Menu
      mode="inline"
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['sub1']}
      style={{ height: '100%', borderRight: 0 }}
      items={menuItems}
    />
  </Sider>
  );
};

export default SiderbarComponent;