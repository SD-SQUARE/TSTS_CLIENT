// NavTail
import { Avatar, Row, Col, Space, Button, Badge } from "antd";
import { UserOutlined } from "@ant-design/icons";
import LanguageSwitcher from "./LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../../features/login/store/authSlice";
import { useTranslation } from "react-i18next";
import "./navTail.css";
import NotificationBell from "../../../../features/communications/components/NotificationBell";
import ChatLauncher from "../../../../features/communications/components/ChatLauncher";

const NavTail = () => {
    const { token, user } = useSelector((state: any) => state.auth);
    const { t } = useTranslation();
    const navigator = useNavigate();
    const dispatch = useDispatch();

    const gotoProfile = () => navigator("/profile");
    const gotoLogin = () => navigator("/auth/login");

    const handleLogout = () => {
        dispatch(logout());
        navigator("/auth/login");
    };

    const getRoleColor = (role: string) => {
        switch (role?.toLowerCase()) {
            case "admin":
            case "superadmin":
                return "#ff4d4f";
            case "technician":
                return "#faad14";
            case "requester":
                return "#52c41a";
            default:
                return "#25232395";
        }
    };

    const roleColor = getRoleColor(user?.role);

    return (
        <Row
            style={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center",
                columnGap: 12,
            }}
        >
            <Col>
                <LanguageSwitcher />
            </Col>

            <Col>
                <Space size="large">
                    {token ? (
                        <Space size="middle">
                            <NotificationBell />
                            <ChatLauncher />

                            {/* Profile + Role Badge */}
                            <div
                                id="profile-trusted-devices"
                                style={{
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                                onClick={gotoProfile}
                            >
                                <Badge
                                    count={user?.role || "User"}
                                    offset={[-20, 40]}
                                    style={{
                                        backgroundColor: roleColor,
                                        fontSize: 8,
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        borderRadius: 4,
                                        // 🔥 reduce padding/size
                                        paddingInline: 4,
                                        height: 14,
                                        minWidth: 14,
                                        lineHeight: "14px",
                                    }}
                                >
                                    <Avatar
                                        style={{
                                            border: `2px solid ${roleColor}`,
                                            padding: 2,
                                        }}
                                        shape="circle"
                                        size="large"
                                        icon={<UserOutlined />}
                                        src={user?.image}
                                    />
                                </Badge>
                            </div>

                            <Button className="authBTN logoutBTN" onClick={handleLogout}>
                                {t("Logout")}
                            </Button>
                        </Space>
                    ) : (
                        <Button className="authBTN" onClick={gotoLogin}>
                            {t("Login")}
                        </Button>
                    )}
                </Space>
            </Col>
        </Row>
    );
};

export default NavTail;