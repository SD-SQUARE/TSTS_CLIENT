import React, { useState } from 'react';
import { Layout, Menu, Drawer} from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Body from './layouts/Body';

const { Sider, Content } = Layout;

const MainLayout = ({ menuItems }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(true); // start collapsed (mini)

    return (
        <Body>
            <Layout>
                {/* Desktop Sider */}
                <Sider
                    width={220}
                    theme="dark"
                    collapsible={false}
                    collapsed={collapsed}
                    onMouseEnter={() => setCollapsed(false)} // expand on hover
                    onMouseLeave={() => setCollapsed(true)}  // collapse on leave
                    style={{ transition: 'all 0.2s' }}
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

                {/* Mobile Drawer */}
                <Drawer
                    title="Menu"
                    placement="left"
                    onClose={() => setMobileMenuOpen(false)}
                    open={mobileMenuOpen}
                    bodyStyle={{ padding: 0, background: '#0c1b33' }}
                    headerStyle={{ background: '#f5f6fa' }}
                    size={250}
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

                {/* Main Layout */}
                <Layout style={{ padding: '0 16px 24px', background: '#f5f6fa', overflow: 'auto' }}>
                    <Content style={{ padding: '24px 0', margin: 0, minHeight: 280 }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Body>
    );
};

export default MainLayout;
