import React, { useState, useEffect } from 'react';
import { Card, theme, Row, Col, Typography, Avatar, Button, Modal } from 'antd';
import { useNavigate  } from 'react-router-dom';
import loadProjectList from '../services/loadProjectList';
import { LaptopOutlined } from '@ant-design/icons';
import loadProject from '../services/loadProject';
import deleteProject from '../services/deleteProject';

const { Title } = Typography;

function UserInterface({ userInfo, setShowLogin, loadProjectFromBackend }) {
  const [projectList, setProjectList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 在组件挂载时获取当前用户的项目列表
    if (!userInfo) {
      setShowLogin(true);
      return;
    }
    if (userInfo.userId) {
      loadProjectList(setProjectList, userInfo);
    }
  }, [userInfo]);

  const handleProjectClick = (pid) => {
    loadProject(pid, loadProjectFromBackend);
    // 处理项目点击事件
    navigate('/');
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleProjectDetail = (e, project) => {
    e.stopPropagation();
    setSelectedProject(project);
    setModalVisible(true);
  };

  const handleDeleteProject = (pid) => {
    setModalVisible(false);
    deleteProject(pid);
    setProjectList(prevProjectList => prevProjectList.filter(project => project.pid !== pid));
  };
  

  // 主题颜色
  const {
    token: { colorPrimaryBgHover, colorTextHeading, colorInfoBorder, colorFillLayout },
  } = theme.useToken();

  return (
    <div style={{ backgroundColor: colorPrimaryBgHover, padding: '50px', height: '90vh' }}>
      {userInfo && (
        <Card style={{ backgroundColor: colorFillLayout, padding: '24px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.7)' }}>
          <Row align="middle" gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col>
              <Avatar size={64} icon={<LaptopOutlined />} />
            </Col>
            <Col>
              <Title level={3} style={{ marginBottom: '16px' }}>当前用户：{userInfo.name}</Title>
            </Col>
          </Row>
          <Title level={3} style={{ marginBottom: '40px' }}>项目列表：</Title>
          <Row gutter={[16, 16]}>
            {projectList.map((project, index) => (
              <Col key={index} span={8}>
                <Card
                  title={project.name}
                  extra={<a onClick={(e) => {handleProjectDetail(e, project)}}>项目详情</a>}
                  style={{
                    height: '100%',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  }}
                  headStyle={{ backgroundColor: colorInfoBorder, color: 'white' }}
                  onClick={() => {handleProjectClick(project.pid)}}
                  hoverable={true}
                >
                  <p>时间：{project.projectDate}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="delete" danger onClick={() => handleDeleteProject(selectedProject.pid)}>
            删除
          </Button>,
        ]}
      >
        {selectedProject && (
          <>
            <p>Name: {selectedProject.name}</p>
            <p>Date: {selectedProject.projectDate}</p>
          </>
        )}
      </Modal>
    </div>
  );
}

export default UserInterface;