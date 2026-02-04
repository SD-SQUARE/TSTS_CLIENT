import {
    Button,
    Card,
    Col,
    Row,
    Space,
    Tag,
    Typography,
} from "antd";
import {
    DesktopOutlined,
    MobileOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useTrustedDevices } from "../hooks/useTrustedDevices.hook";
import { useSelector } from "react-redux";

const { Text, Title } = Typography;

const devicesMock = [
    {
        id: "1",
        name: "Chrome - Windows",
        type: "desktop",
        lastActive: "Today, 10:32 AM",
    },
    {
        id: "2",
        name: "iPhone 14 Pro",
        type: "mobile",
        lastActive: "Yesterday, 6:20 PM",
    },
    {
        id: "3",
        name: "Chrome - Windows",
        type: "desktop",
        lastActive: "Today, 10:32 AM",
    },
    {
        id: "4",
        name: "iPhone 14 Pro",
        type: "mobile",
        lastActive: "Yesterday, 6:20 PM",
    },
];

const TrustedDevices = () => {
    const auth = useSelector((state: any) => state.auth);
    const userId = auth.user?.id ?? "";

    // TODO: apply api 
    // const { data: devices, isLoading } = useTrustedDevices(userId);

    return (
        <Row gutter={[16, 16]} align="stretch">
            {devicesMock.map(device => (
                <Col key={device.id} xs={24} sm={12} md={8}>
                    <Card
                        hoverable
                        style={{
                            height: "100%",
                            borderRadius: 12,
                            display: "flex",
                            flexDirection: "column",
                            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                        }}
                        bodyStyle={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Top */}
                        <Space align="start">
                            <div
                                style={{
                                    fontSize: 28,
                                    color: "#1677ff",
                                }}
                            >
                                {device.type === "desktop" ? (
                                    <DesktopOutlined />
                                ) : (
                                    <MobileOutlined />
                                )}
                            </div>

                            <div>
                                <Title level={5} style={{ margin: 0 }}>
                                    {device.name}
                                </Title>
                                <Tag color="green">
                                    Trusted device
                                </Tag>
                            </div>
                        </Space>

                        {/* Middle */}
                        <div style={{ marginTop: 16, marginBottom: 16 }}>
                            <Text type="secondary">Last active</Text>
                            <div style={{ fontWeight: 500 }}>
                                {device.lastActive}
                            </div>
                        </div>

                        {/* Spacer */}
                        <div style={{ flex: 1 }} />

                        {/* Bottom */}
                        <Button danger block>
                            Remove Device
                        </Button>
                    </Card>
                </Col>
            ))}

            {/* ADD DEVICE CARD */}
            <Col xs={24} sm={12} md={8}>
                <Card
                    hoverable
                    style={{
                        height: "100%",
                        borderRadius: 12,
                        border: "1px dashed #d9d9d9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Space direction="vertical" align="center">
                        <PlusOutlined
                            style={{
                                fontSize: 32,
                                color: "#1677ff",
                            }}
                        />
                        <Text strong>Add Trusted Device</Text>
                        <Text type="secondary" style={{ textAlign: "center" }}>
                            Register a new browser or device
                        </Text>
                        <Button type="primary">
                            Add Device
                        </Button>
                    </Space>
                </Card>
            </Col>
        </Row>
    );
};

export default TrustedDevices;
