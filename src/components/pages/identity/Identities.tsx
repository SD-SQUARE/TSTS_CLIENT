import { Empty, Flex, FloatButton, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import IdentityList from "./components/IdentityList";
import { Outlet, useOutlet } from "react-router-dom";
import { useRef } from "react";

// TODO: Replace the empty container with dashboard
const Identities = () => {
    
    const contentRef = useRef<HTMLDivElement>(null);
    
    const outlet = useOutlet();
    return (
        <Layout hasSider style={{ height: "100%" }} >
            <Sider>
                <IdentityList />
            </Sider>
            <Content style={{ padding: 16, overflow: "auto"}} >
                
                {
                    outlet
                    ? <Outlet />
                    : (
                    <Flex style={{ height:"100%"}} justify="center" align="center">
                        <Empty  description={false}  /> 
                    </Flex>
                    )
                }  

                <FloatButton.BackTop target={() => contentRef.current} />
            </Content>
        </Layout>
    );
}

export default Identities