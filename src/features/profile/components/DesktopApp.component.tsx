/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Divider, Flex, Input, Row, Space, Statistic, Tag, Typography, message } from 'antd';
import {
    CheckCircleOutlined,
    CopyOutlined,
    DesktopOutlined,
    DownloadOutlined,
    LoadingOutlined,
    ReloadOutlined,
    SafetyCertificateOutlined,
    ToolOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { isElectron, useElectron } from '../../../hooks/useElectron';

const { Paragraph, Text, Title } = Typography;

const DesktopApp: React.FC = () => {
    const { t } = useTranslation();
    const {
        getLocalId,
        isRustDeskInstalled,
        openRustDesk,
        registerDesktopDevice,
    } = useElectron();
    const inElectron = isElectron();
    const userEmail = useSelector((state: any) => state.auth.user?.email || '');

    const [localId, setLocalIdState] = useState('');
    const [isLoadingId, setIsLoadingId] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [rustDeskInstalled, setRustDeskInstalled] = useState<boolean | null>(null);
    const [copied, setCopied] = useState(false);
    const [registeredKey, setRegisteredKey] = useState('');
    const [registrationError, setRegistrationError] = useState('');

    const fetchLocalId = async () => {
        setIsLoadingId(true);
        try {
            const result = await getLocalId();
            if (result.success && result.id) {
                setLocalIdState(result.id);
            } else if (result.error) {
                setRegistrationError(result.error);
            }
        } catch (error: any) {
            setRegistrationError(error.message || t('desktop.idLoadFailed'));
        } finally {
            setIsLoadingId(false);
        }
    };

    useEffect(() => {
        if (!inElectron) return;

        void isRustDeskInstalled().then((result) => setRustDeskInstalled(result.installed));
        void fetchLocalId();
    }, [inElectron]);

    const registerDevice = async (email: string, rustdeskId: string, showToast = true) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanId = rustdeskId.trim().replace(/\s+/g, '');
        if (!cleanEmail || !cleanId) return false;

        setIsRegistering(true);
        setRegistrationError('');
        try {
            const result = await registerDesktopDevice({ email: cleanEmail, rustdeskId: cleanId });
            if (result.success) {
                setRegisteredKey(`${cleanEmail}:${cleanId}`);
                if (showToast) message.success(t('desktop.registrationSaved'));
                return true;
            }

            const error = result.error || t('desktop.registrationFailed');
            setRegistrationError(error);
            if (showToast) message.error(error);
            return false;
        } catch (error: any) {
            const errorMessage = error.message || t('desktop.registrationFailed');
            setRegistrationError(errorMessage);
            if (showToast) message.error(errorMessage);
            return false;
        } finally {
            setIsRegistering(false);
        }
    };

    useEffect(() => {
        const activeEmail = userEmail.trim().toLowerCase();
        if (!inElectron || !localId || !activeEmail) return;
        if (!activeEmail) return;

        const key = `${activeEmail}:${localId}`;
        if (registeredKey === key) return;

        void registerDevice(activeEmail, localId, false);
    }, [inElectron, localId, registeredKey, userEmail]);

    const handleCopyId = async () => {
        if (!localId) return;
        await navigator.clipboard.writeText(localId);
        setCopied(true);
        message.success(t('desktop.idCopied'));
        window.setTimeout(() => setCopied(false), 2000);
    };

    const statusColor = rustDeskInstalled === false ? 'red' : localId ? 'green' : 'gold';
    const statusText = rustDeskInstalled === false
        ? t('desktop.statusMissing')
        : localId
            ? t('desktop.statusReady')
            : t('desktop.statusNeedsId');

    if (!inElectron) {
        return (
            <div className="desktop-app-profile" style={{ maxWidth: 980 }}>
                <Card bordered={false} style={{ marginBottom: 16 }}>
                    <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
                        <div>
                            <Tag color="blue" bordered={false}>{t('desktop.remoteSupport')}</Tag>
                            <Title level={3} style={{ marginTop: 10, marginBottom: 6 }}>
                                {t('desktop.profileTitle')}
                            </Title>
                            <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 620 }}>
                                {t('desktop.profileDescription')}
                            </Paragraph>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<DownloadOutlined />}
                            href="/api/v1/desktop/download"
                            target="_blank"
                        >
                            {t('desktop.downloadApp')}
                        </Button>
                    </Flex>
                </Card>

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Card>
                            <Statistic title={t('desktop.platform')} value="Windows 10/11" prefix={<DesktopOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card>
                            <Statistic title={t('desktop.remoteEngine')} value="RustDesk" prefix={<ToolOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card>
                            <Statistic title={t('desktop.registration')} value={t('desktop.automatic')} prefix={<SafetyCertificateOutlined />} />
                        </Card>
                    </Col>
                </Row>

                <Card title={t('desktop.setupTitle')} style={{ marginTop: 16 }}>
                    <Row gutter={[16, 16]}>
                        {['downloadInstall', 'signInDesktop', 'shareMachineId'].map((key, index) => (
                            <Col xs={24} md={8} key={key}>
                                <Flex gap={12} align="flex-start">
                                    <Tag color="blue">{index + 1}</Tag>
                                    <div>
                                        <Text strong>{t(`desktop.${key}Title`)}</Text>
                                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                            {t(`desktop.${key}Description`)}
                                        </Paragraph>
                                    </div>
                                </Flex>
                            </Col>
                        ))}
                    </Row>
                </Card>
            </div>
        );
    }

    return (
        <div className="desktop-app-profile" style={{ maxWidth: 980 }}>
            <Card bordered={false} style={{ marginBottom: 16 }}>
                <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
                    <div>
                        <Tag color={statusColor} bordered={false}>{statusText}</Tag>
                        <Title level={3} style={{ marginTop: 10, marginBottom: 6 }}>
                            {t('desktop.profileTitle')}
                        </Title>
                        <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 660 }}>
                            {t('desktop.electronDescription')}
                        </Paragraph>
                    </div>
                    <Space wrap>
                        <Button icon={<ReloadOutlined />} onClick={fetchLocalId} loading={isLoadingId}>
                            {t('desktop.refreshId')}
                        </Button>
                        <Button icon={<DesktopOutlined />} onClick={() => void openRustDesk()}>
                            {t('desktop.openRustDesk')}
                        </Button>
                    </Space>
                </Flex>
            </Card>

            {rustDeskInstalled === false && (
                <Alert
                    type="warning"
                    showIcon
                    message={t('desktop.rustdeskMissing')}
                    description={t('desktop.rustdeskMissingDesc')}
                    style={{ marginBottom: 16 }}
                />
            )}

            {registrationError && (
                <Alert
                    type="error"
                    showIcon
                    message={t('desktop.registrationAttention')}
                    description={registrationError}
                    style={{ marginBottom: 16 }}
                />
            )}

            <Card
                title={
                    <Flex align="center" gap={8}>
                        <DesktopOutlined />
                        {t('desktop.currentIdTitle')}
                    </Flex>
                }
            >
                {isLoadingId ? (
                    <Flex align="center" gap={8}>
                        <LoadingOutlined />
                        <Text type="secondary">{t('desktop.loadingId')}</Text>
                    </Flex>
                ) : localId ? (
                    <Space direction="vertical" size={14} style={{ width: '100%' }}>
                        <Input
                            value={localId}
                            readOnly
                            size="large"
                            addonBefore={t('desktop.rustdeskId')}
                            style={{ fontFamily: 'monospace', letterSpacing: 2 }}
                            suffix={
                                <Button
                                    type="text"
                                    icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
                                    onClick={handleCopyId}
                                    aria-label={t('common.copy', { defaultValue: 'Copy' })}
                                />
                            }
                        />
                        <Flex gap={8} wrap="wrap">
                            <Tag color="green" icon={<CheckCircleOutlined />}>
                                {t('desktop.visibleToSupport')}
                            </Tag>
                            {isRegistering && <Tag icon={<LoadingOutlined />}>{t('desktop.syncing')}</Tag>}
                        </Flex>
                    </Space>
                ) : (
                    <Flex align="center" justify="space-between" gap={12} wrap="wrap">
                        <Text type="secondary">{t('desktop.noIdFound')}</Text>
                        <Button icon={<ReloadOutlined />} onClick={fetchLocalId}>
                            {t('common.retry', { defaultValue: 'Retry' })}
                        </Button>
                    </Flex>
                )}
            </Card>

            <Divider />
            <Alert
                type="info"
                showIcon
                message={t('desktop.securityTitle')}
                description={t('desktop.securityDescription')}
            />
        </div>
    );
};

export default DesktopApp;
