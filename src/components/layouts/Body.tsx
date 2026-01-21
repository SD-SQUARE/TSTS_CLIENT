import { useEffect, useRef, useState } from "react";
import { Content } from "antd/es/layout/layout";
import AppFooter from "./AppFooter";

const Body = ({ children }) => {
    const contentRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const checkOverflow = () => {
            if (!contentRef.current) return;
            const el = contentRef.current;
            setIsOverflowing(el.scrollHeight > el.clientHeight);
        };

        checkOverflow();
        window.addEventListener("resize", checkOverflow);

        return () => window.removeEventListener("resize", checkOverflow);
    }, [children]);

    return (
        <>
            <Content
                ref={contentRef}
                style={{
                    height: "100%",
                }}
            >
                {/* Main content */}
                {children}

                {/* If overflow → footer inside */}
                {isOverflowing && <AppFooter />}
            </Content>

            {/* If no overflow → footer outside */}
            {!isOverflowing && <AppFooter />}
        </>
    );
};

export default Body;
