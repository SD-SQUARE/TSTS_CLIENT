import { FloatButton } from "antd";
import { useRef } from "react";
import { Content } from "antd/es/layout/layout";

const Body = ({ children }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <Content ref={contentRef} style={{ overflow: "auto", height: '100%' }}>
            {children}
            <FloatButton.BackTop target={() => contentRef.current}
                style={{ marginBottom: "2em" }}
                className="secondary-bg white-color"
            />
        </Content>
    );
};

export default Body;
