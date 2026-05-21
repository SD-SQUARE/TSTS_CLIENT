/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Flex, Input, Space, Tag, Typography, message } from 'antd';
import {
    CheckCircleOutlined,
    CopyOutlined,
    DesktopOutlined,
    LinkOutlined,
    LoadingOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { isElectron, useElectron } from '../../../../hooks/useElectron';

const { Paragraph, Text, Title } = Typography;

interface Props {
    ticket?: any;
}

const cleanRemoteId = (value: string) => value.trim().replace(/\s+/g, '');

const RemoteControlTab: React.FC<Props> = ({ ticket }) => {
    const { t } = useTranslation();
    const {
        connectToRemote,
        connectViaProtocol,
        isRustDeskInstalled,
        openRustDesk,
    } = useElectron();
    const inElectron = isElectron();
    const profileRemoteId = ticket?.requester?.rustdeskId || '';
    const requesterName = ticket?.requester?.name || ticket?.requester?.full_name_en || ticket?.requester?.email || '';

    const [remoteId, setRemoteId] = useState(profileRemoteId);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [rustDeskInstalled, setRustDeskInstalled] = useState<boolean | null>(null);

    const cleanId = useMemo(() => cleanRemoteId(remoteId), [remoteId]);
    const idFromProfile = Boolean(profileRemoteId);

    useEffect(() => {
        if (profileRemoteId) setRemoteId(profileRemoteId);
    }, [profileRemoteId]);

    useEffect(() => {
        if (!inElectron) return;
        void isRustDeskInstalled().then((result) => setRustDeskInstalled(result.installed));
    }, [inElectron, isRustDeskInstalled]);

    const handleCopyRemoteId = async () => {
        if (!cleanId) return;
        await navigator.clipboard.writeText(cleanId);
        message.success(t('desktop.idCopied'));
    };

    const handleConnect = async () => {
        if (!cleanId) return;

        setIsConnecting(true);
        setConnectionStatus('idle');
        setErrorMsg('');

        try {
            const result = inElectron
                ? await connectToRemote(cleanId)
                : await connectViaProtocol(cleanId);

            if (result.success) {
                setConnectionStatus('success');
                window.setTimeout(() => setConnectionStatus('idle'), 3500);
            } else {
                setConnectionStatus('error');
                setErrorMsg(result.error || t('desktop.remoteOpenFailed', { defaultValue: 'Could not open RustDesk.' }));
            }
        } catch (error: any) {
            setConnectionStatus('error');
            setErrorMsg(error.message || t('desktop.remoteOpenFailed', { defaultValue: 'Could not open RustDesk.' }));
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div style={{ maxWidth: 780, padding: 24 }}>
            <Card bordered={false} style={{ marginBottom: 16 }}>
                <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
                    <div>
                        <Tag color={inElectron ? 'blue' : 'purple'} bordered={false}>
                            {inElectron
                                ? t('desktop.nativeMode', { defaultValue: 'Desktop mode' })
                                : t('desktop.browserMode', { defaultValue: 'Browser mode' })}
                        </Tag>
                        <Title level={3} style={{ marginTop: 10, marginBottom: 6 }}>
                            {t('desktop.remoteControlTitle', { defaultValue: 'Remote control' })}
                        </Title>
                        <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 560 }}>
                            {inElectron
                                ? t('desktop.remoteControlDesktopDesc', { defaultValue: 'Start a RustDesk support session using the desktop integration.' })
                                : t('desktop.remoteControlBrowserDesc', { defaultValue: 'This opens RustDesk directly through its browser protocol if RustDesk is installed on this machine.' })}
                        </Paragraph>
                    </div>
                    <Space wrap>
                        {inElectron && (
                            <Button icon={<DesktopOutlined />} onClick={() => void openRustDesk()}>
                                {t('desktop.openRustDesk')}
                            </Button>
                        )}
                        <Button
                            type="primary"
                            icon={isConnecting ? <LoadingOutlined /> : <DesktopOutlined />}
                            onClick={handleConnect}
                            loading={isConnecting}
                            disabled={!cleanId || (inElectron && rustDeskInstalled === false)}
                        >
                            {t('desktop.connectWithRustDesk', { defaultValue: 'Connect with RustDesk' })}
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

            {connectionStatus === 'error' && (
                <Alert type="error" showIcon message={errorMsg} style={{ marginBottom: 16 }} />
            )}

            {connectionStatus === 'success' && (
                <Alert
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    message={t('desktop.openingRustDesk', { defaultValue: 'Opening RustDesk...' })}
                    style={{ marginBottom: 16 }}
                />
            )}

            <Card>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <div>
                        <Text strong>{t('desktop.requesterMachineId', { defaultValue: 'Requester machine ID' })}</Text>
                        {requesterName && (
                            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                                {requesterName}
                            </Text>
                        )}
                    </div>

                    <Input
                        size="large"
                        placeholder={t('desktop.remoteIdPlaceholder', { defaultValue: 'RustDesk ID' })}
                        value={remoteId}
                        onChange={(event) => setRemoteId(event.target.value)}
                        onPressEnter={handleConnect}
                        readOnly={idFromProfile}
                        prefix={<LinkOutlined style={{ color: '#8c8c8c' }} />}
                        suffix={
                            cleanId ? (
                                <Button
                                    type="text"
                                    icon={<CopyOutlined />}
                                    onClick={handleCopyRemoteId}
                                    aria-label={t('common.copy', { defaultValue: 'Copy' })}
                                />
                            ) : null
                        }
                        style={{ fontFamily: 'monospace', letterSpacing: 2 }}
                    />

                    <Flex gap={8} wrap="wrap">
                        {idFromProfile ? (
                            <Tag color="green" icon={<CheckCircleOutlined />}>
                                {t('desktop.idRegisteredOnProfile', { defaultValue: 'Registered on requester profile' })}
                            </Tag>
                        ) : (
                            <Tag color="gold">
                                {t('desktop.manualRemoteId', { defaultValue: 'Manual ID entry' })}
                            </Tag>
                        )}
                        <Tag icon={<SafetyCertificateOutlined />}>
                            {t('desktop.permissionReminder', { defaultValue: 'Confirm requester permission before connecting' })}
                        </Tag>
                    </Flex>
                </Space>
            </Card>
        </div>
    );
};

export default RemoteControlTab;
