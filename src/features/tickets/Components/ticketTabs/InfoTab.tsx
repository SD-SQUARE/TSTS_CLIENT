/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { Descriptions, Tag, Typography, Space, Card, Button, Flex, message, Popconfirm } from 'antd';
import { CheckCircleOutlined, EditOutlined, ToolOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useChangeTicketStatus } from '../../Hooks/useTicket';
import PostReviewModal from '../ReviewModal';

interface TicketInfoTabProps {
    ticket: any;
    onEdit: () => void;
}

const TicketInfoTab: React.FC<TicketInfoTabProps> = ({ ticket, onEdit }) => {
    const { t } = useTranslation();
    const { role } = useParams();
    const statusMutation = useChangeTicketStatus(ticket?.id);

    const isRequester = role === 'requester';
    const status = ticket?.status;
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const isReviewRequired = 
    ticket?.specialization?.review_required === true || 
        ticket?.problem?.review_required === true;

    // FIXME: to be closeable but not skipable
    // useEffect(() => {
    //     if (isReviewRequired) {
    //         setIsReviewModalOpen(true);
    //     }
    // }, [isReviewRequired]);

    const handleStatusChange = async (newStatus: string) => {
        
        try {
            const res = await statusMutation.mutateAsync(newStatus);
            if (res.is_updated) {
                message.success(t('tickets.statusUpdatedSuccess'));
            } else {
                message.error(res.message || t('errors.updateFailed'));
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            message.error(t('errors.connectionError'));
        }
    };

    let actionButton = null;

    if (!isRequester) {
        if (status === 'open') {
            actionButton = (
                <Button
                    style={{ flex: 1 }}
                    type="primary"
                    size="large"
                    ghost
                    icon={<ToolOutlined />}
                    onClick={() => handleStatusChange('in_progress')}
                    loading={statusMutation.isPending}

                >
                    {t('tickets.startSolving')}
                </Button>
            );
        } else if (status === 'in_progress') {
            actionButton = (
                <Popconfirm
                    title={t('tickets.resolveConfirmTitle')}
                    onConfirm={() => handleStatusChange('closed')}
                    okText={t('translation.yes')}
                    cancelText={t('translation.no')}
                >
                    <Button
                        style={{ flex: 1 }}
                        type="primary"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        loading={statusMutation.isPending}

                        color="green"
                        variant="outlined"
                    >
                        {t('tickets.markAsResolved')}
                    </Button>
                </Popconfirm>
            );
        }
    } else if (status === 'closed') {
        actionButton = (
            <Button
                style={{ flex: 1 }}
                size="large"
                icon={<ReloadOutlined />}
                onClick={() => handleStatusChange('re_open')}
                loading={statusMutation.isPending}
            >
                {t('tickets.reopenTicket')}
            </Button>
        );
    }
    console.log("isReviewModalOpen", isReviewModalOpen);
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

            <Flex gap="middle" style={{ marginTop: 24 }}>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={onEdit}
                    size="large"
                    style={{ flex: 1 }}
                >
                    {t('common.edit')}
                </Button>
                {actionButton}
            </Flex>
            <PostReviewModal
                ticketId={ticket?.id}
                open={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
            />
        </Card>
    );
};

export default TicketInfoTab;