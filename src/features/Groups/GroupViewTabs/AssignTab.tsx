/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Divider, Flex, Input, Row, Select, Space, Spin, Transfer, Typography, message } from 'antd';
import type { TransferProps } from 'antd';
import {
  formatLocalizedUserName,
  useAssignUsers,
  useAssignees,
  useGroupDetail,
} from '../Hooks/useGroupForm';
import type { Assignees } from '../Hooks/useGroupForm';

const { Text } = Typography;

interface UserListItem extends Assignees {
  key: string;
}

interface AssignTabProps {
  groupId: string;
  t: (key: string, options?: any) => string;
}

type EditableTeam = {
  clientKey: string;
  id?: string;
  name_en: string;
  name_ar: string;
  lead_ids: string[];
  member_ids: string[];
};
export const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Insecure fallback for HTTP network testing
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
const createEmptyTeam = (): EditableTeam => ({
  clientKey: generateId(),
  name_en: '',
  name_ar: '',
  lead_ids: [],
  member_ids: [],
});

const AssignTab: React.FC<AssignTabProps> = ({ groupId, t }) => {
  const { data: technicians, isLoading: isLoadingNonMembers } = useAssignees(groupId);
  const { data: groupDetail, isLoading: isLoadingGroup } = useGroupDetail(groupId);
  const assignmentMutation = useAssignUsers(groupId);

  const [groupMemberIds, setGroupMemberIds] = useState<string[]>([]);
  const [teams, setTeams] = useState<EditableTeam[]>([]);

  useEffect(() => {
    if (!groupDetail) {
      return;
    }

    setGroupMemberIds((groupDetail.members || []).map((member) => member.id));
    setTeams(
      (groupDetail.teams || []).map((team) => ({
        clientKey: team.id || crypto.randomUUID(),
        id: team.id,
        name_en: team.name_en,
        name_ar: team.name_ar,
        lead_ids: (team.leads || []).map((lead) => lead.id),
        member_ids: (team.technicians || []).map((member) => member.id),
      })),
    );
  }, [groupDetail]);

  const transferData: UserListItem[] = useMemo(() => {
    const map = new Map<string, UserListItem>();
    [...(technicians || []), ...(groupDetail?.members || [])].forEach((user) => {
      if (!user?.id) return;
      map.set(user.id, { ...user, key: user.id });
    });
    return Array.from(map.values());
  }, [groupDetail?.members, technicians]);

  const memberIdsUsedInTeams = useMemo(
    () =>
      Array.from(
        new Set(
          teams.flatMap((team) => [...team.lead_ids, ...team.member_ids]),
        ),
      ),
    [teams],
  );

  const selectableMemberIds = useMemo(
    () => Array.from(new Set([...groupMemberIds, ...memberIdsUsedInTeams])),
    [groupMemberIds, memberIdsUsedInTeams],
  );

  const groupMemberOptions = useMemo(
    () =>
      transferData
        .filter((user) => selectableMemberIds.includes(user.id))
        .map((user) => ({
          value: user.id,
          label: formatLocalizedUserName(user),
        })),
    [selectableMemberIds, transferData],
  );

  const handleTransferChange: TransferProps<UserListItem>['onChange'] = (newKeys) => {
    setGroupMemberIds(newKeys as string[]);
  };

  const updateTeam = (clientKey: string, patch: Partial<EditableTeam>) => {
    setTeams((current) =>
      current.map((team) =>
        team.clientKey === clientKey ? { ...team, ...patch } : team,
      ),
    );
  };

  const handleSaveAssignment = () => {
    const payload = {
      users: Array.from(new Set([...groupMemberIds, ...memberIdsUsedInTeams])),
      teams: teams.map((team) => ({
        id: team.id,
        name_en: team.name_en,
        name_ar: team.name_ar,
        lead_ids: Array.from(new Set(team.lead_ids)),
        member_ids: Array.from(new Set(team.member_ids)),
      })),
    };

    assignmentMutation.mutate(payload, {
      onSuccess: () => message.success(t('translation.assignment_success')),
      onError: (error: any) =>
        message.error(
          error?.response?.data?.error || t('translation.assignment_failed'),
        ),
    });
  };

  const renderItem = (item: UserListItem) => (
    <Space size={8}>
      <Text>{formatLocalizedUserName(item)}</Text>
    </Space>
  );

  if (isLoadingNonMembers || isLoadingGroup || !groupDetail) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }} />;
  }

  return (
    <Space direction="vertical" style={{ width: '100%', marginTop: 24 }} size="large">
      <Card title={t('translation.group_members', 'Group Members')}>
        <Transfer
          dataSource={transferData}
          targetKeys={groupMemberIds}
          onChange={handleTransferChange}
          render={renderItem as any}
          style={{ justifyContent: 'center' }}
          listStyle={{ width: '45%', minHeight: 360 }}
          locale={{
            itemUnit: t('translation.users'),
            itemsUnit: t('translation.users'),
            notFoundContent: t('translation.not_found'),
            searchPlaceholder: t('translation.search_users'),
          }}
          titles={[
            t('translation.available_technicians'),
            t('translation.assigned_technicians'),
          ]}
          showSearch
          filterOption={(inputValue, item) =>
            formatLocalizedUserName(item).toLowerCase().includes(inputValue.toLowerCase())
          }
        />
      </Card>

      <Card
        title={t('translation.teams', 'Teams')}
        extra={
          <Button type="dashed" onClick={() => setTeams((current) => [...current, createEmptyTeam()])}>
            {t('translation.add_team', 'Add Team')}
          </Button>
        }
      >
        {!teams.length && (
          <Text type="secondary">{t('translation.no_teams', 'No teams added yet.')}</Text>
        )}

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {teams.map((team, index) => (
            <Card
              key={team.clientKey}
              size="small"
              title={`${t('translation.team', 'Team')} ${index + 1}`}
              extra={
                <Button danger type="text" onClick={() => setTeams((current) => current.filter((item) => item.clientKey !== team.clientKey))}>
                  {t('translation.remove_team', 'Remove Team')}
                </Button>
              }
            >
              <Row gutter={[12, 12]}>
                <Col xs={24} md={12}>
                  <Input
                    value={team.name_en}
                    onChange={(event) => updateTeam(team.clientKey, { name_en: event.target.value })}
                    placeholder={t('translation.team_name_en', 'Team name (EN)')}
                  />
                </Col>
                <Col xs={24} md={12}>
                  <Input
                    value={team.name_ar}
                    onChange={(event) => updateTeam(team.clientKey, { name_ar: event.target.value })}
                    placeholder={t('translation.team_name_ar', 'Team name (AR)')}
                  />
                </Col>
                <Col xs={24}>
                  <Select
                    mode="multiple"
                    allowClear
                    showSearch
                    style={{ width: '100%' }}
                    placeholder={t('translation.team_leads', 'Team Leads')}
                    value={team.lead_ids}
                    options={groupMemberOptions}
                    onChange={(value) => updateTeam(team.clientKey, { lead_ids: value })}
                    optionFilterProp="label"
                  />
                </Col>
                <Col xs={24}>
                  <Select
                    mode="multiple"
                    allowClear
                    showSearch
                    style={{ width: '100%' }}
                    placeholder={t('translation.team_members', 'Team Members')}
                    value={team.member_ids}
                    options={groupMemberOptions}
                    onChange={(value) => updateTeam(team.clientKey, { member_ids: value })}
                    optionFilterProp="label"
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </Space>

        {!!groupDetail.unassigned_members?.length && (
          <>
            <Divider />
            <Text type="secondary">
              {t('translation.unassigned_members_note', 'Members not assigned to any team will stay available at the group level.')}
            </Text>
          </>
        )}
      </Card>

      <div style={{ textAlign: 'right' }}>
        <Button
          type="primary"
          onClick={handleSaveAssignment}
          loading={assignmentMutation.isPending}
          disabled={assignmentMutation.isPending}
        >
          {t('translation.save_assignments')}
        </Button>
      </div>
    </Space>
  );
};

export default AssignTab;
