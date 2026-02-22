/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Avatar, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import i18n from '../../../../../i18n';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activities: any[];
    getIcon: (type: string, size?: number) => React.ReactNode;
    getColor: (type: string) => string;
}

const TicketHistoryTable: React.FC<Props> = ({ activities, getIcon, getColor }) => {
    const { t } = useTranslation();

    const columns: any[] = [
        {
            title: t('tickets.type'),
            dataIndex: 'type',
            key: 'type',
            width: 150,
            render: (type: string) => (
                <Tag color={getColor(type)} icon={getIcon(type, 12)}>
                    {type.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: t('tickets.title'),
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
        },
        {
            title: t('tickets.content'),
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: t('tickets.date'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 200,
            render: (date: string) => dayjs(date).format('YYYY-MM-DD h:mm A'),
        },
        {
            title: t('tickets.user'),
            dataIndex: 'meta',
            key: 'user',
            render: (meta: any) => {
                if (!meta?.user) return '-';

                const displayName = i18n.language === 'ar'
                    ? meta.user.full_name_ar
                    : meta.user.full_name_en;

                return (
                    <Space>
                        <Avatar size="small" src={meta.user.image} />
                        <Typography.Text>{displayName || '-'}</Typography.Text>
                    </Space>
                );
            },
        },
        {
            title: t('tickets.ipAddress'),
            dataIndex: 'meta',
            key: 'ip',
            width: 130,
            render: (meta: any) => (
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    {meta?.ip || '-'}
                </Typography.Text>
            ),
        },
        {
            title: t('tickets.state'),
            key: 'state_group',
            align: 'center',
            children: [
                {
                    title: t('common.old'),
                    dataIndex: 'meta',
                    key: 'old_state',
                    width: 120,
                    align: 'center',
                    render: (meta: any) => meta?.old ? (
                        <Tag>{t(`status.${meta.old.toLowerCase().replace(' ', '_')}`, { defaultValue: meta.old })}</Tag>
                    ) : '-',
                },
                {
                    title: t('common.new'),
                    dataIndex: 'meta',
                    key: 'new_state',
                    width: 120,
                    align: 'center',
                    render: (meta: any) => meta?.new ? (
                        <Tag color="blue">{t(`status.${meta.new.toLowerCase().replace(' ', '_')}`, { defaultValue: meta.new })}</Tag>
                    ) : '-',
                },
            ],
        },
    ];

    return (
        <Table
            dataSource={activities}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            bordered
            size="small"
        />
    );
};

export default TicketHistoryTable;