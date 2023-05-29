import React, { useEffect, useState, useRef }  from 'react';
import { List, Avatar, Input, Button, Space } from 'antd';
import { SendOutlined, DeleteOutlined } from '@ant-design/icons';
import { resetChat } from '../services/reset';
import { BASE_URL } from '../utils/url';

const ChatBox = ({callChatFunc}) => {

  const [messages, setMessages] = useState([]); // 聊天消息数据
  const [answering, setAnswering] = useState(false); // 实时显示信息流

  const listRef = useRef(null); // 用于在生成内容时始终将滚动条拉到底端

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (message) => {
    // 发送消息的逻辑
    console.log('Sending message:', message);
    const newMessage = { id: messages.length + 1, sender: 'You', content: message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setAnswering(true);
  };

  const pushPrompt = (prompt) => {
    if (prompt === '') {
      alert('请输入内容');
      return;
    }
    const eventSource = new EventSource(`${BASE_URL}/chat-stream?prompt=${prompt}`);
    let streaming = false;
    let answer = '';

    // 创建初始的消息对象
    const initialMessage = { id: messages.length + 1, sender: 'ChatGPT', content: answer };
    setMessages((prevMessages) => [...prevMessages, initialMessage]);

    eventSource.onmessage = (event) => {
      console.log(event.data);
      let data = decodeURIComponent(event.data);
      answer = answer + data;
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        lastMessage.content = answer;
        return updatedMessages;
      });


      if (event.data === '') {
        if (streaming) { // 到达末尾，结束回答
          eventSource.close()
          setAnswering(false);
        } else {
          streaming = true;
        }
      }
    };

    eventSource.onerror = (error) => {
      alert('连接失败:', error);
      setAnswering(false);
    };
  };

  const handleReset = () => {
    console.log('Resetting messages');
    setMessages([]);
    resetChat();
  };

  const handleSend = () => {
    const inputElement = document.getElementById('messageInput');
    const message = inputElement.value;
    if (message) {
      handleSendMessage(message);
      pushPrompt(message);
      // TODO 清空输入框内容
    }
  };

  callChatFunc.current = (message) => {
    if (message) {
      handleSendMessage(message);
      pushPrompt(message);
    }
  }

  return (
    <div style={{ margin: '20px' }}>
      <div ref={listRef} style={{ overflowY: 'auto', height: 'calc(100vh - 270px)' }}>
        <List
          dataSource={messages}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                avatar={<Avatar>{item.sender[0]}</Avatar>}
                title={item.sender}
                description={item.content}
                style={{ whiteSpace: 'pre-line' }}
              />
            </List.Item>
          )}
        />
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '140px' }}>
        <div style={{ flex: '1 1 auto', marginRight: '10px' }}>
          <Input.TextArea
            id="messageInput"
            placeholder="Type a message"
            autoSize={{ minRows: 1, maxRows: 6 }}
            onPressEnter={(event) => {
              if (!event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
        <div>
          <Space>
            <Button type="primary" icon={<SendOutlined />} loading={answering} onClick={handleSend} />
            <Button danger type="primary" icon={<DeleteOutlined />} loading={answering} onClick={handleReset} />
          </Space>
        </div>
      </div>  
    </div>
  );
};

export default ChatBox;
