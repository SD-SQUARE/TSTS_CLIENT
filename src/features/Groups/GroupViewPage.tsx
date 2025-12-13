/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { Card, Space, Typography, Spin, Button, Result, Tabs, message, Tooltip, Input, Modal } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TabsProps } from 'antd';


import { useGroupDetail } from './Hooks/useGroupForm';
import InfoTab from './GroupViewTabs/InfoTab';
import AssignTab from './GroupViewTabs/AssignTab';
import { useDeleteGroup } from './Hooks/useGroups';
import GroupFormModal from './GroupFormModal';

const { Title } = Typography;


const GroupViewPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const groupId = id;
    const { data: group, isLoading, isError, refetch } = useGroupDetail(groupId);
    const currentLanguage = i18n.language;
    const deleteMutation = useDeleteGroup();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [confirmName, setConfirmName] = useState('');
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const handleBack = () => { navigate(-1); };

    const handleConfirmDelete = () => {
        setIsDeleteModalVisible(true);
        setConfirmName(''); 
    };

    const handleDeleteSubmit = () => {
        if (!group) return;

        const actualGroupName = group[`name_${currentLanguage}`] || group.name_en || '';
        
        if (confirmName.trim() !== actualGroupName.trim()) {
            message.error(t('translation.delete_name_mismatch_warning_group'));
            return;
        }

        deleteMutation.mutate(groupId!, {
            onSuccess: () => {
                setIsDeleteModalVisible(false);
                message.success(t('translation.group_deleted_success'));
                navigate(-1); 
            },
            onError: () => {
                message.error(t('translation.group_deleted_error'));
            }
        });
    };
    
    const requiredName = group ? (group[`name_${currentLanguage}`] || group.name_en || '') : '';
    const isNameMatch = confirmName.trim() === requiredName.trim();
    const isDeleteLoading = deleteMutation.isPending;

const handleOpenEditModal = () => {
        setIsEditModalVisible(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalVisible(false);
        refetch();
    };

    if (!groupId) {
        return <Result status="404" title="404" subTitle={t('translation.group_id_missing')} />;
    }

    if (isLoading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }} />;
    }

    if (isError || !group) {
        return (
            <Result
                status="warning"
                title={t('translation.error_fetching_group')}
                subTitle={t('translation.group_not_found')}
                extra={[
                    <Button type="primary" key="back" onClick={handleBack} icon={<ArrowLeftOutlined />}>
                        {t('translation.back_to_list')}
                    </Button>,
                ]}
            />
        );
    }

    const titleColor = group.color || '#333';

    const tabItems: TabsProps['items'] = [
        {
            key: 'info',
            label: t('group_form.tab_info') || 'Group Info',
            children: <InfoTab group={group} currentLanguage={currentLanguage} t={t} onEdit={handleOpenEditModal}/>,
        },
        {
            key: 'assign',
            label: t('group_form.tab_assign') || 'Assign Users',
            children: <AssignTab groupId={groupId} t={t} />,
        },
    ];

    return (
        <>
        <Card
        
            title={
                <Space>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBack}
                        size="small"
                        type="default"
                    />
                    <Title level={4} style={{ margin: 0 }}>
                        {t('group_form.view_title') || 'Viewing Group'}
                        : <Typography.Text copyable style={{ color: titleColor, fontStyle: 'italic', fontSize: 20 }}>
                            {group[`name_${currentLanguage}`]}
                        </Typography.Text>
                    </Title>
                </Space>
            }
            extra={
                <Space>
                    <Tooltip title={t('translation.delete')} placement="bottom">
                        <Button 
                            icon={<DeleteOutlined />} 
                            danger 
                            onClick={handleConfirmDelete}
                            loading={isDeleteLoading}
                        />
                    </Tooltip>
                </Space>
            }
            style={{ margin: 20 }}

            bodyStyle={{ padding: 0 }}
        >
            <Tabs
                defaultActiveKey="info"
                items={tabItems}
                size="large"

                style={{ padding: '0 24px 24px 24px' }}
            />
        </Card>
        <Modal
            title={t('translation.confirm_delete_group_title')}
            open={isDeleteModalVisible}
            onCancel={() => setIsDeleteModalVisible(false)}
            footer={[
                <Button key="back" onClick={() => setIsDeleteModalVisible(false)}>
                    {t('translation.cancel')}
                </Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    danger 
                    onClick={handleDeleteSubmit}
                    disabled={!isNameMatch || isDeleteLoading}
                    loading={isDeleteLoading}
                >
                    {t('translation.delete')}
                </Button>,
            ]}
        >
            <Typography.Paragraph>
                {t('translation.delete_prompt_group', { name: requiredName })}
            </Typography.Paragraph>
            <Input
                placeholder={requiredName}
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                onPressEnter={handleDeleteSubmit}
                style={{ marginTop: 10 }}
            />
            {!isNameMatch && confirmName.length > 0 && (
                <Typography.Text type="danger">
                    {t('translation.delete_name_mismatch_warning_group')}
                </Typography.Text>
            )}
        </Modal>
        <GroupFormModal
                isVisible={isEditModalVisible}
                onClose={handleCloseEditModal}
                groupData={group} 
            />
        </>
    );
};

export default GroupViewPage;