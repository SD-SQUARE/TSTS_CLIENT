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
                        style={{ cursor: "pointer", minWidth: screens.md ? "auto" : "100%", display: "flex", gap: 8 , flexDirection: screens.md ? "row" : "column"}}
                        onClick={() => {
                            if (!screens.md) {
                                setTimeout(() => closeDrawer(), 0);
                            }
                        }}
                    >
                        {child}
                    </div>
                ))}
        </div>
    );
};

export default NavPanel