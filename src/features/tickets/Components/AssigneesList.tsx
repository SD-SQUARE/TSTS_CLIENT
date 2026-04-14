/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Collapse, Typography, List, Card, Avatar, Tag, Skeleton, Space, Flex, Popconfirm, Button, TreeSelect, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../Hooks/useTicket';
import { useParams } from 'react-router-dom';
import { fetchAdmins, fetchGroups, fetchGroupUsers } from '../Hooks/useTicketForm';
import { queryClient } from '../../../app/queryClient';
import { check } from 'zod';

interface Participant {
    id: string;
    name?: string;
    image?: string;
}

const AssigneeItem: React.FC<{ id: string; roleLabel: string; isRequester?: boolean }> = ({ id, roleLabel, isRequester }) => {
    const { i18n } = useTranslation();
    const { data: profile, isLoading } = useUserProfile(id);

    if (isLoading) {
        return <Skeleton avatar active paragraph={{ rows: 2 }} style={{ padding: '8px' }} />;
    }

    const isAr = i18n.language === 'ar';
    const fullName = isAr
        ? `${profile?.first_name_ar} ${profile?.last_name_ar}`
        : `${profile?.first_name_en} ${profile?.last_name_en}`;

    const job = isAr ? profile?.job_ar : profile?.job_en;

    return (
        <Card
            size="small"
            style={{
                marginBottom: 8,
                borderRadius: '8px',
                borderLeft: isRequester ? '4px solid #1677ff' : '1px solid #f0f0f0'
            }}
            hoverable
        >
            <Card.Meta
                avatar={
                    <Avatar
                        src={profile?.image}
                        size={40}
                        icon={<UserOutlined />}
                    />
                }
                title={
                    <Flex justify="space-between" align="center">
                        <Typography.Text strong style={{ fontSize: '14px' }}>{fullName}</Typography.Text>
                        <Tag color={isRequester ? 'blue' : 'default'} style={{ fontSize: '0.8em', marginInlineEnd: 0 }}>
                            {roleLabel}
                        </Tag>
                    </Flex>
                }
                description={
                    <div style={{ marginTop: 2 }}>
                        <Typography.Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                            <Tag color="orange"> {job} </Tag>
                        </Typography.Text>
                        <Space size={8} wrap>
                            {profile?.email && (
                                <Flex gap={8}>
                                    <MailOutlined />
                                    <Typography.Text type="secondary" style={{ fontSize: '11px' }} copyable>
                                        {profile.email}
                                    </Typography.Text>
                                </Flex>
                            )}
                            {profile?.contacts?.mobiles?.[0] && (
                                <Flex gap={8}>
                                    <PhoneOutlined />
                                    <Typography.Text type="secondary" style={{ fontSize: '11px' }} copyable >
                                        {profile.contacts.mobiles[0]}
                                    </Typography.Text>
                                </Flex >
                            )}
                        </Space>
                    </div>
                }
            />
        </Card>
    );
};

interface AssigneeListProps {
    assignees: Participant[];
    requesterId?: string;
    onUpdateAssignees?: (ids: string[]) => void;
    isUpdating?: boolean;
}


const AssigneeList: React.FC<AssigneeListProps> = ({ assignees, requesterId, onUpdateAssignees, isUpdating }) => {
    const { t } = useTranslation();
    const { role } = useParams();
    const isRequester = role === 'requester';
    const defaultOpenKey = role !== 'requester' ? ['1'] : [];

    const [isEditing, setIsEditing] = useState(false);
    const [treeData, setTreeData] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        if (assignees) setSelectedIds(assignees.map(a => a.id));
    }, [assignees]);

    const loadInitialGroups = async () => {
        try {
            const { data } = await fetchGroups();

            const groups = data.groups.map((g: any) => ({
                id: g.id, pId: 0, value: g.id, title: g.name, isLeaf: false, selectable: false, checkable: false
            }));

            const adminRoot = {
                id: 'admin_root', pId: 0, value: 'admin_root', title: t('Admins'), isLeaf: false, selectable: false, checkable: false
            };

            const assignedRoot = {
                id: 'assigned_root',
                pId: 0,
                value: 'assigned_root',
                title: t('tickets.currently_assigned'),
                isLeaf: false,
                selectable: false,
                checkable: false,
            };

            const existingNodes = assignees.map(a => ({
                id: a.id,
                pId: 'assigned_root',
                value: a.id,
                title: a.name || t('common.user'),
                isLeaf: true,
                selectable: true
            }));

            setTreeData([assignedRoot, adminRoot, ...groups, ...existingNodes]);
        } catch (error) {
            message.error(t('errors.fetchFailed'));
        }
    };

    useEffect(() => {
        if (isEditing && treeData.length === 0) loadInitialGroups();
    }, [isEditing]);

    const onLoadData = ({ id, pId }: any) => {
        return new Promise<void>(async (resolve) => {
            if (treeData.some(node => node.pId === id)) return resolve();
            try {
                if (id === 'admin_root') {
                    const response = await queryClient.fetchQuery({ queryKey: ['admins'], queryFn: fetchAdmins });
                    const adminNodes = (response.data?.users || []).map((u: any) => ({
                        id: u.id, pId: 'admin_root', value: u.id, title: `${u.first_name} ${u.last_name}`, isLeaf: true, selectable: true
                    }));
                    setTreeData(prev => [...prev, ...adminNodes]);
                } else if (pId === 0) {
                    const roleNodes = [
                        { id: `${id}_tl`, pId: id, value: `${id}_tl`, title: t('team_leader'), isLeaf: false, selectable: false, checkable: false },
                        { id: `${id}_heads`, pId: id, value: `${id}_heads`, title: t('heads'), isLeaf: false, selectable: false, checkable: false },
                        { id: `${id}_techs`, pId: id, value: `${id}_techs`, title: t('Technicians'), isLeaf: false, selectable: false, checkable: false },
                    ];
                    setTreeData(prev => [...prev, ...roleNodes]);
                } else {
                    const [groupId, roleType] = id.split('_');
                    const { data } = await fetchGroupUsers(groupId);
                    const usersArray: any[] = roleType === 'tl' ? [data.team_leader] : (roleType === 'heads' ? data.heads : data.technicians) || [];
                    const userNodes = usersArray.filter(u => u).map((u: any) => ({
                        id: u.id, pId: id, value: u.id, title: `${u.first_name} ${u.last_name}`, isLeaf: true, selectable: true
                    }));
                    setTreeData((prev) => {
                        const newUserIds = new Set(userNodes.map(n => n.id));
                        const filteredPrev = prev.filter(node => !newUserIds.has(node.id) || node.pId === 'assigned_root');
                        return [...filteredPrev, ...userNodes];
                    });
                }
                resolve();
            } catch (error) { resolve(); }
        });
    };

    const handleSave = () => {
        onUpdateAssignees?.(selectedIds);
        setIsEditing(false);
    };

    return (
        <Collapse ghost expandIconPosition="end" defaultActiveKey={defaultOpenKey}>
            <Collapse.Panel
                header={
                    <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                        <Typography.Text strong>
                            {t('tickets.assignee')} ({(requesterId ? 1 : 0) + (assignees?.length || 0)})
                        </Typography.Text>
                        {!isRequester && (
                            <Button
                                type="text"
                                size="small"
                                icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
                                onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
                            />
                        )}
                    </Flex>
                }
                key="1"
            >
                {isEditing ? (
                    <Card size="small" style={{ marginBottom: 16, border: '1px dashed #1677ff' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <TreeSelect
                                treeDataSimpleMode
                                style={{ width: '100%' }}
                                placeholder={t('tickets.selectTechs')}
                                loadData={onLoadData}
                                treeData={treeData}
                                value={selectedIds}
                                onChange={setSelectedIds}
                                multiple
                                treeCheckable
                                showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                treeExpandAction="click"
                            />
                            <Flex gap="small" justify="end">
                                <Button size="small" onClick={() => setIsEditing(false)}>{t('common.cancel')}</Button>
                                <Popconfirm title={t('common.confirmUpdate')} onConfirm={handleSave}>
                                    <Button size="small" type="primary" loading={isUpdating}>{t('common.save')}</Button>
                                </Popconfirm>
                            </Flex>
                        </Space>
                    </Card>
                ) : (
                    <>
                        {/* {requesterId && (
                            <AssigneeItem id={requesterId} roleLabel={t('tickets.requester')} isRequester={true} />
                        )} */}
                        <List
                            dataSource={assignees}
                            renderItem={(item) => <AssigneeItem id={item.id} roleLabel={t('tickets.techs')} />}
                        />
                    </>
                )}
            </Collapse.Panel>
        </Collapse>
    );
};

export default AssigneeList;