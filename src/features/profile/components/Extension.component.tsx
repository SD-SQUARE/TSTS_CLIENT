// tabs/settings/Extension.tsx
import {
    Button,
    Card,
    Col,
    Row,
    Space,
    Typography,
    Empty,
    message,
} from "antd";
import {
    DownloadOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;

const EXTENSION_FILE_URL = "/extension.zip";
const VIDEO_URL = "/extension-guide.mp4";

const Extension = () => {
    const [videoError, setVideoError] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const handleDownload = () => {
        if (!EXTENSION_FILE_URL) {
            message.error("Extension file is not available.");
            return;
        }

        setDownloading(true);

        // Simulate download start
        setTimeout(() => {
            setDownloading(false);
            window.open(EXTENSION_FILE_URL, "_blank");
        }, 500);
    };

    return (
        <Row gutter={[24, 24]}>
            {/* DOWNLOAD CARD */}
            <Col xs={24} md={10}>
                <Card
                    style={{
                        height: "100%",
                        borderRadius: 12,
                        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                    }}
                >
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        <Title level={5} style={{ marginBottom: 0 }}>
                            Browser Extension
                        </Title>

                        <Text type="secondary">
                            Install the official browser extension to enhance your workflow.
                        </Text>

                        <Space direction="vertical" size={8}>
                            <Text>
                                • Supported browsers: Chrome, Edge
                            </Text>
                            <Text>
                                • Secure & verified extension
                            </Text>
                        </Space>

                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            loading={downloading}
                            onClick={handleDownload}
                            style={{ marginTop: 16 }}
                            block
                        >
                            Download Extension
                        </Button>
                    </Space>
                </Card>
            </Col>

            {/* VIDEO CARD */}
            <Col xs={24} md={14}>
                <Card
                    style={{
                        height: "100%",
                        borderRadius: 12,
                        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                    }}
                >
                    <Title level={5}>Installation Guide</Title>

                    {!videoError ? (
                        <video
                            width="100%"
                            controls
                            style={{
                                borderRadius: 8,
                                background: "#000",
                            }}
                            src={VIDEO_URL}
                            onError={() => setVideoError(true)}
                        />
                    ) : (
                        <Empty
                            image={<PlayCircleOutlined style={{ fontSize: 48 }} />}
                            description={
                                <Text type="secondary">
                                    Video guide is currently unavailable.
                                </Text>
                            }
                        />
                    )}
                </Card>
            </Col>
        </Row>
    );
};

export default Extension;
