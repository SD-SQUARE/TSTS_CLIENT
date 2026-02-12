/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Descriptions, Tag, Typography,  Space, Card, Button, Flex } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface TicketInfoTabProps {
    ticket: any;
    onEdit: () => void;
}

const TicketInfoTab: React.FC<TicketInfoTabProps> = ({ ticket, onEdit }) => {
    const { t } = useTranslation();

    return (
        <Card bordered={false} style={{ background: 'transparent', boxShadow: 'none', paddingBottom: '24px' }} styles={{ body: { padding: 0 } }}>
            <Descriptions
                bordered
                column={2}
                labelStyle={{ width: '200px', fontWeight: 'bold' }}
            >
                <Descriptions.Item label={t('tickets.specialization')}>
                    {ticket?.specialization ? (
                        <Tag color="purple" variant="outlined">{ticket.specialization.name}</Tag>
                    ) : (
                        <Tag color="red" variant="outlined">{t('tickets.noSpecialization')}</Tag>
                    )}
                </Descriptions.Item>

                <Descriptions.Item label={t('tickets.problemType')} span={2}>
                    {ticket?.problem ? (
                        <Tag color="blue" variant="outlined">{ticket.problem.name}</Tag>
                    ) : (
                        <Tag color="red" variant="outlined">{t('tickets.noType')}</Tag>
                    )}
                </Descriptions.Item>

                <Descriptions.Item label={t('tickets.priority')}>
                    <Tag variant='outlined' color={ticket?.priority === 'important/urgent' ? 'volcano' : ticket?.priority === 'important' ? 'orange' : ticket?.priority === 'urgent' ? 'red' : 'geekblue'}>
                        {ticket?.priority}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label={t('tickets.status')}>
                    <Tag variant='outlined' color={ticket?.status === 'open' ? 'green' : ticket?.status === 'in-progress' ? 'blue' : ticket?.status === 'closed' ? 'red' : ticket?.status === 'pending' ? 'orange' : ticket?.status === 'out-of-service' ? 'volcano' : 'geekblue'}>
                        {ticket?.status}
                    </Tag>
                </Descriptions.Item>

                { }
                <Descriptions.Item label={t('tickets.assignee')} span={2}>
                    <Space wrap>
                        {ticket?.assignee?.length > 0 ? ticket.assignee.map((a: any) => (
                            <Tag key={a.id} color="cyan">{a.name || `${a.first_name} ${a.last_name}`}</Tag>
                        )) : t('tickets.unassigned')}
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label={t('tickets.title')} span={2}>
                    <Typography.Text strong>{ticket?.title}</Typography.Text>
                </Descriptions.Item>

                <Descriptions.Item label={t('tickets.description')} span={2}>
                    <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                        {ticket?.description}
                    </Typography.Paragraph>
                </Descriptions.Item>

                
            </Descriptions>

            <Flex justify="flex-end" style={{ marginTop: 24 }}>
                <Button type="primary" icon={<EditOutlined />} onClick={onEdit} size="large">
                    {t('common.edit')}
                </Button>
            </Flex>
        </Card>
    );
};

export default TicketInfoTab;