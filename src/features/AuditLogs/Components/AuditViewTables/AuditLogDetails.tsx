import React from 'react';
import { Card, Descriptions, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface AuditLogDetailsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
}

const AuditLogDetails: React.FC<AuditLogDetailsProps> = ({ data }) => {
    const { t } = useTranslation();

    return (
        <Card title={t('audit.details')}>
            <Descriptions bordered column={2}>
                <Descriptions.Item label={t('audit.username')}>{data?.actor?.full_name}</Descriptions.Item>
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
                    {dayjs(data?.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

export default AuditLogDetails;