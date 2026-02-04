import { Card, Space, Typography } from "antd";

const { Text } = Typography;

interface Props {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}

const InfoItem = ({ icon, label, value }: Props) => {
    return (
        <Card
            bordered={false}
            style={{
                height: "100%",
                borderRadius: 12,
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            }}
        >
            <Space align="start">
                <div style={{ fontSize: 20, color: "#1677ff" }}>{icon}</div>
                <div style={{ minWidth: 0 }}>
                    <Text type="secondary">{label}</Text>
                    <div style={{ fontWeight: 500, wordBreak: "break-all" }}>
                        {value}
                    </div>
                </div>
            </Space>
        </Card>
    );
};

export default InfoItem;
