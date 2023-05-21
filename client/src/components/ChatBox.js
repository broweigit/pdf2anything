import React from 'react';
import { List, Avatar, Input, Button } from 'antd';

const ChatBox = () => {
  // 假设的聊天消息数据
  const messages = [
    { id: 1, sender: 'Alice', content: 'Hello' },
    { id: 2, sender: 'Bob', content: 'Hi there' },
    { id: 3, sender: 'Alice', content: 'How are you?' },
  ];

  const handleSendMessage = (message) => {
    // 发送消息的逻辑
    console.log('Sending message:', message);
  };

  return (
    <div>
      <List
        dataSource={messages}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <List.Item.Meta
              avatar={<Avatar>{item.sender[0]}</Avatar>}
              title={item.sender}
              description={item.content}
            />
          </List.Item>
        )}
      />

      <div style={{ marginTop: 20 }}>
        <Input.Search
          enterButton="Send"
          placeholder="Type a message"
          onSearch={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatBox;
