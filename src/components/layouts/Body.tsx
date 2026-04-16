import { Layout } from "antd";
import AppFooter from "./AppFooter";

const Body = ({ children }) => {
    return (
        <Layout
            style={{
                minHeight: "calc(100vh - 64px)",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Layout.Content
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {children}
            </Layout.Content>
            <AppFooter />
        </Layout>
    );
};

export default Body;
