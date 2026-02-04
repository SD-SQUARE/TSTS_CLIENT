import { Card, Space, Tag, Tooltip, Typography, message } from "antd";
import type { User } from "../interfaces/user.interface";

const { Title } = Typography;

const Departments = ({ user }: { user: User }) => {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success(`Copied "${text}"`);
    };

    return (
        <>
            <Title level={5}>Departments</Title>

            <Card
                bordered={false}
                style={{
                    borderRadius: 12,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                    padding: 16,
                    transition: "box-shadow 0.3s ease",
                }}
                bodyStyle={{ padding: 12 }}
                hoverable
            >
                <Space wrap size={[8, 12]}>
                    {user?.departments.map(dep => (
                        <Tooltip key={dep.id} title="Click to copy">
                            <Tag
                                color="cyan"
                                style={{
                                    borderRadius: 999,
                                    padding: "6px 14px",
                                    fontSize: 14,
                                    cursor: "pointer",
                                    userSelect: "none",
                                }}
                                onClick={() => handleCopy(dep.name)}
                            >
                                {dep.name}
                            </Tag>
                        </Tooltip>
                    ))}
                </Space>
            </Card>
        </>
    );
};

export default Departments;
