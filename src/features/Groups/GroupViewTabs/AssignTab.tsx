/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
import { Space, Typography, Spin, Button, Transfer, message, Tag } from 'antd';
import type { TransferProps } from 'antd';
import {
    useAssignUsers,
    useAssignees,
    useGroupTechnicians,
    type Assignees,
    formatFullNameAssignee,
} from '../Hooks/useGroupForm';
import i18next from 'i18next';

const { Text } = Typography;

interface UserListItem extends Assignees {
    key: string;
    job_title?: { en: string; ar: string };
}

interface AssignTabProps {
    groupId: string;
    t: (key: string) => string;
}

const AssignTab: React.FC<AssignTabProps> = ({ groupId, t }) => {
    const { data: technicians, isLoading: isLoadingNonMembers } = useAssignees(groupId);
    const { data: assignedMembers, isLoading: isLoadingMembers } = useGroupTechnicians(groupId);
    const [targetKeys, setTargetKeys] = useState<string[]>([]);
    const assignmentMutation = useAssignUsers(groupId);

    console.log('AssignTab rendered');

    // Update targetKeys once both data arrays are available
    useEffect(() => {
        if (!technicians || !assignedMembers) return;
        const newKeys = assignedMembers.map((m) => m.id).filter(Boolean); // <- filter null/undefined
        setTargetKeys(newKeys);
    }, [technicians, assignedMembers]);

    // Merge technicians + assignedMembers into Transfer data
    const transferData: UserListItem[] = useMemo(() => {
        if (!technicians && !assignedMembers) return [];
        const map = new Map<string, UserListItem>();
        [...(technicians || []), ...(assignedMembers || [])].forEach((user) => {
            map.set(user.id, { ...user, key: user.id });
        });
        const data = Array.from(map.values());
        console.log('transferData:', data);
        return data;
    }, [technicians, assignedMembers]);

    const handleTransferChange: TransferProps<UserListItem>['onChange'] = (newKeys) => {
        setTargetKeys(newKeys as string[]);
    };

    const handleSaveAssignment = () => {
        if (!targetKeys.length) {
            message.error(t('translation.users_required'));
            return;
        }

        const uniqueTargetKeys = Array.from(new Set(targetKeys));

        assignmentMutation.mutate(uniqueTargetKeys, {
            onSuccess: () => message.success(t('translation.assignment_success')),
            onError: () => message.error(t('translation.assignment_failed')),
        });
    };


    const filterByFullName = (inputValue: string, item: UserListItem) => {
        return formatFullNameAssignee(item).toLowerCase().includes(inputValue.toLowerCase());
    };

    const renderItem = (item: UserListItem) => {
        const fullName = formatFullNameAssignee(item);
        const jobTitle =
            i18next.language === 'en' ? item.job_title?.en : item.job_title?.ar || t('translation.no_job_title');

        return (
            <Space size={8}>
                <Text>{fullName}</Text>
                {jobTitle !== t('translation.no_job_title') && <Tag color="blue">{jobTitle}</Tag>}
            </Space>
        );
    };

    // Only render Transfer once both data are loaded
    if (isLoadingNonMembers || isLoadingMembers || !technicians || !assignedMembers) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }} />;
    }

    console.log('Final transferData:', transferData);
    console.log('Final targetKeys:', targetKeys);

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Transfer
                dataSource={transferData}
                targetKeys={targetKeys}
                onChange={handleTransferChange}
                filterOption={filterByFullName}
                render={renderItem as any}
                style={{ justifyContent: 'center' }}
                listStyle={{ width: '45%', minHeight: 400 }}
                locale={{
                    itemUnit: t('translation.users'),
                    itemsUnit: t('translation.users'),
                    notFoundContent: t('translation.not_found'),
                    searchPlaceholder: t('translation.search_users'),
                }}
                titles={[t('translation.available_technicians'), t('translation.assigned_technicians')]}
                showSearch
            />
            <div style={{ textAlign: 'right', marginTop: 20 }}>
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
