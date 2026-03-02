/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface AuditLogStepsTableProps {
    steps: any[];
    metadata: any;
}

const AuditLogStepsTable: React.FC<AuditLogStepsTableProps> = ({ steps, metadata }) => {
    const { t } = useTranslation();

    const stepColumns = [
        { title: t('audit.summary'), dataIndex: 'action', key: 'action' },
        {
            title: t('audit.createdAt'), dataIndex: 'time', key: 'time',
            render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
        },
        {
            title: t('audit.metadata'),
            key: 'meta',
            children: [
                {
                    title: t('common.old'),
                    key: 'oldValue',
                    render: () => <Tag color="orange">{metadata?.oldValue || '-'}</Tag>
                },
                {
                    title: t('common.new'),
                    key: 'newValue',
                    render: () => <Tag color="green">{metadata?.newValue || '-'}</Tag>
                }
            ]
        }
    ];

    return (
        <Card title={t('audit.steps')}>
            <Table
                size='small'
                dataSource={steps || []}
                columns={stepColumns}
                pagination={false}
                rowKey="time"
            />
        </Card>
    );
};

export default AuditLogStepsTable;