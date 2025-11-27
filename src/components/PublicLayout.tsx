import React from 'react';
import { Layout, Typography, Switch, Image } from 'antd';
import logo from "../assets/HU-bg-clear.png"; 

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', background: '#0c1b33' }}>
        
        <div style={{ width: '70px', height: '70px', display: 'flex', alignItems: 'center' }}>
            <Image src={logo} preview={false} width={60} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Text style={{ color: 'white' }}>Lang</Text>
            <Switch size="small" />
          </div>
        </div>
      </Header>

      <Content style={{ 
          background: '#f5f6fa', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '20px' 
      }}>
        {children}
      </Content>

      <Footer style={{ textAlign: 'center', color: '#888', background: '#f5f6fa' }}>
        System ©2025
      </Footer>
    </Layout>
  );
};

export default PublicLayout;