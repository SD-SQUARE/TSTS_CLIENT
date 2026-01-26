
import { Layout} from 'antd';
import Body from './layouts/Body';

const {  Content } = Layout;

const PageLayout = ({children}) => {

    return (
        <Body>
            <Layout style={{ minHeight: '100%' }}>
                
                {/* Main Layout */}
                <Layout style={{ padding: '0 16px 24px', background: '#f5f6fa', overflow: 'auto', }}>
                    <Content style={{ padding: '24px 0', margin: 0 }}>
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Body>
    );
};

export default PageLayout;
