import React from 'react';
import { Card, Descriptions, Space, Typography, Spin, Button, Result, Tag, Avatar } from 'antd';
import { ArrowLeftOutlined, MailOutlined, IdcardOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserDetail } from '../Hooks/useUsers';
import type { Lookup } from '../Types/users';
import AvatarDisplay from '../../../components/AvatarDisplay';

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
    // return (
    //     <Space size="small" wrap>
    //         {department.filter(c => c.trim() !== '').map((dept, index) => (
    //             <Tag key={index} icon={<HomeOutlined />}>
    //                 {dept}
    //             </Tag>
    //         ))}
    //     </Space>
    // );
};

const UserViewPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const { role, id } = useParams<{ role: string; id: string }>();
    const userId = id;

    const { data: user, isLoading, isError } = useUserDetail(role!, userId);

    const currentLanguage = i18n.language;

    const handleBack = () => {
        navigate(`/users/${role}`);
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

    const fullName = `${user[`first_name_${currentLanguage}`]} ${user[`mid_name_${currentLanguage}`] || ''} ${user[`last_name_${currentLanguage}`]}`;
    const jobTitle = user[`job_${currentLanguage}`] || '-';

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

        { key: 'departments', label: t('user_list.department'), children: renderDepartmentList(user.departments, currentLanguage) },
        { key: 'groups', label: t('user_list.group'), children: renderLookupList(user.groups, currentLanguage), condition: role !== 'requesters' }, // Passing color for consistency
        // { key: 'specializations', label: t('user_list.specializations'), children: renderLookupList(user.specializations, currentLanguage) },
        // { key: 'permission_profile', label: t('user_list.perm_prof'), children: user.permission_profile?.name ?? '-' },
    ];
    const items = allItems.filter(item => item.condition === undefined || item.condition);
    return (
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
            style={{ margin: 20 }}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Card bordered={false} style={{ textAlign: 'center' }}>
                    <Avatar size={100} src={user.image} icon={<IdcardOutlined />} />
                    <Title level={3} style={{ margin: '10px 0 0' }}>{fullName}</Title>
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
            </Space>
        </Card>
    );
};

export default UserViewPage;