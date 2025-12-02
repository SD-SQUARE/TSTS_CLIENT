/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo, useEffect } from 'react';
import { Space, Typography, Spin, Button, Transfer, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import type { TransferProps } from 'antd';


import { useTechnicians, useAssignUsers, formatFullName, type User } from '../Hooks/useGroupForm';
import type { NamedObject } from '../Types/groups';

const { Text } = Typography;




interface UserListItem extends User {
    key: string;
}


interface AssignTabProps { groupId: string; initialMembers: NamedObject[] | undefined; t: (key: string) => string; }
const AssignTab: React.FC<AssignTabProps> = ({ groupId, initialMembers, t }) => {
    const { data: technicians, isLoading: isLoadingTech } = useTechnicians();
    const [targetKeys, setTargetKeys] = useState<string[]>([]);
    const assignmentMutation = useAssignUsers(groupId);


    useEffect(() => {
        if (initialMembers) {

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTargetKeys(initialMembers.map(m => m.id));
        }
    }, [initialMembers]);


    const transferData: UserListItem[] = useMemo(() => {
        return technicians?.map(tech => ({
            ...tech,
            key: tech.id,
        })) || [];
    }, [technicians]);

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
        const fullName = formatFullName(item).toLowerCase();
        return fullName.includes(inputValue.toLowerCase());
    };

    const renderItem = (item: UserListItem) => {
        const fullName = formatFullName(item);


        const customLabel = (
            <Space>
                <UserOutlined style={{ color: '#007bff' }} />
                <Text>{fullName}</Text>
                { }
                { }
            </Space>
        );


        return {
            label: customLabel,
            value: item.key,
        };
    };

    if (isLoadingTech) {
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