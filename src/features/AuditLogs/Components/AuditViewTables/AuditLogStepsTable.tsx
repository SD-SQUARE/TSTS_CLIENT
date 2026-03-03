/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, Flex, Popover, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import EllipsisComponent from '../../../../components/EllipsisComponent';

interface AuditLogStepsTableProps {
    steps: any[];
    metadata: any;
}

const AuditLogStepsTable: React.FC<AuditLogStepsTableProps> = ({ steps }) => {
    const { t } = useTranslation();

    const stepColumns = [
        { title: t('audit.summary'), dataIndex: 'action', key: 'action', width:300, 
        render: (text: string) => (
            <div onClick={(e) => e.stopPropagation()}>

                <Popover
                    title={t('audit.summary')}
                    content={<div style={{ maxWidth: 400, fontFamily: 'monospace' }}>{text}</div>}
                    trigger="hover"
                    placement="topLeft"
                >
                    <EllipsisComponent content={text} />
                </Popover>
            </div>
        ),},
        {
            title: t('audit.createdAt'),
            dataIndex: 'time',
            key: 'time',
            width: 300,
            render: (time: string) => (
                <Flex align="center" gap="middle"> 
                    <Flex align="center" gap="small">
                        <Typography.Text type="secondary">
                            {dayjs(time).format('hh:mm A')}
                        </Typography.Text>
                        <ClockCircleOutlined style={{ color: '#bfbfbf', fontSize: '12px' }} />
                    </Flex>
        
                    <Flex align="center" gap="small">
                        <Typography.Text type="secondary">
                            {dayjs(time).format('DD-MM-YYYY')}
                        </Typography.Text>
                        <CalendarOutlined style={{ color: '#bfbfbf', fontSize: '12px' }} />
                    </Flex>
                </Flex>
            )
        },
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