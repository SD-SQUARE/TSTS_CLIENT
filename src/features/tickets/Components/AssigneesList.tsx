/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { Collapse, Typography, List, Card, Avatar, Tag, Skeleton, Space, Flex, Popconfirm, Button, Tree, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../Hooks/useTicket';
import { useParams } from 'react-router-dom';
import { fetchAdmins, fetchGroups, fetchGroupUsers } from '../Hooks/useTicketForm';
import { queryClient } from '../../../app/queryClient';
import { useSelector } from 'react-redux';

interface Participant {
  id: string;
  name?: string;
  image?: string;
}

interface AssigneeListProps {
  assignees: Participant[];
  requesterId?: string;
  onUpdateAssignees?: (ids: string[]) => void;
  isUpdating?: boolean;
}

interface UserNodeMeta {
  userId: string;
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
        avatar={(
          <Avatar
            src={profile?.image}
            size={40}
            icon={<UserOutlined />}
          />
        )}
        title={(
          <Flex justify="space-between" align="center">
            <Typography.Text strong style={{ fontSize: '14px' }}>{fullName}</Typography.Text>
            <Tag color={isRequester ? 'blue' : 'default'} style={{ fontSize: '0.8em', marginInlineEnd: 0 }}>
              {roleLabel}
            </Tag>
          </Flex>
        )}
        description={(
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
        )}
      />
    </Card>
  );
};

const toLocalizedUserLabel = (user: any, isArabic: boolean) =>
  (isArabic
    ? user?.name_ar || user?.display_name || user?.name_en
    : user?.name_en || user?.display_name || user?.name_ar) ||
  user?.name ||
  `${user?.first_name_en || user?.first_name?.en || ''} ${user?.last_name_en || user?.last_name?.en || ''}`.trim() ||
  user?.email ||
  '';

const AssigneeList: React.FC<AssigneeListProps & { forceEdit?: boolean }> = ({
  assignees,
  requesterId,
  onUpdateAssignees,
  isUpdating,
  forceEdit = false
}) => {
  const { t, i18n } = useTranslation();
  const { role } = useParams();
  const currentUserRole = useSelector((state: any) => state.auth.user?.role?.toLowerCase?.() || '');
  const isRequester = currentUserRole === 'requester' || role === 'requester';
  const canInlineEdit = ['admin', 'technician', 'superadmin'].includes(currentUserRole);
  const defaultOpenKey = !isRequester ? ['1'] : [];
  const isArabic = i18n.language.startsWith('ar');

  const [isEditing, setIsEditing] = useState(forceEdit);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [nodeUserMap, setNodeUserMap] = useState<Record<string, UserNodeMeta>>({});

  useEffect(() => {
    setSelectedUserIds((assignees || []).map((item) => item.id));
  }, [assignees]);

  const checkedKeys = useMemo(
    () =>
      Object.entries(nodeUserMap)
        .filter(([, meta]) => selectedUserIds.includes(meta.userId))
        .map(([key]) => key),
    [nodeUserMap, selectedUserIds],
  );

  const loadInitialGroups = async () => {
    try {
      const { data } = await fetchGroups();
      const safeGroups = Array.isArray(data?.groups) ? data.groups : [];
      const groupNodes = safeGroups.map((group: any) => ({
        key: `group:${group.id}`,
        title: isArabic ? group.name_ar || group.name_en || group.name : group.name_en || group.name_ar || group.name,
        isLeaf: false,
        selectable: false,
        checkable: false,
      }));

      const adminRoot = {
        key: 'admin_root',
        title: t('Admins'),
        isLeaf: false,
        selectable: false,
        checkable: false,
      };

      const assignedRoot = {
        key: 'assigned_root',
        title: t('tickets.currently_assigned'),
        isLeaf: false,
        selectable: false,
        checkable: false,
        children: (assignees || []).map((item) => ({
          key: `assigned:${item.id}`,
          title: item.name || t('common.user'),
          isLeaf: true,
        })),
      };

      setNodeUserMap((current) => ({
        ...current,
        ...(assignees || []).reduce<Record<string, UserNodeMeta>>((acc, item) => {
          acc[`assigned:${item.id}`] = { userId: item.id };
          return acc;
        }, {}),
      }));

      setTreeData([assignedRoot, adminRoot, ...groupNodes]);
    } catch (error) {
      message.error(t('errors.fetchFailed'));
    }
  };

  useEffect(() => {
    if (isEditing && treeData.length === 0) {
      void loadInitialGroups();
    }
  }, [isEditing, treeData.length]);

  const appendChildren = (targetKey: string, children: any[]) => {
    const updateNodes = (nodes: any[]): any[] =>
      nodes.map((node) => {
        if (node.key === targetKey) {
          return { ...node, children };
        }

        if (node.children) {
          return { ...node, children: updateNodes(node.children) };
        }

        return node;
      });

    setTreeData((current) => updateNodes(current));
  };

  const buildTeamChildren = (groupId: string, data: any) => {
    const nextNodeUserMap: Record<string, UserNodeMeta> = {};

    const teamNodes = (data.teams || []).map((team: any) => {
      const teamUsersById = new Map<string, any>();
      (team.leads || []).forEach((user: any) => teamUsersById.set(user.id, { ...user, isLead: true }));
      (team.technicians || []).forEach((user: any) => {
        const previous = teamUsersById.get(user.id);
        teamUsersById.set(user.id, { ...user, isLead: previous?.isLead || false });
      });

      const children = Array.from(teamUsersById.values()).map((user: any) => {
        const nodeKey = `team:${team.id}:user:${user.id}`;
        nextNodeUserMap[nodeKey] = { userId: user.id };
        return {
          key: nodeKey,
          isLeaf: true,
          title: (
            <Space size={6}>
              <span>{toLocalizedUserLabel(user, isArabic)}</span>
              {user.isLead && <Tag color="green">{t('translation.team_leads', 'Team Lead')}</Tag>}
            </Space>
          ),
        };
      });

      return {
        key: `team:${team.id}`,
        title: isArabic ? team.name_ar : team.name_en,
        selectable: false,
        checkable: false,
        children,
      };
    });

    const memberChildren = (data.unassigned_members || []).map((user: any) => {
      const nodeKey = `group:${groupId}:member:${user.id}`;
      nextNodeUserMap[nodeKey] = { userId: user.id };
      return {
        key: nodeKey,
        isLeaf: true,
        title: toLocalizedUserLabel(user, isArabic),
      };
    });

    setNodeUserMap((current) => ({ ...current, ...nextNodeUserMap }));

    const extraChildren = memberChildren.length
      ? [
        {
          key: `group:${groupId}:members`,
          title: t('translation.group_members', 'Members'),
          selectable: false,
          checkable: false,
          children: memberChildren,
        },
      ]
      : [];

    return [...teamNodes, ...extraChildren];
  };

  const onLoadData = async (node: any) => {
    if (node.children?.length) return;

    try {
      if (node.key === 'admin_root') {
        const response = await queryClient.fetchQuery({ queryKey: ['admins'], queryFn: fetchAdmins }) as any;
        const users = Array.isArray(response?.data?.users) ? response.data.users : Array.isArray(response?.users) ? response.users : [];
        const nextNodeUserMap: Record<string, UserNodeMeta> = {};
        const adminChildren = users.map((user: any) => {
          const nodeKey = `admin:${user.id}`;
          nextNodeUserMap[nodeKey] = { userId: user.id };
          return {
            key: nodeKey,
            isLeaf: true,
            title: `${user.first_name || user.name_en || ''} ${user.last_name || ''}`.trim() || user.email,
          };
        });

        setNodeUserMap((current) => ({ ...current, ...nextNodeUserMap }));
        appendChildren('admin_root', adminChildren);
        return;
      }

      if (String(node.key).startsWith('group:')) {
        const groupId = String(node.key).split(':')[1];
        const { data } = await fetchGroupUsers(groupId);
        appendChildren(node.key, buildTeamChildren(groupId, data));
      }
    } catch (error) {
      message.error(t('errors.fetchFailed'));
    }
  };

  const handleCheck = (nextCheckedKeysValue: any) => {
    const nextCheckedKeys = Array.isArray(nextCheckedKeysValue)
      ? nextCheckedKeysValue
      : nextCheckedKeysValue?.checked || [];

    const nextUserIds = Array.from(
      new Set(
        nextCheckedKeys
          .map((key: string) => nodeUserMap[key]?.userId)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    setSelectedUserIds(nextUserIds);
  };

  const handleSave = () => {
    onUpdateAssignees?.(selectedUserIds);
    setIsEditing(false);
  };

  return (
    <Collapse ghost expandIconPosition="end" defaultActiveKey={defaultOpenKey}>
      <Collapse.Panel
        header={
          !forceEdit && (
            <Flex justify="space-between" align="center" style={{ width: '100%' }}>
              <Typography.Text strong>
                {t('tickets.assignee')} ({(assignees?.length || 0)})
              </Typography.Text>
              {canInlineEdit && (
                <Button
                  type="text"
                  size="small"
                  icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
                  onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
                />
              )}
            </Flex>
          )
        }
        key="1"
        showArrow={!forceEdit}
      >
        {isEditing ? (
          <Card size="small" style={{ marginBottom: 16, border: '1px dashed #1677ff' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Tree
                checkable
                selectable={false}
                treeData={treeData}
                checkedKeys={checkedKeys}
                loadData={onLoadData}
                onCheck={handleCheck}
                defaultExpandAll={false}
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
            <List
              dataSource={assignees}
              renderItem={(item) => <AssigneeItem id={item.id} roleLabel={t('tickets.techs')} />}
            />
            {requesterId && false && <AssigneeItem id={requesterId} roleLabel={t('tickets.requester')} isRequester />}
          </>
        )}
      </Collapse.Panel>
    </Collapse>
  );
};

export default AssigneeList;
