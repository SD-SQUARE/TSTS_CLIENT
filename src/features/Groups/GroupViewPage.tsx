import React from 'react';
import { Card, Descriptions, Space, Typography, Spin, Button, Result } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons'; 
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGroupDetail } from './Hooks/useGroupForm'; 
import type { NamedObject } from './Types/groups';
import AvatarDisplay from '../../components/AvatarDisplay';

const { Text, Title } = Typography;

const renderMembers = (members: NamedObject[] | undefined) => {
    if (!members || members.length === 0) {
        return <Text disabled>-</Text>;
    }
    return (
        <Space size="small" wrap>
            {members.map(member => (
                <AvatarDisplay key={member.id} member={member} />
            ))}
        </Space>
    );
};

const renderTeamLeader = (leader: NamedObject | undefined) => {
    if (!leader) {
        return <Text disabled>-</Text>;
    }
    return <AvatarDisplay member={leader} />;
};

const GroupViewPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    
    const { id } = useParams<{ id: string }>(); 
    const groupId = id; 

    const { data: group, isLoading, isError } = useGroupDetail(groupId);
    
    const currentLanguage = i18n.language;

    const handleBack = () => {
        navigate('/groups'); 
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
    
    const colorDescription = group.color ? (
        <Space>
            <div style={{ 
                width: 16, 
                height: 16, 
                backgroundColor: group.color, 
                borderRadius: 4, 
                border: '1px solid #ddd' 
            }} />
            <Text code>{group.color}</Text>
        </Space>
    ) : <Text disabled>-</Text>;
    const titleColor = group.color || '#333';

    const items = [
        { key: 'name_ar', label: t('translation.name_ar'), children: group.name_ar || '-' },
        { key: 'name_en', label: t('translation.name_en'), children: group.name_en || '-' },
        { key: 'description_ar', label: t('translation.description_ar'), children: group.description_ar || '-' },
        { key: 'description_en', label: t('translation.description_en'), children: group.description_en || '-' },
        { key: 'color', label: t('translation.color'), children: colorDescription },
        { key: 'heads', label: t('translation.heads'), children: renderMembers(group.heads) },
        { key: 'team_leader', label: t('translation.team_leader'), children: renderTeamLeader(group.team_leader) },
        { key: 'specializations', label: t('translation.specializations'), children: renderMembers(group.specializations) },
    ];

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
                        {t('group_form.view_title')}
                        : <span style={{color: titleColor, fontStyle: 'italic'}}>
                            {group[`name_${currentLanguage}`]}
                            </span>
                    </Title>
                </Space>
            }
            style={{ margin: 20 }}
        >
            <Descriptions 
                bordered 
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                size="middle"
                layout="vertical"
            >
                {items.map(item => (
                    <Descriptions.Item key={item.key} label={item.label}>
                        {item.children}
                    </Descriptions.Item>
                ))}
            </Descriptions>
        </Card>
    );
};

export default GroupViewPage;