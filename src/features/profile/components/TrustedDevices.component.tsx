import {
    Button,
    Card,
    Col,
    Row,
    Space,
    Tag,
    Typography,
    Divider,
} from "antd";
import {
    DesktopOutlined,
    MobileOutlined,
    TabletOutlined,
    PlusOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import AddTrustedDeviceDrawer from "./AddTrustedDeviceDrawer.component";
import { trustedDevicesMock } from "../mockups/trustedDevices.mockup";
import { useSelector } from "react-redux";
import useTrustedDevices from "../hooks/useTrustedDevices.hook";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const { Text, Title } = Typography;

const deviceIcon = (type: string) => {
    if (type === "mobile") return <MobileOutlined />;
    if (type === "tablet") return <TabletOutlined />;
    return <DesktopOutlined />;
};

const deviceLabel = (type: string) => {
    if (type === "mobile") return "Mobile";
    if (type === "tablet") return "Tablet";
    return "Desktop";
};

const TrustedDevices = () => {
    
    const { t } = useTranslation();
    const auth = useSelector((state: any) => state.auth);
    const userId = auth.user?.id;

    const { devicesQuery, removeDevice } = useTrustedDevices(userId);

    const devices = devicesQuery.data ?? [];

    const [open, setOpen] = useState(false);

    return (
        <>
            <Row gutter={[16, 16]} align="stretch">
                {devices.map(device => (
                    <Col key={device.id} xs={24} sm={12} md={8}>
                        <Card
                            hoverable
                            style={{
                                height: "100%",
                                borderRadius: 14,
                                display: "flex",
                                flexDirection: "column",
                            }}
                            bodyStyle={{
                                flex: 1,
                                padding: 20,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* Header */}
                            <Space align="start" size="middle">
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "50%",
                                        background: "#e6f4ff",
                                        color: "#1677ff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 22,
                                    }}
                                >
                                    {deviceIcon(device.device_type)}
                                </div>

                                <div>
                                    <Title level={5} style={{ margin: 0 }}>
                                        {device.name}
                                    </Title>

                                    <Space size="small" style={{ marginTop: 4 }}>
                                        <Tag color="blue">
                                            {deviceLabel(device.device_type)}
                                        </Tag>
                                        <Tag color="green">{t("profile.trustedDevices.trusted") }</Tag>
                                    </Space>
                                </div>
                            </Space>

                            <Divider style={{ margin: "16px 0" }} />

                            {/* Info */}
                            <Space vertical size={8}   >
                                <Text type="secondary">{t("profile.trustedDevices.device.browser") }</Text>
                                <Text>{device.browser}</Text>

                                <Text type="secondary" style={{ marginTop: 8 }}>
                                    {t("profile.trustedDevices.device.os") }
                                </Text>
                                <Text>{device.os}</Text>

                                <Text type="secondary" style={{ marginTop: 8 }}>
                                    {t("trusted_devices.ipAddress") }
                                </Text>
                                <Text>{device.ipAddress}</Text>

                                <Text type="secondary" style={{ marginTop: 8 }}>
                                    {t("profile.trustedDevices.device.activatedSince") }
                                </Text>
                                <Text>{dayjs(device.activatedSince).format("DD/MM/YYYY, hh:mm a")}</Text>
                            </Space>

                            <div style={{ flex: 1 }} />

                            {/* Footer */}
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                block
                                style={{ marginTop: 16 }}
                                onClick={() => removeDevice.mutate(device.id)}
                            >
                               {t("profile.trustedDevices.remove") }
                            </Button>
                        </Card>
                    </Col>
                ))}

                {/* ADD DEVICE CARD */}
                <Col xs={24} sm={12} md={8}>
                    <Card

                        id="add-trusted-device-card"
                        hoverable
                        onClick={() => setOpen(true)}
                        style={{
                            height: "100%",
                            borderRadius: 14,
                            border: "1px dashed #d9d9d9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                        }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <Space direction="vertical" align="center" size="middle">
                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: "50%",
                                    background: "#f0f5ff",
                                    color: "#1677ff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 28,
                                }}
                            >
                                <PlusOutlined />
                            </div>

                            <Title level={5} style={{ margin: 0 }}>
                                {t("profile.trustedDevices.addTitle") }
                            </Title>

                            <Text type="secondary" style={{ textAlign: "center" }}>
                                {t("profile.trustedDevices.motive") }
                            </Text>

                            <Button type="primary">
                                {t("profile.trustedDevices.add") }
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <AddTrustedDeviceDrawer
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={() =>
                    console.log("✅ Device added successfully")
                }
            />
        </>
    );
};

export default TrustedDevices;

