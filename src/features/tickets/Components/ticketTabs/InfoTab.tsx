/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { Descriptions, Tag, Typography, Space, Card, Button, Flex, message, Popconfirm } from 'antd';
import { CheckCircleOutlined, EditOutlined, ToolOutlined, ReloadOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
    
    const openstate = "Open"
    const reopenstate = "Re Open"
    const closestate = "Closed"
    const in_progress_state = "In Progress"
    const pending_state = "Pending"
    const out_of_service_state = "Out of Service"
    

    const isRequester = role === 'requester';
    let status = ticket?.status;
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const isReviewRequired =
        ticket?.specialization?.review_required === true ||
        ticket?.problem?.review_required === true;

    // FIXME: to be closeable but not skipable
    // useEffect(() => {
    //     if (isReviewRequired) {
    //         // eslint-disable-next-line react-hooks/set-state-in-effect
    //         setIsReviewModalOpen(true);
    //     }
    // }, [isReviewRequired]);

    const handleStatusChange = async (newStatus: string) => {

        

        if (isRequester && (newStatus === closestate || newStatus === pending_state)) {
            if (isReviewRequired) {
                setIsReviewModalOpen(true);
                return;
            }
        }

        switch (newStatus) {
            case openstate:
                newStatus = "open";
                status = "open";
                break;
            case reopenstate:
                newStatus = "re_open";
                status = "re_open";
                break;
            case closestate:
                newStatus = "closed";
                status = "closed";
                break;
            case in_progress_state:
                newStatus = "in_progress";
                status = "in_progress";
                break;
            case pending_state:
                newStatus = "pending";
                status = "pending";
                break;
            case out_of_service_state:
                newStatus = "out_of_service";
                status = "out_of_service";
                break;
            default:
                newStatus = "open";
                status = "open";
        }
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

    if (isRequester) {
        if (status === closestate) {
            actionButton = (
                <Button
                    style={{ flex: 1 }}
                    size="large"
                    icon={<ReloadOutlined />}
                    onClick={() => handleStatusChange(reopenstate)}
                    loading={statusMutation.isPending}
                >
                    {t('tickets.reopenTicket')}
                </Button>
            );
        } else if (status === in_progress_state || status === pending_state || status === closestate) {
            actionButton = (
                <Popconfirm
                    title={t('tickets.closeConfirmTitle')}
                    onConfirm={() => handleStatusChange(closestate)}
                    okText={t('translation.yes')}
                    cancelText={t('translation.no')}
                >

                    <Button
                        type="primary"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        // onClick={() => handleStatusChange(closestate)}
                        loading={statusMutation.isPending}
                        style={{ borderColor: '#52c41a', color: '#52c41a', flex: 1 }}
                        variant='outlined'
                        ghost
                    >
                        {t('tickets.markAsResolved')}
                    </Button>
                </Popconfirm>
            );
        }
    } else {
        if (status === openstate || status === reopenstate) {
            actionButton = (
                <Button
                    style={{ flex: 1 }}
                    type="primary"
                    size="large"
                    ghost
                    icon={<ToolOutlined />}
                    onClick={() => handleStatusChange(in_progress_state)}
                    loading={statusMutation.isPending}
                >
                    {t('tickets.startSolving')}
                </Button>
            );
        } else if (status === in_progress_state) {
            actionButton = (
                <Popconfirm
                    title={t('tickets.closeConfirmTitle')}
                    onConfirm={() => handleStatusChange(closestate)}
                    okText={t('translation.yes')}
                    cancelText={t('translation.no')}
                >
                    <Button
                        style={{ flex: 1 }}
                        danger
                        size="large"
                        icon={<CloseCircleOutlined />}
                        loading={statusMutation.isPending}
                    >
                        {t('tickets.closeTicket')}
                    </Button>
                </Popconfirm>
            );
        }
    }
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
                    <Tag variant='outlined'
                        color={
                            ticket?.status === openstate || ticket?.status === reopenstate ? 'green' : ticket?.status === in_progress_state ? 'blue' : ticket?.status === closestate ? 'red' : ticket?.status === pending_state ? 'orange' : ticket?.status === out_of_service_state ? 'volcano' : 'geekblue'}>
                        {/* color={ticket?.status === openstate ? 'green' : ticket?.status === 'in-progress' ? 'blue' : ticket?.status === closestate ? 'red' : ticket?.status === pending_state ? 'orange' : ticket?.status === 'out-of-service' ? 'volcano' : 'geekblue'}> */}
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