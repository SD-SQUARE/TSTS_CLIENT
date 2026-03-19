/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tag, Typography, Card, Button, Flex, message, Splitter, Select, Dropdown, Space, Popconfirm, Spin } from 'antd';
import { CheckCircleOutlined, EditOutlined, ToolOutlined, ReloadOutlined, CloseCircleOutlined, MessageOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useChangeTicketStatus } from '../../Hooks/useTicket';
import TicketComments from './TicketComments';
import InlineReview from '../InlineReview';
import AssigneeList from '../AssigneesList';
import DOMPurify from "dompurify";
import { useTicketMutations, useTicketProblems } from '../../Hooks/useTicketForm';

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

    const { updateMutation, coordinateMutation } = useTicketMutations(ticket?.id);
    const { data: groupedData } = useTicketProblems();

    const statusMap: Record<string, string> = {
        [openstate]: "open",
        [reopenstate]: "re_open",
        [closestate]: "closed",
        [in_progress_state]: "in_progress",
        [pending_state]: "pending",
        [out_of_service_state]: "out_of_service",
        [resolved_status]: "resolved"
    };
    const handleStatusChange = async (newStatus: string) => {
        try {
            const res = await statusMutation.mutateAsync(statusMap[newStatus] || "open");

            if (res.is_updated) message.success(t('tickets.statusUpdatedSuccess'));
        } catch (err) {
            message.error(t('errors.connectionError'));
        }
    };


    let actionButton = null;

    const getPriorityColor = (prio: string) => {
        switch (prio) {
            case 'important/urgent': return 'volcano';
            case 'important': return 'orange';
            case 'urgent': return 'red';
            case 'NA': return 'cyan';
            default: return 'blue';
        }
    };

    const handleUpdateField = (fieldName: string, value: any) => {
        const formData = new FormData();
        formData.append('title', ticket.title);
        formData.append('description', ticket.description);

        const problemId = fieldName === 'problem' ? value.id : ticket?.problem?.id;
        const specId = fieldName === 'problem' ? value.specId : ticket?.specialization?.id;
        const priority = fieldName === 'priority' ? value : ticket?.priority;
        const status = fieldName === 'status' ? statusMap[value] : statusMap[ticket?.status];

        if (problemId) formData.append('problem', problemId);
        if (specId) formData.append('specialization', specId);
        formData.append('priority', priority);
        formData.append('status', status);
        formData.append('requester', ticket?.requester?.id);

        coordinateMutation.mutate(formData, {
            onSuccess: () => message.success(t('success.updated')),
            onError: () => message.error(t('errors.updateFailed'))
        });
    };

    const problemMenuItems = groupedData?.specializations?.map((spec: any) => ({
        key: `spec-${spec.id}`,
        label: <span style={{ fontWeight: 'bold' }}>{spec.name}</span>,
        children: spec.problems?.map((prob: any) => ({
            key: prob.id,
            label: (
                <Popconfirm
                    title={t('common.confirmUpdate')}
                    onConfirm={() => handleUpdateField('problem', { id: prob.id, specId: spec.id })}
                    okText={t('translation.yes')}
                    cancelText={t('translation.no')}
                >
                    <div style={{ width: '100%' }}>{prob.name}</div>
                </Popconfirm>
            )
        }))
    })) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'green';
            case 'In Progress': return 'blue';
            case 'Pending': return 'gold';
            case 'Closed': return 'red';
            case 'Resolved': return 'lime';
            default: return 'geekblue';
        }
    };

    // Status Menu
    const statusMenu = {
        items: [
            { key: 'Open', label: t('status.open') },
            { key: 'In Progress', label: t('status.in_progress') },
            { key: 'Pending', label: t('status.pending') },
            { key: 'Closed', label: t('status.closed') },
            { key: 'Resolved', label: t('status.resolved') },
        ].map(item => ({
            ...item,
            label: (
                <Popconfirm
                    title={t('common.confirmUpdate')}
                    onConfirm={() => handleUpdateField('status', item.key)}
                    okText={t('translation.yes')}
                    cancelText={t('translation.no')}
                >
                    <div style={{ width: '100%' }}>{item.label}</div>
                </Popconfirm>
            )
        }))
    };

    // Priority Menu
    const priorityMenu = {
        items: [
            { key: 'important/urgent', label: t('priority.important/urgent') },
            { key: 'important', label: t('priority.important') },
            { key: 'urgent', label: t('priority.urgent') },
            { key: 'NA', label: t('priority.NA') },
        ].map(item => ({
            ...item,
            label: (
                <Popconfirm
                    title={t('common.confirmUpdate')}
                    onConfirm={() => handleUpdateField('priority', item.key)}
                    okText={t('translation.yes')}
                    cancelText={t('translation.no')}
                >
                    <div style={{ width: '100%' }}>{item.label}</div>
                </Popconfirm>
            )
        }))
    };

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
            if (ticket?.status === openstate || ticket?.status === reopenstate) {
                actionButton = (
                    <Button style={btnStyle} styles={{
                        root: {
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-white)"
                        }
                    }} type="primary" ghost size="large" icon={<ToolOutlined />} onClick={() => handleStatusChange(in_progress_state)} loading={statusMutation.isPending}>
                        {t('tickets.startSolving')}
                    </Button>
                );
            } else if (ticket?.status === in_progress_state) {
                actionButton = (
                    <Button style={btnStyle}
                        styles={{
                            root: {
                                backgroundColor: "var(--color-red)",
                                color: "var(--color-white)"
                            }
                        }}
                        danger size="large" icon={<CloseCircleOutlined />} onClick={() => handleStatusChange(closestate)} loading={statusMutation.isPending}>
                        {t('tickets.closeTicket')}
                    </Button>
                );
            } else if (ticket?.status === closestate) {
                actionButton = (
                    <Button style={btnStyle} type="primary" size="large" icon={<CheckCircleOutlined />} onClick={() => handleStatusChange(resolved_status)} loading={statusMutation.isPending} className="resolve-btn-success" ghost>
                        {t('tickets.markAsResolved')}
                    </Button>
                );
            }
        }
    }

    const handleUpdateAssignees = (newIds: string[]) => {
        const formData = new FormData();
        formData.append('title', ticket.title);
        formData.append('description', ticket.description);
        formData.append('problem', ticket?.problem?.id);
        formData.append('specialization', ticket?.specialization?.id);
        formData.append('priority', ticket?.priority);
        formData.append('status', statusMap[ticket?.status]);
        formData.append('requester', ticket?.requester?.id);

        formData.append('assigneeList', JSON.stringify(newIds));

        coordinateMutation.mutate(formData, {
            onSuccess: () => message.success(t('success.updated')),
            onError: () => message.error(t('errors.updateFailed'))
        });
    };


    return (
        <>
            <style>
                {`
                    .resolve-btn-success { border-color: #52c41a !important; color: #52c41a !important; }
                    .resolve-btn-success:hover { border-color: #73d13d !important; color: #73d13d !important; }
                `}
            </style>
            <Splitter style={{ height: 'calc(100vh - 80px)', boxShadow: '0 8px 24px rgba(229, 56, 56, 0.05)' }}>
                <Splitter.Panel defaultSize="80%" min="45%" style={{ overflowY: 'auto', padding: '16px', height: '100%' }}>
                    <Flex vertical gap="large">
                        <Card style={{
                            borderRightWidth: "2px",
                            borderLeftWidth: "2px",
                            borderBottomWidth: "2px",
                            borderTop: '0.3rem solid',
                            borderTopColor: 'var(--color-primary)'
                        }} title={<Typography.Title level={4} style={{ margin: 0 }}>{ticket?.title}</Typography.Title>}>
                            <div
                                className="quill-content"
                                style={{ color: '#595959', fontSize: '14px', wordBreak: 'break-word' }}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ticket?.description || '') }}
                            />
                        </Card>

                        <div >
                            <Typography.Title level={5}><MessageOutlined /> {t('tickets.commentSection')}</Typography.Title>
                            <TicketComments assigneeName={ticket?.assignee?.map((a: any) => a.name).join(', ')} />
                        </div>
                    </Flex>
                </Splitter.Panel>

                <Splitter.Panel defaultSize="30%" min="25%" style={{ overflowY: 'auto', padding: '16px', backgroundColor: '#fafafa', height: '100%' }}>
                    <Flex vertical gap="large">
                        <Card size="small" title={t('tickets.details')}>
                            <Flex vertical gap="middle">
                                <Flex justify="space-between" align="center">
                                    <Typography.Text type="secondary">{t('tickets.status')}</Typography.Text>
                                    <Space size={4}>
                                        <Tag color={getStatusColor(ticket?.status)} style={{ margin: 0 }}>
                                            {ticket?.status}
                                        </Tag>

                                        {!isRequester && (
                                            <Dropdown menu={statusMenu} trigger={['click']} disabled={updateMutation.isPending}>
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    shape="circle"
                                                    icon={updateMutation.isPending ? <Spin size="small" /> : <EditOutlined style={{ fontSize: '12px' }} />}
                                                />
                                            </Dropdown>
                                        )}
                                    </Space>
                                </Flex>

                                <Flex justify="space-between" align="center">
                                    <Typography.Text type="secondary">{t('tickets.priority')}</Typography.Text>

                                    <Space size={4}>

                                        <Tag color={getPriorityColor(ticket?.priority)} style={{ margin: 0 }}>
                                            {ticket?.priority}
                                        </Tag>

                                        {!isRequester && (
                                            <Dropdown menu={priorityMenu} trigger={['click']} disabled={updateMutation.isPending}>
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    shape="circle"
                                                    icon={updateMutation.isPending ? <Spin size="small" /> : <EditOutlined style={{ fontSize: '12px' }} />}
                                                />
                                            </Dropdown>
                                        )}

                                    </Space>
                                </Flex>

                                <Flex justify="space-between" align="center">
                                    <Typography.Text type="secondary">{t('tickets.problemType')}</Typography.Text>
                                    <Space size={4}>
                                        <Tag color="blue" style={{ margin: 0 }}>{ticket?.problem?.name}</Tag>

                                        {!isRequester && (
                                            <Dropdown menu={{ items: problemMenuItems }} trigger={['click']}>
                                                <Button type="text" size="small" shape="circle" icon={<EditOutlined style={{ fontSize: '12px' }} />} />
                                            </Dropdown>
                                        )}
                                    </Space>
                                </Flex>


                                <Flex gap="small" wrap="wrap" style={{ marginTop: 8 }}>
                                    {!isRequester && (
                                        <Button style={btnStyle} styles={{
                                            root: {
                                                borderColor: 'var(--color-secondary)',
                                                color: 'var(--color-secondary)',
                                            }
                                        }} icon={<EditOutlined />} onClick={onEdit} disabled={ticket?.status === resolved_status}>{t('common.edit')}</Button>
                                    )}
                                    {actionButton}
                                </Flex>
                            </Flex>
                        </Card>

                        <AssigneeList assignees={ticket?.assignee || []} requesterId={ticket?.requester?.id} onUpdateAssignees={handleUpdateAssignees} isUpdating={coordinateMutation.isPending} />

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