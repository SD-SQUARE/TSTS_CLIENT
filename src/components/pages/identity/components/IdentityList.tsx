import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";

const IdentityList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const onClick = (e) => navigate(e.key);

    const items = [
        {
            key: "/identities/groups",
            icon: <TeamOutlined />,
            label: "Groups",
        },
        {
            key: "users",
            icon: <UserOutlined />,
            label: "Users",
            children: [
                { key: "/identities/users/requesters", label: "Requesters" },
                { key: "/identities/users/admins", label: "Admins" },
                { key: "/identities/users/technicians", label: "Technicians" },
            ],
        },
    ];

    return (
            <Menu
                theme="dark"
                mode="inline"
                items={items}
                onClick={onClick}
                selectedKeys={[location.pathname]}
                defaultOpenKeys={["users"]}
                style={{ height: "100%", borderRight: 0 }}
            />
    );
};

export default IdentityList;
