// NavBar
import { useState } from "react";
import { Row, Col, Grid, Button } from "antd";
import Logo from "./components/Logo";
import NavTail from "./components/NavTail";
import DesktopNav from "./components/DesktopNav";
import MobileNavDrawer from "./components/MobileNavDrawer";
import { MenuOutlined } from "@ant-design/icons";
import { useGoHome } from "../../../hooks/useGoHome";


const { useBreakpoint } = Grid;

const NavBar = ({ children }) => {
    const [open, setOpen] = useState(false);
    const goHome = useGoHome();
    const screens = useBreakpoint();
    const isDesktop = screens.md;

    return (
        <header style={{  padding: "0 1em" }} className="primary-bg">
            <Row
                align="middle"
                justify="space-between"
                style={{ height: 64 }}
            >
                {/* Logo */}
                <Col><Logo onClick={goHome}/></Col>

                {/* Desktop */}
                {isDesktop && <DesktopNav>{children}</DesktopNav>}
                {isDesktop && <NavTail />}

                
                {/* Mobile Button */}
                {!isDesktop && (
                    <Col>
                        <Button
                            icon={<MenuOutlined />}
                            type="text"
                            style={{ color: "white" }}
                            onClick={() => setOpen(true)}
                        />
                    </Col>
                )}
            </Row>

            {/* Mobile Drawer */}
            {!isDesktop && (
                <MobileNavDrawer
                    open={open}
                    setOpen={setOpen}
                >
                    {children}
                </MobileNavDrawer>
            )}
        </header>
    );
};

export default NavBar;
