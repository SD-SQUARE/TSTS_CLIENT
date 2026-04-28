import React from 'react';
import { Card, Descriptions, Flex, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { CalendarOutlined, ClockCircleOutlined, RightOutlined } from '@ant-design/icons';
import i18next from 'i18next';
import LocalizedDateText from '../../../../components/LocalizedDateText';

interface AuditLogDetailsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
}

const formatHistoryValue = (value: unknown): string | undefined => {
    if (value === null || value === undefined || value === '') return undefined;
    return String(value);
};

const extractStatusPair = (value: any) => {
    if (!value || typeof value !== 'object') {
        return { oldValue: undefined, newValue: undefined };
    }

    return {
        oldValue: formatHistoryValue(value.oldStatus ?? value.oldValue),
        newValue: formatHistoryValue(value.newStatus ?? value.newValue),
    };
};

const getMetadataChangeValues = (meta: any) => {
    if (!meta || typeof meta !== 'object') {
        return { oldValue: undefined, newValue: undefined };
    }

    const directMetaPair = {
        oldValue: formatHistoryValue(meta.oldStatus ?? meta.oldValue),
        newValue: formatHistoryValue(meta.newStatus ?? meta.newValue),
    };
    if (directMetaPair.oldValue || directMetaPair.newValue) {
        return directMetaPair;
    }

    const directStatusChangePair = extractStatusPair(meta?.statusChange);
    if (directStatusChangePair.oldValue || directStatusChangePair.newValue) {
        return directStatusChangePair;
    }

    const nestedContainers = [meta?.change, meta?.changes, meta?.statusChange];
    for (const container of nestedContainers) {
        if (!container || typeof container !== 'object') continue;

        for (const entry of Object.values(container)) {
            const { oldValue, newValue } = extractStatusPair(entry);
            if (oldValue || newValue) {
                return { oldValue, newValue };
            }
        }
    }

    return { oldValue: undefined, newValue: undefined };
};

const AuditLogDetails: React.FC<AuditLogDetailsProps> = ({ data }) => {
    const { t } = useTranslation();
    const { oldValue, newValue } = getMetadataChangeValues(data?.metadata);
    const actorName = [
        data?.actor?.full_name?.first?.[i18next.language] ?? data?.actor?.full_name?.first?.en ?? data?.actor?.full_name?.first,
        data?.actor?.full_name?.mid?.[i18next.language] ?? data?.actor?.full_name?.mid?.en ?? data?.actor?.full_name?.mid,
        data?.actor?.full_name?.last?.[i18next.language] ?? data?.actor?.full_name?.last?.en ?? data?.actor?.full_name?.last,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Card title={t('audit.details')}>
            <Descriptions bordered column={2}>
                <Descriptions.Item label={t('audit.username')}>{actorName || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('audit.ip')}>{data?.actor?.ipAddress}</Descriptions.Item>
                <Descriptions.Item label={t('audit.role')}>
                    <Tag color="blue">{data?.actor?.type}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('audit.userAgent')}>{data?.actor?.userAgent}</Descriptions.Item>
                <Descriptions.Item label={t('audit.action')}>{data?.action}</Descriptions.Item>
                <Descriptions.Item label={t('audit.resourceType')}>{data?.resource?.type}</Descriptions.Item>
                <Descriptions.Item label={t('audit.status')}>
                    <Tag color={data?.status === 'SUCCESS' ? 'green' : 'red'}>{data?.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('audit.createdAt')}>
                    <Flex align="center" gap="small">
                        <Typography.Text type="secondary">
                            <LocalizedDateText value={data?.createdAt} language={i18next.language} mode="time" />
                        </Typography.Text>
                        <ClockCircleOutlined style={{ color: '#bfbfbf', fontSize: '12px' }} />

                        <Typography.Text type="secondary">
                            <LocalizedDateText value={data?.createdAt} language={i18next.language} mode="date" />
                        </Typography.Text>
                        <CalendarOutlined style={{ color: '#bfbfbf', fontSize: '12px' }} />
                    </Flex>
                </Descriptions.Item>

                <Descriptions.Item label={t('audit.metadata')} span={2}>
                    <Flex gap="small" style={{ width: '100%' }}>
                        <Card size="small" style={{ flex: 1, backgroundColor: '#fff2f0', border: '1px solid #ffccc7' }}>
                            <Typography.Text type="secondary" style={{ fontSize: '10px', display: 'block', textTransform: 'uppercase' }}>
                                {t('common.old')}
                            </Typography.Text>
                            <Typography.Text strong>{oldValue || '-'}</Typography.Text>
                        </Card>

                        <Flex align="center" style={{ padding: '0 8px' }}>
                            <RightOutlined style={{ color: '#bfbfbf' }} />
                        </Flex>

                        <Card size="small" style={{ flex: 1, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                            <Typography.Text type="secondary" style={{ fontSize: '10px', display: 'block', textTransform: 'uppercase' }}>
                                {t('common.new')}
                            </Typography.Text>
                            <Typography.Text strong>{newValue || '-'}</Typography.Text>
                        </Card>
                    </Flex>
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

export default AuditLogDetails;
