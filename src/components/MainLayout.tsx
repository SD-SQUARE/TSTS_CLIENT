import React, { useState } from 'react';
import { Layout, Menu, Avatar, Switch, Typography, Drawer, Button, Image } from 'antd';
import { UserOutlined, MenuOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import logo from "../assets/HU-bg-clear.png"
import { PAGES_ROUTES_PATHS, PATH_NAMES } from '../app/route.helper';

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { key: PAGES_ROUTES_PATHS[PATH_NAMES.WORK_HOURS], label: 'Work Hours' },
    { key: PAGES_ROUTES_PATHS[PATH_NAMES.UNIVERSITIES], label: 'Universities' },
    { key: PAGES_ROUTES_PATHS[PATH_NAMES.DOMAINS], label: 'Domains' },
    { key: PAGES_ROUTES_PATHS[PATH_NAMES.DEPARTMENTS], label: 'Departments' },
    { key: PAGES_ROUTES_PATHS[PATH_NAMES.SPECIALIZATIONS], label: 'Specializations' },
    { key: PAGES_ROUTES_PATHS[PATH_NAMES.PERMISSIONS], label: 'Permissions' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', background: '#0c1b33' }}>
        <div className="mobile-only">
          <Button 
            type="text" 
            icon={<MenuOutlined style={{ color: 'white', fontSize: '20px' }} />} 
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>

        <div style={{width: '70px', height:'70px'}} >
            <Image src={logo} preview={false}/>
        </div>
        
        <div className="desktop-only" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Text style={{ color: '#cad8ec', cursor: 'pointer' }}>Tickets</Text>
          <Text style={{ color: '#cad8ec', cursor: 'pointer' }}>Identities</Text>
          <Text style={{ color: 'white', fontWeight: 'bold', borderBottom: '2px solid #6F8DBE' }}>Settings</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Text style={{ color: 'white' }}>Lang</Text>
            <Switch size="small" />
          </div>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#6F8DBE' }} />
        </div>

        <div className="mobile-only">
           <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#6F8DBE' }} />
        </div>
      </Header>

      <Layout>

        <Sider 
          width={220} 
          theme="dark"
          breakpoint="lg" 
          collapsedWidth="0" 
          trigger={null}     
          className="desktop-sider"
        >
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={(e) => navigate(e.key)}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>

        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          styles={{
            body: { padding: 0, background: '#0c1b33' },
            header: { background: '#f5f6fa' }
          }}
          width={250}
        >
          <Menu
            mode="inline"
            theme="dark" 
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={(e) => {
              navigate(e.key);
              setMobileMenuOpen(false);
            }}
          />
        </Drawer>

        <Layout style={{ padding: '0 16px 24px', background: '#f5f6fa' }}>
          <Content style={{ padding: '24px 0', margin: 0, minHeight: 280 }}>
            <Outlet />
          </Content>
          <Footer style={{ textAlign: 'center', color: '#888' }}>
            System ©2025
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;









