/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Avatar, Flex, Space, Table, Tag, Typography } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
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
            title: t('tickets.user'),
            dataIndex: 'meta',
            key: 'user',
            width: 150,
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
            title: t('tickets.type'),
            dataIndex: 'type',
            key: 'type',
            width: 120,
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
            width: 170,
            render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
        },
        {
            title: t('tickets.content'),
            dataIndex: 'content',
            key: 'content',
            width: 250,
        },
        {
            title: t('tickets.date'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
            render: (date: string) => (
                <Flex vertical gap={4} dir="ltr" style={{ alignItems: 'flex-start' }}>
                    <Space size={6} style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px' }}>
                        <ClockCircleOutlined />
                        <span dir='ltr'>{dayjs(date).format('h:mm A')}</span>
                    </Space>
                    <Space size={6} style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px' }}>
                        <CalendarOutlined />
                        <span dir='ltr'>{dayjs(date).format('DD-MM-YYYY')}</span>
                    </Space>
                </Flex>
            ),
        },
        {
            title: t('tickets.ipAddress'),
            dataIndex: 'meta',
            key: 'ip',
            width: 100,
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
                    width: 100,
                    align: 'center',
                    render: (meta: any) => meta?.previousStatus ? (
                        <Tag>{t(`status.${meta.previousStatus.toLowerCase().replace(' ', '_')}`, { defaultValue: meta.previousStatus })}</Tag>
                    ) : '-',
                },
                {
                    title: t('common.new'),
                    dataIndex: 'meta',
                    key: 'newStatus',
                    width: 100,
                    align: 'center',
                    render: (meta: any) => meta?.newStatus ? (
                        <Tag color="blue">{t(`status.${meta.newStatus.toLowerCase().replace(' ', '_')}`, { defaultValue: meta.newStatus })}</Tag>
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