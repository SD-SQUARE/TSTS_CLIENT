import { Content } from "antd/es/layout/layout";

const Body = ({ children }) => {
    return (
        <Content style={{ overflow: "auto" }}>
            {children}
        </Content>
    );
};

export default Body;