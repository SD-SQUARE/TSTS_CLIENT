import { Avatar, Space, Tag, Typography } from "antd";
import type { User } from "../interfaces/user.interface";

const { Title, Text } = Typography;

const ProfileHeader = ({ user }: { user: User }) => {
    return (
        <div
            style={{
                background:
                    "linear-gradient(135deg, var(--color-primary) 20%, #69b1ff 100%)",
                padding: 32,
                borderRadius: 12,
            }}
        >
            <Space size={24} align="center" wrap>
                <Avatar
                    size={110}
                    src={user?.image ?? undefined}
                    style={{
                        border: "4px solid #fff",
                        background: "#fff",
                        color: "#1677ff",
                        fontSize: 40,
                    }}
                >
                    {user?.first_name_en[0]}
                </Avatar>

                <div style={{ color: "#fff" }}>
                    <Title level={3} style={{ color: "#fff", margin: 0 }}>
                        {user?.first_name_en} {user?.mid_name_en}{" "}
                        {user?.last_name_en}
                    </Title>

                    <Text style={{ color: "#e6f4ff", display: "block" }}>
                        {user?.job_en}
                    </Text>

                    <Tag
                        color="var(--color-primary)"
                        style={{
                            marginTop: 8,
                            padding: "4px 12px",
                            borderRadius: 999,
                        }}
                    >
                        {user?.user_type.toUpperCase()}
                    </Tag>
                </div>
            </Space>
        </div>
    );
};

export default ProfileHeader;
