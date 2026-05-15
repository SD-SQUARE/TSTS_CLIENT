/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Alert, Button, Card, Flex, Input, Space, Spin, Steps, Tag, Typography } from 'antd';
import {
    DesktopOutlined,
    LinkOutlined,
    LoadingOutlined,
    CheckCircleOutlined,
    DownloadOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useElectron, isElectron } from '../../../../hooks/useElectron';

const { Text, Title, Paragraph } = Typography;

interface Props {
    ticket?: any;
}

const RemoteControlTab: React.FC<Props> = ({ ticket }) => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');
    const { connectToRemote, isRustDeskInstalled } = useElectron();
    const inElectron = isElectron();

    const [remoteId, setRemoteId] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [rustDeskInstalled, setRustDeskInstalled] = useState<boolean | null>(null);

    // Pre-fill from ticket requester's rustdesk ID if available
    useEffect(() => {
        if (ticket?.requester?.rustdeskId) {
            setRemoteId(ticket.requester.rustdeskId);
        }
    }, [ticket]);

    useEffect(() => {
        if (inElectron) {
            isRustDeskInstalled().then(r => setRustDeskInstalled(r.installed));
        }
    }, [inElectron]);

    const handleConnect = async () => {
        const cleanId = remoteId.trim().replace(/\s+/g, '');
        if (!cleanId) return;

        setIsConnecting(true);
        setConnectionStatus('connecting');
        setErrorMsg('');

        try {
            const result = await connectToRemote(cleanId);
            if (result.success) {
                setConnectionStatus('success');
                setTimeout(() => setConnectionStatus('idle'), 3000);
            } else {
                setConnectionStatus('error');
                setErrorMsg(result.error || 'Connection failed');
            }
        } catch (err: any) {
            setConnectionStatus('error');
            setErrorMsg(err.message || 'Unknown error');
        } finally {
            setIsConnecting(false);
        }
    };

    // Not in Electron — show download prompt
    if (!inElectron) {
        return (
            <div style={{ padding: 24, maxWidth: 600 }}>
                <Alert
                    type="info"
                    showIcon
                    icon={<DesktopOutlined />}
                    message={isArabic ? 'ميزة التحكم عن بُعد' : 'Remote Control Feature'}
                    description={
                        <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 8 }}>
                            <Text>
                                {isArabic
                                    ? 'للاتصال بجهاز المستخدم عن بُعد، يجب تشغيل تطبيق TSTS Desktop.'
                                    : 'To connect to the requester\'s machine remotely, you need to run the TSTS Desktop app.'}
                            </Text>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                href="/api/v1/desktop/download"
                                target="_blank"
                            >
                                {isArabic ? 'تحميل تطبيق TSTS Desktop' : 'Download TSTS Desktop'}
                            </Button>
                        </Space>
                    }
                />

                <Card style={{ marginTop: 20 }} title={
                    <Flex align="center" gap={8}>
                        <InfoCircleOutlined style={{ color: '#1677ff' }} />
                        {isArabic ? 'كيف يعمل التحكم عن بُعد؟' : 'How does remote control work?'}
                    </Flex>
                }>
                    <Steps
                        direction="vertical"
                        size="small"
                        items={[
                            {
                                title: isArabic ? 'تحميل التطبيق' : 'Download the app',
                                description: isArabic
                                    ? 'قم بتحميل وتثبيت تطبيق TSTS Desktop على جهازك'
                                    : 'Download and install TSTS Desktop on your machine',
                                status: 'process',
                            },
                            {
                                title: isArabic ? 'المستخدم يسجل معرّفه' : 'Requester registers their ID',
                                description: isArabic
                                    ? 'يقوم المستخدم بتحميل التطبيق وتسجيل معرّف جهازه من الإعدادات'
                                    : 'The requester downloads the app and registers their machine ID from Settings',
                                status: 'wait',
                            },
                            {
                                title: isArabic ? 'الاتصال بالجهاز' : 'Connect to the machine',
                                description: isArabic
                                    ? 'أدخل معرّف جهاز المستخدم وانقر اتصال'
                                    : 'Enter the requester\'s machine ID and click Connect',
                                status: 'wait',
                            },
                        ]}
                    />
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, maxWidth: 560 }}>
            <Title level={4} style={{ marginBottom: 4 }}>
                <DesktopOutlined style={{ marginInlineEnd: 8, color: '#1677ff' }} />
                {isArabic ? 'التحكم عن بُعد' : 'Remote Control'}
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 20 }}>
                {isArabic
                    ? 'أدخل معرّف RustDesk الخاص بجهاز المستخدم للاتصال به عن بُعد.'
                    : 'Enter the requester\'s RustDesk ID to connect to their machine remotely.'}
            </Paragraph>

            {rustDeskInstalled === false && (
                <Alert
                    type="warning"
                    showIcon
                    message={isArabic ? 'RustDesk غير مثبت' : 'RustDesk not installed'}
                    description={isArabic
                        ? 'يرجى تثبيت RustDesk أولاً. سيتم تثبيته تلقائياً عند تثبيت تطبيق TSTS Desktop.'
                        : 'Please install RustDesk first. It is automatically installed with TSTS Desktop.'}
                    style={{ marginBottom: 16 }}
                />
            )}

            <Card>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>
                            {isArabic ? 'معرّف جهاز المستخدم (RustDesk ID)' : 'Requester Machine ID (RustDesk ID)'}
                        </Text>
                        <Input
                            size="large"
                            placeholder={isArabic ? 'مثال: 123456789' : 'e.g. 123456789'}
                            value={remoteId}
                            onChange={e => setRemoteId(e.target.value)}
                            onPressEnter={handleConnect}
                            prefix={<LinkOutlined style={{ color: '#bbb' }} />}
                            style={{ fontFamily: 'monospace', letterSpacing: 2 }}
                            disabled={isConnecting}
                        />
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                            {isArabic
                                ? 'يمكن للمستخدم العثور على معرّفه في تطبيق TSTS Desktop → الإعدادات → تطبيق سطح المكتب'
                                : 'The requester can find their ID in TSTS Desktop → Settings → Desktop App'}
                        </Text>
                    </div>

                    {connectionStatus === 'error' && (
                        <Alert type="error" showIcon message={errorMsg || (isArabic ? 'فشل الاتصال' : 'Connection failed')} />
                    )}

                    {connectionStatus === 'success' && (
                        <Alert
                            type="success"
                            showIcon
                            icon={<CheckCircleOutlined />}
                            message={isArabic ? 'جارٍ فتح RustDesk...' : 'Opening RustDesk...'}
                        />
                    )}

                    <Button
                        type="primary"
                        size="large"
                        icon={isConnecting ? <LoadingOutlined /> : <DesktopOutlined />}
                        onClick={handleConnect}
                        disabled={!remoteId.trim() || isConnecting || rustDeskInstalled === false}
                        block
                    >
                        {isConnecting
                            ? (isArabic ? 'جارٍ الاتصال...' : 'Connecting...')
                            : (isArabic ? 'اتصال بالجهاز' : 'Connect to Machine')}
                    </Button>
                </Space>
            </Card>

            <Alert
                type="info"
                showIcon
                style={{ marginTop: 16 }}
                message={isArabic ? 'ملاحظة أمنية' : 'Security Note'}
                description={isArabic
                    ? 'يتم تسجيل جميع جلسات التحكم عن بُعد في سجل التذكرة. تأكد من حصولك على إذن المستخدم قبل الاتصال.'
                    : 'All remote sessions are logged in the ticket history. Ensure you have the requester\'s permission before connecting.'}
            />
        </div>
    );
};

export default RemoteControlTab;
