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
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

const EXTENSION_FILE_URL = "/extension.zip";
const VIDEO_URL = "/extension-guide.mp4";

const Extension = ({ searchTerm = "" }: { searchTerm?: string }) => {
    const {t} = useTranslation();
    const [videoError, setVideoError] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
        !normalizedSearch ||
        [
            t('profile.settings.extensionSection.title'),
            t('profile.settings.extensionSection.description'),
            t('profile.settings.extensionSection.supportedBrowsers'),
            t('profile.settings.extensionSection.secure'),
        ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);

    const handleDownload = () => {
        if (!EXTENSION_FILE_URL) {
            message.error(t('profile.settings.extensionSection.fileMissing'));
            return;
        }

        setDownloading(true);

        // Simulate download start
        setTimeout(() => {
            setDownloading(false);
            window.open(EXTENSION_FILE_URL, "_blank");
        }, 500);
    };

    if (!matchesSearch) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("profile.settings.noSearchResults")}
            />
        );
    }

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
                            {t('profile.settings.extensionSection.title')}
                        </Title>

                        <Text type="secondary">
                            {t('profile.settings.extensionSection.description')}
                        </Text>

                        <Space direction="vertical" size={8}>
                            <Text>
                                • {t('profile.settings.extensionSection.supportedBrowsers')}
                            </Text>
                            <Text>
                                • {t('profile.settings.extensionSection.secure')}
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
                            {t('profile.settings.extensionSection.download')}
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
                    <Title level={5}>{t('profile.settings.extensionSection.guide')}</Title>

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
                                    {t('profile.settings.extensionSection.videoUnavailable')}
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
