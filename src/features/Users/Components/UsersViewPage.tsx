import React, { useState } from 'react';
import { Card, Descriptions, Space, Typography, Spin, Button, Result, Tag, Avatar, message, Tooltip, Modal, Input } from 'antd';
import { ArrowLeftOutlined, MailOutlined, IdcardOutlined, PhoneOutlined, HomeOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDeleteUser, useUserDetail, useUserPermissionsProfile } from '../Hooks/useUsers';
import type { Lookup } from '../Types/users';
import AvatarDisplay from '../../../components/AvatarDisplay';
import UserFormModal from './UsersFormModal';

const { Text, Title } = Typography;


const renderLookupList = (items: Lookup[] | undefined, currentLanguage: string) => {
    if (!items || items.length === 0) {
        return <Text disabled>-</Text>;
    }
    const nameKey = `name_${currentLanguage}`;
    return (
        <Space size="small" wrap>
            {items.filter(Boolean).map((item, index) => {
                const localizedName = (item as unknown)[nameKey] || item.name;
                return (
                    <AvatarDisplay
                        key={item.id || index}
                        member={{
                            id: item.id,
                            name: localizedName,
                            color: item.color
                        }}
                    />
                );
            })}
        </Space>
    );
};
const renderContactList = (contacts: string[] | undefined) => {
    if (!contacts || contacts.length === 0) {
        return <Text disabled>-</Text>;
    }
    return (
        <Space size="small" wrap>
            {contacts.filter(c => c.trim() !== '').map((contact, index) => (
                <Tag key={index} icon={<PhoneOutlined />}>
                    {contact}
                </Tag>
            ))}
        </Space>
    );
};

const renderDepartmentList = (department: Lookup[] | undefined, currentLanguage: string) => {
    if (!department || department.length === 0) {
        return <Text disabled>-</Text>;
    }

    const nameKey = `name_${currentLanguage}`;
    return (
        <Space size="small" wrap>
            {department.filter(Boolean).map((item, index) => {
                const localizedName = (item as unknown)[nameKey] || item.name;
                return (
                    <Tag
                        key={item.id || index}
                        icon={<HomeOutlined />}

                    >
                        {localizedName}
                    </Tag>
                );
            })}
        </Space>
    );
};

const getInitials = (fullName: string) => {
    const names = fullName.split(' ').filter(n => n.length > 0);
    if (names.length === 0) return 'U';

    const firstInitial = names[0][0];
    const lastInitial = names.length > 1 ? names[names.length - 1][0] : '';

    return `${firstInitial}${lastInitial}`.toUpperCase();
};

const UserViewPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const { role, id } = useParams<{ role: string; id: string }>();
    const userId = id;

    const { data: user, isLoading, isError, refetch } = useUserDetail(role!, userId);
    const { data: permissionsProfile } = useUserPermissionsProfile(userId);

    const currentLanguage = i18n.language;
    const deleteMutation = useDeleteUser(role!);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [confirmName, setConfirmName] = useState('');
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const handleBack = () => {
        navigate(-1);
    };

    const firstName = user?.[`first_name_${currentLanguage}`] || '';
    const midName = user?.[`mid_name_${currentLanguage}`] || '';
    const lastName = user?.[`last_name_${currentLanguage}`] || '';

    const fullName = `${firstName} ${midName} ${lastName}`.trim();
    const jobTitle = user?.[`job_${currentLanguage}`] || '-';

    const initials = getInitials(fullName);

    const requiredName = fullName.trim();
    const isNameMatch = confirmName.trim().toLowerCase() === requiredName.toLowerCase();
    const isActionLoading = deleteMutation.isPending;
    
    const handleOpenConfirmDelete = () => {
        setIsDeleteModalVisible(true);
        setConfirmName('');
    };

    const handleDeleteSubmit = () => {
        if (!user) return;


        if (confirmName.trim() !== requiredName) {
            message.error(t('translation.delete_name_mismatch_warning_user'));
            return;
        }

        deleteMutation.mutate(userId!, {
            onSuccess: () => {
                setIsDeleteModalVisible(false);
                message.success(t('translation.user_deleted_success'));
                navigate(-1);
            },
            onError: () => {
                message.error(t('translation.user_deleted_error'));
            }
        });
    };

    const handleOpenEditModal = () => {
        setIsEditModalVisible(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalVisible(false);
        refetch();
    };

    if (!role || !userId) {
        return <Result status="404" title="404" subTitle={t('translation.user_id_or_role_missing')} />;
    }

    if (isLoading) {
        return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }} />;
    }

    if (isError || !user) {
        return (
            <Result
                status="warning"
                title={t('translation.error_fetching_user')}
                subTitle={t('translation.user_not_found_message')}
                extra={[
                    <Button type="primary" key="back" onClick={handleBack} icon={<ArrowLeftOutlined />}>
                        {t('translation.back_to_list')}
                    </Button>,
                ]}
            />
        );
    }

    const isStaff = role === 'admins' || role === 'technicians';

    const allItems = [
        { key: 'full_name', label: t('user_list.full_name'), children: fullName, span: 2 },
        { key: 'email', label: t('user_list.email'), children: <Tag icon={<MailOutlined />}>{user.email}</Tag> },
        { key: 'ssn', label: t('user_list.ssn'), children: <Tag icon={<IdcardOutlined />}>{user.ssn}</Tag> },
        { key: 'status', label: t('user_list.status'), children: <Tag color={user.status === 'Active' ? 'green' : 'red'}>{user.status}</Tag> },

        { key: 'job_title', label: t('user_list.job_title'), children: jobTitle, span: 2 },

        { key: 'university', label: t('user_list.university'), children: user.university?.name ?? '-', span: 1 },
        { key: 'domain', label: t('user_list.domain'), children: user.domain?.name ?? '-', span: 1 },

        { key: 'phone', label: t('user_list.phone'), children: renderContactList(user.contacts?.phones), span: 1 },
        { key: 'mobile', label: t('user_list.mobile'), children: renderContactList(user.contacts?.mobiles), span: 1 },

        { key: 'departments', label: t('user_list.department'), children: renderDepartmentList(user.departments, currentLanguage), condition: !isStaff },
        { key: 'groups', label: t('user_list.group'), children: renderLookupList(user.groups, currentLanguage), condition: role !== 'requesters' }, // Passing color for consistency
        // { key: 'specializations', label: t('user_list.specializations'), children: renderLookupList(user.specializations, currentLanguage) },
        {
            key: 'permission_profile',
            label: t('user_list.perm_prof'),
            children:
                user.permission_profile?.name ||
                (user.permission_profile as any)?.name_en ||
                (user.permission_profile as any)?.name_ar ||
                '-',
        },
    ];
    const items = allItems.filter(item => item.condition === undefined || item.condition);

    const hasImage = user.image && user.image.trim() !== '';

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
                            {t('user_list.view_user_title')}
                        </Title>
                    </Space>
                }
                extra={
                    <Space>
                        <Tooltip title={t('translation.edit')} placement="bottom">
                            <Button 
                                icon={<EditOutlined />} 
                                onClick={handleOpenEditModal} 
                                loading={isActionLoading} 
                            />
                        </Tooltip>
                        <Tooltip title={t('translation.delete')} placement="bottom">
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                onClick={handleOpenConfirmDelete}
                                loading={isActionLoading}
                            />
                        </Tooltip>
                    </Space>
                }
                style={{ margin: 20 }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Card bordered={false} style={{ textAlign: 'center' }}>
                        <Avatar
                            size={100}
                            src={hasImage ? user.image : undefined}
                            icon={!hasImage ? <IdcardOutlined /> : undefined}
                        >
                            {!hasImage ? initials : null}
                        </Avatar>
                        <Typography.Title copyable level={3} style={{ margin: '10px 0 0' }}>{fullName}</Typography.Title>
                        <Text type="secondary">{jobTitle}</Text>
                    </Card>

                    <Descriptions
                        title={t('user_list.details')}
                        bordered
                        column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                        size="middle"
                        layout="vertical"
                    >
                        {items.map(item => (
                            <Descriptions.Item key={item.key} label={item.label} span={item.span || 1}>
                                {item.children}
                            </Descriptions.Item>
                        ))}
                    </Descriptions>

                    <Card title={t('user_list.perm_title')}>
                        {!permissionsProfile?.permissions?.length ? (
                            <Text type="secondary">-</Text>
                        ) : (
                            <Space size="small" wrap>
                                {permissionsProfile.permissions.map((permission) => (
                                    <Tag key={permission.key}>
                                        {currentLanguage === 'ar'
                                            ? permission.name_ar || permission.name_en
                                            : permission.name_en || permission.name_ar}
                                    </Tag>
                                ))}
                            </Space>
                        )}
                    </Card>
                </Space>

            </Card>
            <Modal
                title={t('translation.confirm_delete_user_title')}
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
                        disabled={!isNameMatch || isActionLoading}
                        loading={isActionLoading}
                    >
                        {t('translation.delete')}
                    </Button>,
                ]}
            >
                <Typography.Paragraph>
                    {t('translation.delete_prompt_user', { name: requiredName })}
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
                        {t('translation.delete_name_mismatch_warning_user')}
                    </Typography.Text>
                )}
            </Modal>
            <UserFormModal
                isVisible={isEditModalVisible}
                onClose={handleCloseEditModal}
                userData={user} 
                role={role}
            />
        </>
    );
};

export default UserViewPage;
