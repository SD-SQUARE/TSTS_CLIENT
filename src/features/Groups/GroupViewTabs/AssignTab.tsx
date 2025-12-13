/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo, useEffect } from 'react';
import { Space, Typography, Spin, Button, Transfer, message, Tag } from 'antd';

import type { TransferProps } from 'antd';


import { useAssignUsers, useAssignees, useGroupTechnicians, type Assignees, formatFullNameAssignee } from '../Hooks/useGroupForm';

const { Text } = Typography;




interface UserListItem extends Assignees {
    key: string;
}


interface AssignTabProps { groupId: string; t: (key: string) => string; }
const AssignTab: React.FC<AssignTabProps> = ({ groupId, t }) => {
    const { data: technicians, isLoading: isLoadingNonMembers } = useAssignees(groupId);
    const { data: assignedMembers, isLoading: isLoadingMembers } = useGroupTechnicians(groupId);
    const [targetKeys, setTargetKeys] = useState<string[]>([]);
    const assignmentMutation = useAssignUsers(groupId);


    useEffect(() => {
        if (Array.isArray(assignedMembers)) { 
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTargetKeys(assignedMembers.map(m => m.id));
        }
    }, [assignedMembers]);


    const transferData: UserListItem[] = useMemo(() => {
        const techniciansArray = Array.isArray(technicians) ? technicians : [];
        const assignedArray = Array.isArray(assignedMembers) ? assignedMembers : [];
        
        const allUsers = [...techniciansArray, ...assignedArray];
        return allUsers.map(tech => ({
            ...tech,
            key: tech.id,
        })) || [];
    }, [technicians, assignedMembers]);

    const handleTransferChange: TransferProps<UserListItem>['onChange'] = (newTargetKeys) => {
        setTargetKeys(newTargetKeys as string[]);
    };

    const handleSaveAssignment = () => {
        assignmentMutation.mutate(targetKeys, {
            onSuccess: () => {
                message.success(t('translation.assignment_success'));
            },
            onError: () => {
                message.error(t('translation.assignment_failed'));
            }
        });
    };

    const filterByFullName = (inputValue: string, item: UserListItem) => {
        const fullName = formatFullNameAssignee(item).toLowerCase();
        return fullName.includes(inputValue.toLowerCase());
    };

    const renderItem = (item: UserListItem) => {
        const fullName = formatFullNameAssignee(item);
        // console.log(item);
        const jobTitle = item[`job_title`] || t('translation.no_job_title');
        // const hasImage = item.image && item.image.trim() !== '';

        const customLabel = (
            <Space size={8}>
                {/* <UserOutlined style={{ color: '#007bff' }} /> */}
                {/* <Avatar size="small" src={hasImage ? item.image : undefined}
                    icon={!hasImage ? <UserOutlined /> : undefined} /> */}
                <Text>{fullName}</Text>
                {jobTitle !== t('translation.no_job_title') && (
                    <Tag color="blue">{jobTitle}</Tag>
                )}
            </Space>
        );


        return {
            label: customLabel,
            value: item.key,
        };
    };

    if (isLoadingNonMembers || isLoadingMembers) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }} />;
    }

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Transfer
                dataSource={transferData}
                targetKeys={targetKeys}
                onChange={handleTransferChange}
                filterOption={filterByFullName}
                render={renderItem as any}
                listStyle={{
                    width: '100%',
                    height: 500,
                }}
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