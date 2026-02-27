import {
    Drawer,
    Button,
    Space,
    Typography,
    Descriptions,
    Alert,
    Input,
    Divider,
    Tag,
    message,
} from "antd";
import { useEffect, useState } from "react";
import {
    SafetyCertificateOutlined,
    EditOutlined,
} from "@ant-design/icons";
import { collectDeviceInfo } from "../../../utils/deviceInfo.utils";
import useTrustedDevices from "../hooks/useTrustedDevices.hook";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const { Title, Text } = Typography;

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit?: () => void;
};

const AddTrustedDeviceDrawer = ({ open, onClose, onSubmit }: Props) => {
    const { t } = useTranslation();
    const deviceInfo = collectDeviceInfo();

    const [verified, setVerified] = useState(false);
    const [credential, setCredential] = useState<any | null>(null);
    const [deviceName, setDeviceName] = useState(deviceInfo.browser);

    const auth = useSelector((state: any) => state.auth);
    const userId = auth.user?.id ?? "";

    const { addDevice, verifyDevice, devicesQuery } = useTrustedDevices(userId);

    const isAlreadyTrusted = devicesQuery.data?.some(
        (d: any) =>
            d.deviceType === deviceInfo.device_type &&
            d.browser === deviceInfo.browser &&
            d.os === deviceInfo.os &&
            d.isActive
    );

    useEffect(() => {
        if (open) {
            // Reset every time drawer opens
            setVerified(false);
            setCredential(null);
            setDeviceName(deviceInfo.browser);
        }
    }, [open]);

    useEffect(() => {
        if (isAlreadyTrusted) {
            setVerified(true); // Disable Verify if already trusted
        }
    }, [isAlreadyTrusted]);

    
    
    const handleVerify = async () => {

        try {
            const cred = await verifyDevice.mutateAsync();
            setCredential(cred);
            setVerified(true);
        } catch (err: any) {
            setVerified(false);
            setCredential(null);

            console.error("WebAuthn error:", err);
            console.error(err?.name || "WebAuthn failed");
            message.error(t("profile.trustedDevices.messages.verifyError"));
            // message.error("Failed to verify device, please make sure you did not verified this device before and try again");
        }
    };


    const handleSubmit = async () => {
        if (!credential) return;

        try {
            await addDevice.mutateAsync({
                name: deviceName,
                deviceType: deviceInfo.device_type,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                credential,
            });

            message.success(t("profile.trustedDevices.messages.addSuccess"));
            onClose();
            onSubmit?.();
        } catch {
            message.error(t("profile.trustedDevices.messages.addError"));
        }
    };



    return (
        <Drawer
            placement={i18next.language === "en" ? "right" : "left"}
            open={open}
            onClose={onClose}
            size={440}
            title={t("profile.trustedDevices.addTitle")}
            footer={
                <Space style={{ width: "100%", justifyContent: "space-between", alignItems: "stretch",}}
                    styles={{
                        item: {
                            width: '100%'
                        }
                    }}
                >
                    <Button
                        onClick={onClose}
                        style={{ width: "100%" }}
                        
                    >
                        {t("profile.trustedDevices.cancel")}
                    </Button>
                    <Button
                        type="primary"
                        loading={addDevice.isPending}
                        onClick={handleSubmit}
                        disabled={!verified}
                        style={{ width: "100%" }}
                    >
                        {t("profile.trustedDevices.add")}
                    </Button>

                </Space>
            }
        >
            <Space direction="vertical" size="large" style={{ width: "100%",direction: i18next.language === "en" ? 'ltr': 'rtl' }}>
                {/* Security Info */}
                <Alert
                    type="info"
                    showIcon
                    message={t("profile.trustedDevices.security.title")}
                    description={t("profile.trustedDevices.security.description")}
                />

                {/* Editable Name */}
                <div>
                    <Text strong>{t("profile.trustedDevices.device.name")}</Text>
                    <Input
                        prefix={<EditOutlined />}
                        value={deviceName}
                        onChange={e => setDeviceName(e.target.value)}
                        placeholder={t("profile.trustedDevices.device.namePlaceholder")}
                        style={{ marginTop: 6 }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {/* Only the device name can be edited */}
                        {t("profile.trustedDevices.device.nameHint")}
                    </Text>
                </div>

                <Divider styles={{
                    rail: {
                        margin: 0,
                    },
                    root:
                    {
                        margin: 0
                    }
                }} />

                {/* Device Info */}
                <Space align="center">
                    <Title level={5} style={{ margin: 0 }}>
                        {t("profile.trustedDevices.device.detectedInfo")}
                    </Title>

                    {verified && (
                        <Tag
                            color="green"
                            icon={<SafetyCertificateOutlined />}
                        >
                            {t("profile.trustedDevices.verified")}
                        </Tag>
                    )}
                </Space>

                <Descriptions
                    style={{
                        direction: i18next.language === "en" ? 'ltr': 'rtl'
                    }}
                    column={1} bordered size="small">
                    <Descriptions.Item label={t("profile.trustedDevices.device.type")}>
                        {deviceInfo.device_type}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("profile.trustedDevices.device.browser")}>
                        {deviceInfo.browser}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("profile.trustedDevices.device.os")}>
                        {deviceInfo.os}
                    </Descriptions.Item>
                </Descriptions>

                {/* Verification State */}
                {!verified ? (
                    <Alert
                        
                        type="warning"
                        showIcon
                        title={t("profile.trustedDevices.status.notVerifiedTitle")}
                        description={t("profile.trustedDevices.status.notVerifiedDesc")}
                    />
                ) : (
                    <Alert
                        type="success"
                        showIcon
                            title={t("profile.trustedDevices.status.verifiedTitle")}
                            description={t("profile.trustedDevices.status.verifiedDesc")}
                    />
                )}

                <Button
                    loading={verifyDevice.isPending}
                    onClick={handleVerify}
                    disabled={verified}
                    icon={<SafetyCertificateOutlined />}
                    style={{ width: "100%" }}
                >
                    {verified ? t("profile.trustedDevices.verified") : t("profile.trustedDevices.verify")}
                </Button>

                
            </Space>
        </Drawer>
    );
};

export default AddTrustedDeviceDrawer;

