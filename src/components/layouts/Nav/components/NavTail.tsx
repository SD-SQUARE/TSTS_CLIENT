// NavTail
import { Avatar, Row, Col, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import LanguageSwitcher from "./LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../../features/login/store/authSlice";
import { Button } from 'antd';
import { useTranslation } from "react-i18next";
import "./navTail.css";
import NotificationBell from "../../../../features/communications/components/NotificationBell";
import ChatLauncher from "../../../../features/communications/components/ChatLauncher";

const NavTail = () => {

    const { token } = useSelector((state: any) => state.auth);
    const { t } = useTranslation();
    const navigator = useNavigate();
    const dispatch = useDispatch();

    const gotoProfile = () => navigator("/profile");
    const gotoLogin = () => navigator("/auth/login");
    const handleLogout = () => {
        dispatch(logout());
        navigator("/auth/login");
    }


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
                <Space size={"large"}>
                    {token ?
                        <Space size={"middle"} >
                            <NotificationBell />
                            <ChatLauncher />
                            <div id='profile-trusted-devices'>
                                <Avatar
                                style={{ cursor: "pointer" }}
                                shape="circle" size="large"
                                icon={<UserOutlined />}
                                onClick={gotoProfile}
                            />
                            </div>
                        <Button className="authBTN logoutBTN" onClick={handleLogout}>{t("Logout")}</Button>
                    </Space>
                    : <Button  className="authBTN" onClick={gotoLogin}>{t("Login")}</Button>
                    }
                </Space>
            </Col>
        </Row>
    );
};

export default NavTail;

