
import { Layout} from 'antd';
import Body from './layouts/Body';

const {  Content } = Layout;

const PageLayout = ({children}) => {

    return (
        <Body>
            <Layout style={{ minHeight: '100%', flex: 1 }}>
                
                {/* Main Layout */}
                <Layout style={{
                    flex: 1,
                    padding: '0 16px 0.4rem',
                    // background: '#f5f6fa',
                }}>
                    <Content style={{ padding: '0.2rem 0', margin: 0 }}>
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Body>
    );
};

export default PageLayout;
