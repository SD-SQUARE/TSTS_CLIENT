/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Divider, Flex, Input, Space, Steps, Tag, Typography, message } from 'antd';
import {
    DesktopOutlined,
    DownloadOutlined,
    CopyOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useElectron, isElectron } from '../../../hooks/useElectron';

const { Title, Text, Paragraph } = Typography;

const DesktopApp: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');
    const { getLocalId, setLocalId, isRustDeskInstalled, openRustDesk } = useElectron();
    const inElectron = isElectron();

    const [localId, setLocalIdState] = useState<string>('');
    const [customId, setCustomId] = useState('');
    const [isLoadingId, setIsLoadingId] = useState(false);
    const [isSavingId, setIsSavingId] = useState(false);
    const [rustDeskInstalled, setRustDeskInstalled] = useState<boolean | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchLocalId = async () => {
        setIsLoadingId(true);
        try {
            const result = await getLocalId();
            if (result.success && result.id) {
                setLocalIdState(result.id);
                setCustomId(result.id);
            }
        } catch { /* ignore */ }
        finally { setIsLoadingId(false); }
    };

    useEffect(() => {
        if (inElectron) {
            isRustDeskInstalled().then(r => setRustDeskInstalled(r.installed));
            fetchLocalId();
        }
    }, [inElectron]);

    const handleCopyId = () => {
        navigator.clipboard.writeText(localId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveId = async () => {
        const clean = customId.trim().replace(/\s+/g, '');
        if (!clean) return;
        setIsSavingId(true);
        try {
            const result = await setLocalId(clean);
            if (result.success) {
                message.success(isArabic ? 'تم تحديث المعرّف بنجاح' : 'ID updated successfully');
                await fetchLocalId();
            } else {
                message.error(result.error || (isArabic ? 'فشل التحديث' : 'Update failed'));
            }
        } catch (err: any) {
            message.error(err.message);
        } finally {
            setIsSavingId(false);
        }
    };

    // ── Not in Electron: show download page ──────────────────────────────────
    if (!inElectron) {
        return (
            <div style={{ maxWidth: 600 }}>
                <Title level={4}>
                    <DesktopOutlined style={{ marginInlineEnd: 8, color: '#1677ff' }} />
                    {isArabic ? 'تطبيق سطح المكتب' : 'Desktop App'}
                </Title>
                <Paragraph type="secondary">
                    {isArabic
                        ? 'قم بتحميل تطبيق TSTS Desktop للاستفادة من ميزة التحكم عن بُعد.'
                        : 'Download TSTS Desktop to enable remote control support.'}
                </Paragraph>

                <Card style={{ marginBottom: 20 }}>
                    <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
                        <div>
                            <Text strong style={{ fontSize: 16 }}>TSTS Desktop</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>Windows 10/11 • 64-bit</Text>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<DownloadOutlined />}
                            href="/api/v1/desktop/download"
                            target="_blank"
                        >
                            {isArabic ? 'تحميل' : 'Download'}
                        </Button>
                    </Flex>
                </Card>

                <Card title={isArabic ? 'خطوات الإعداد' : 'Setup Steps'}>
                    <Steps
                        direction="vertical"
                        size="small"
                        items={[
                            {
                                title: isArabic ? 'تحميل وتثبيت التطبيق' : 'Download & install the app',
                                description: isArabic
                                    ? 'قم بتحميل TSTS Desktop وتثبيته على جهازك'
                                    : 'Download and install TSTS Desktop on your machine',
                                status: 'process',
                                icon: <DownloadOutlined />,
                            },
                            {
                                title: isArabic ? 'تسجيل معرّف جهازك' : 'Register your machine ID',
                                description: isArabic
                                    ? 'افتح التطبيق وانتقل إلى الإعدادات → تطبيق سطح المكتب لرؤية معرّفك'
                                    : 'Open the app and go to Settings → Desktop App to see your ID',
                                status: 'wait',
                            },
                            {
                                title: isArabic ? 'مشاركة المعرّف مع الدعم التقني' : 'Share ID with support',
                                description: isArabic
                                    ? 'أعطِ معرّف جهازك للفني عند طلب المساعدة عن بُعد'
                                    : 'Give your machine ID to the technician when requesting remote help',
                                status: 'wait',
                            },
                        ]}
                    />
                </Card>
            </div>
        );
    }

    // ── In Electron: show ID management ──────────────────────────────────────
    return (
        <div style={{ maxWidth: 560 }}>
            <Title level={4}>
                <DesktopOutlined style={{ marginInlineEnd: 8, color: '#1677ff' }} />
                {isArabic ? 'تطبيق سطح المكتب' : 'Desktop App'}
            </Title>
            <Paragraph type="secondary">
                {isArabic
                    ? 'شارك معرّف جهازك مع الفني للسماح له بالاتصال عن بُعد.'
                    : 'Share your machine ID with the technician to allow remote connection.'}
            </Paragraph>

            {rustDeskInstalled === false && (
                <Alert
                    type="warning"
                    showIcon
                    message={isArabic ? 'RustDesk غير مثبت' : 'RustDesk not installed'}
                    description={isArabic
                        ? 'يبدو أن RustDesk غير مثبت. يرجى إعادة تثبيت TSTS Desktop.'
                        : 'RustDesk does not appear to be installed. Please reinstall TSTS Desktop.'}
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* Current ID */}
            <Card title={isArabic ? 'معرّف جهازك الحالي' : 'Your Current Machine ID'} style={{ marginBottom: 16 }}>
                {isLoadingId ? (
                    <Flex align="center" gap={8}>
                        <LoadingOutlined />
                        <Text type="secondary">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</Text>
                    </Flex>
                ) : localId ? (
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        <Flex align="center" gap={8}>
                            <Input
                                value={localId}
                                readOnly
                                size="large"
                                style={{ fontFamily: 'monospace', letterSpacing: 3, fontSize: 18, fontWeight: 600 }}
                            />
                            <Button
                                icon={copied ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                                onClick={handleCopyId}
                                size="large"
                            >
                                {copied ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ' : 'Copy')}
                            </Button>
                        </Flex>
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                            {isArabic ? 'RustDesk يعمل' : 'RustDesk is running'}
                        </Tag>
                    </Space>
                ) : (
                    <Flex align="center" gap={8}>
                        <Text type="secondary">{isArabic ? 'لم يتم العثور على معرّف' : 'No ID found'}</Text>
                        <Button icon={<ReloadOutlined />} size="small" onClick={fetchLocalId}>
                            {isArabic ? 'إعادة المحاولة' : 'Retry'}
                        </Button>
                    </Flex>
                )}
            </Card>

            {/* Custom ID */}
            <Card title={isArabic ? 'تخصيص المعرّف (اختياري)' : 'Customize ID (Optional)'}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        {isArabic
                            ? 'يمكنك تعيين معرّف مخصص لجهازك بدلاً من المعرّف التلقائي. يتطلب صلاحيات المسؤول.'
                            : 'You can set a custom ID for your machine instead of the auto-generated one. Requires admin privileges.'}
                    </Text>
                    <Input
                        placeholder={isArabic ? 'أدخل المعرّف المخصص' : 'Enter custom ID'}
                        value={customId}
                        onChange={e => setCustomId(e.target.value)}
                        size="large"
                        style={{ fontFamily: 'monospace' }}
                    />
                    <Button
                        type="primary"
                        onClick={handleSaveId}
                        loading={isSavingId}
                        disabled={!customId.trim() || customId.trim() === localId}
                    >
                        {isArabic ? 'حفظ المعرّف' : 'Save ID'}
                    </Button>
                </Space>
            </Card>

            <Divider />

            <Button icon={<DesktopOutlined />} onClick={() => openRustDesk()}>
                {isArabic ? 'فتح RustDesk' : 'Open RustDesk'}
            </Button>
        </div>
    );
};

export default DesktopApp;
