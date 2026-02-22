/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tag, Typography, Card, Button, Flex, message, Splitter } from 'antd';
import { CheckCircleOutlined, EditOutlined, ToolOutlined, ReloadOutlined, CloseCircleOutlined, MessageOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useChangeTicketStatus } from '../../Hooks/useTicket';
import TicketChatTab from './ChatTab';
import InlineReview from '../InlineReview';
import AssigneeList from '../AssigneesList';

interface TicketInfoTabProps {
    ticket: any;
    onEdit: () => void;
}

const TicketInfoTab: React.FC<TicketInfoTabProps> = ({ ticket, onEdit }) => {
    const { t } = useTranslation();
    const { role } = useParams();
    const isRequester = role === 'requester';

    const statusMutation = useChangeTicketStatus(ticket?.id);

    const openstate = "Open", reopenstate = "Re Open", closestate = "Closed";
    const in_progress_state = "In Progress", pending_state = "Pending";
    const out_of_service_state = "Out of Service", resolved_status = "Resolved";

    const handleStatusChange = async (newStatus: string) => {
        const statusMap: Record<string, string> = {
            [openstate]: "open",
            [reopenstate]: "re_open",
            [closestate]: "closed",
            [in_progress_state]: "in_progress",
            [pending_state]: "pending",
            [out_of_service_state]: "out_of_service",
            [resolved_status]: "resolved"
        };

        try {
            const res = await statusMutation.mutateAsync(statusMap[newStatus] || "open");
            if (res.is_updated) message.success(t('tickets.statusUpdatedSuccess'));
        } catch (err) {
            message.error(t('errors.connectionError'));
        }
    };

    let actionButton = null;
    const btnStyle: React.CSSProperties = { flex: '1 1 140px', height: '40px' };

    if (ticket?.status !== resolved_status) {
        if (isRequester) {
            if (ticket?.status === closestate) {
                actionButton = (
                    <Button style={btnStyle} size="large" icon={<ReloadOutlined />} onClick={() => handleStatusChange(reopenstate)} loading={statusMutation.isPending}>
                        {t('tickets.reopenTicket')}
                    </Button>
                );
            } else if (ticket?.status === pending_state) {
                actionButton = (
                    <Button style={btnStyle} type="primary" size="large" icon={<CheckCircleOutlined />} onClick={() => handleStatusChange(resolved_status)} loading={statusMutation.isPending} className="resolve-btn-success" ghost>
                        {t('tickets.markAsResolved')}
                    </Button>
                );
            }
        } else {
            if (ticket?.status === openstate) {
                actionButton = (
                    <Button style={btnStyle} type="primary" ghost size="large" icon={<ToolOutlined />} onClick={() => handleStatusChange(in_progress_state)} loading={statusMutation.isPending}>
                        {t('tickets.startSolving')}
                    </Button>
                );
            } else if (ticket?.status === in_progress_state) {
                actionButton = (
                    <Button style={btnStyle} danger size="large" icon={<CloseCircleOutlined />} onClick={() => handleStatusChange(closestate)} loading={statusMutation.isPending}>
                        {t('tickets.closeTicket')}
                    </Button>
                );
            } else if (ticket?.status === reopenstate) {
                actionButton = (
                    <Button style={btnStyle} type="primary" size="large" icon={<CheckCircleOutlined />} onClick={() => handleStatusChange(resolved_status)} loading={statusMutation.isPending} className="resolve-btn-success" ghost>
                        {t('tickets.markAsResolved')}
                    </Button>
                );
            }
        }
    }

    return (
        <>
            <style>
                {`
                    .resolve-btn-success { border-color: #52c41a !important; color: #52c41a !important; }
                    .resolve-btn-success:hover { border-color: #73d13d !important; color: #73d13d !important; }
                `}
            </style>
            <Splitter style={{ height: 'calc(100vh - 200px)', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
                <Splitter.Panel defaultSize="60%" min="30%" style={{ overflowY: 'auto', padding: '16px' }}>
                    <Flex vertical gap="large">
                        <Card style={{ borderTop: '2px solid' }} title={<Typography.Title level={4} style={{ margin: 0 }}>{ticket?.title}</Typography.Title>}>
                            <div
                                className="quill-content"
                                style={{ color: '#595959', fontSize: '14px' }}
                                dangerouslySetInnerHTML={{ __html: ticket?.description || '' }}
                            />
                        </Card>

                        <div style={{ height: '500px' }}>
                            <Typography.Title level={5}><MessageOutlined /> {t('tickets.commentSection')}</Typography.Title>
                            <TicketChatTab assigneeName={ticket?.assignee?.map((a: any) => a.name).join(', ')} />
                        </div>
                    </Flex>
                </Splitter.Panel>

                <Splitter.Panel min="25%" style={{ overflowY: 'auto', padding: '16px', backgroundColor: '#fafafa' }}>
                    <Flex vertical gap="large">
                        <Card size="small" title={t('tickets.details')}>
                            <Flex vertical gap="middle">
                                <Flex justify="space-between">
                                    <Typography.Text type="secondary">{t('tickets.status')}</Typography.Text>
                                    <Tag color="blue">{ticket?.status}</Tag>
                                </Flex>
                                <Flex justify="space-between">
                                    <Typography.Text type="secondary">{t('tickets.priority')}</Typography.Text>
                                    <Tag color="volcano">{ticket?.priority}</Tag>
                                </Flex>
                                <Flex justify="space-between">
                                    <Typography.Text type="secondary">{t('tickets.problemType')}</Typography.Text>
                                    <Typography.Text strong>{ticket?.problem?.name}</Typography.Text>
                                </Flex>


                                <Flex gap="small" wrap="wrap" style={{ marginTop: 8 }}>
                                    {!isRequester && (
                                        <Button style={btnStyle} icon={<EditOutlined />} onClick={onEdit} disabled={ticket?.status === resolved_status}>{t('common.edit')}</Button>
                                    )}
                                    {actionButton}
                                </Flex>
                            </Flex>
                        </Card>

                        <AssigneeList assignees={ticket?.assignee || []} requesterId={ticket?.requester?.id} />

                        {isRequester && (
                            <InlineReview
                                ticketId={ticket.id}
                                btnStyle={btnStyle}
                            />
                        )}
                    </Flex>
                </Splitter.Panel>
            </Splitter>
        </>
    );
};

export default TicketInfoTab;