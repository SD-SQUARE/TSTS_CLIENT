// NavTail
import { Avatar, Row, Col } from "antd";
import { UserOutlined } from "@ant-design/icons";
import LanguageSwitcher from "./LanguageSwitcher";
import { useNavigate } from "react-router-dom";


const NavTail = () => {

    const navigator = useNavigate();

    const gotoProfile = () => navigator("/profile");

    return (
        <Row
            style={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center",
                columnGap: 12,
            }}
        >
            {/* Language Switcher */}
            <Col>
                <LanguageSwitcher  />
            </Col>

            {/* User avatars */}
            
            <Col>
                <Avatar
                    style={{ cursor: "pointer" }}
                    shape="circle" size="large"
                    icon={<UserOutlined />}
                    onClick={gotoProfile}
                />
            </Col>
        </Row>
    );
};

export default NavTail;

