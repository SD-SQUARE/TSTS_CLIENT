import { Empty, Flex, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import IdentityList from "./components/IdentityList";
import { Outlet, useOutlet } from "react-router-dom";

// TODO: Replace the empty container with dashboard
const Identities = () => {
    
    const outlet = useOutlet();
    return (
        <Layout style={{height:"100%"}}>
            <Sider>
                <IdentityList />
            </Sider>
            <Content style={{ padding: 16 }} >
                
                {
                    outlet
                    ? <Outlet />
                    : (
                    <Flex style={{ height:"100%"}} justify="center" align="center">
                        <Empty  description={false}  /> 
                    </Flex>
                    )
                }  
            </Content>
        </Layout>
    );
}

export default Identities