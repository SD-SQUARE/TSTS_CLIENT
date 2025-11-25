// NavPanel 
import { Children } from "react";
import { Grid } from "antd";

const { useBreakpoint } = Grid;


const NavPanel = ({ children, closeDrawer = () => { } }) => {
    const screens = useBreakpoint();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: screens.md ? "row" : "column",
                gap: screens.md ? 16 : 24,
                alignItems: screens.md ? "center" : "flex-start",
                width: "100%",
            }}
        >
            {children &&
                Children.toArray(children).map((child) => (
                    <div
                        key={crypto.randomUUID()}
                        style={{ cursor: "pointer", width: screens.md ? "auto" : "100%" }}
                        onClick={() => {
                            if (!screens.md) closeDrawer();
                        }}
                    >
                        {child}
                    </div>
                ))}
        </div>
    );
};

export default NavPanel