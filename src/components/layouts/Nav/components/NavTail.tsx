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
            {/* TODO: add login and logout */}
            <Col>
                <Space size={"large"}>
                    {token ?
                    <Space size={"middle"} >
                        <Avatar
                            style={{ cursor: "pointer" }}
                            shape="circle" size="large"
                            icon={<UserOutlined />}
                            onClick={gotoProfile}
                        />
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

