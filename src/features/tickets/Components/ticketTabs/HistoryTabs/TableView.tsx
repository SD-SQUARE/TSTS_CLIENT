import React from 'react';
import { Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activities: any[];
    getIcon: (type: string, size?: number) => React.ReactNode;
    getColor: (type: string) => string;
}

const TicketHistoryTable: React.FC<Props> = ({ activities, getIcon, getColor }) => {
    const { t } = useTranslation();

    const columns = [
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
    ];

    return (
        <Table
            dataSource={activities}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            bordered
        />
    );
};

export default TicketHistoryTable;