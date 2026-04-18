import React from 'react';
import { Card } from 'antd';
import ChatWorkspace from './ChatWorkspace';

const ChatCenterPage: React.FC = () => (
  <Card
    styles={{
      body: {
        padding: 20,
      },
    }}
    style={{
      borderRadius: 28,
      border: '1px solid #e7edf7',
      boxShadow: '0 24px 48px rgba(15, 23, 42, 0.06)',
    }}
  >
    <ChatWorkspace mode="page" />
  </Card>
);

export default ChatCenterPage;
