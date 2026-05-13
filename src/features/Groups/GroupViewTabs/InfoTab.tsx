

import React from 'react';
import { Descriptions, Space, Typography, Tag, Tooltip, Button, Divider } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import { useGroupDetail } from '../Hooks/useGroupForm';
import i18next from 'i18next';



const { Text } = Typography;

const getMemberRoleTag = (member: any, t: (key: string, options?: any) => string) => {
    const normalizedType = `${member.user_type || ''}`.toLowerCase();
    if (!normalizedType) return null;

    const isTechnician = normalizedType.includes('technician');
    return (
        <Tag color={isTechnician ? 'blue' : 'green'} style={{ marginInlineStart: 4, marginInlineEnd: 0 }}>
            {isTechnician
                ? t('translation.technician', { defaultValue: 'Technician' })
                : t('translation.admin', { defaultValue: 'Admin' })}
        </Tag>
    );
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderMembers = (members: any, t: (key: string, options?: any) => string) => {
    if (!members || members.length === 0) {
        return <Text disabled>-</Text>;
    }
    return (
        <Space size={[0, 8]} wrap>
            {members.map(member => (
                <Space key={member.id} size={4}>
                    <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                        {member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim()}
                    </Tag>
                    {getMemberRoleTag(member, t)}
                </Space>
            ))}
        </Space>
    );
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderSpecMembers = (members: any) => {
    // console.log(members);
    if (!members || members.length === 0) {
        return <Text disabled>-</Text>;
    }
    return (
        <Space size={[0, 8]} wrap>
            {members.map(member => (

                <Tag key={member.id} color="blue" style={{ marginInlineEnd: '4px' }}>
                    {member.name}
                </Tag>
            ))}
        </Space>
    );
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderTeamLeads = (leaders: any[]) => {
    if (!leaders || leaders.length === 0) {
        return <Text disabled>-</Text>;
    }

    return (
        <Space size={[0, 8]} wrap>
            {leaders.map((leader) => (
                <Tag key={leader.id} color="green" style={{ marginInlineEnd: '4px' }}>
                    {leader.name}
                </Tag>
            ))}
        </Space>
    );
};

interface InfoTabProps { group: NonNullable<ReturnType<typeof useGroupDetail>['data']>; currentLanguage: string; t: (key: string, options?: any) => string; onEdit: () => void }


const InfoTab: React.FC<InfoTabProps> = ({ group, t, onEdit }) => {

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

    const items = [
        { key: 'name_ar', label: t('translation.name_ar'), children: group.name_ar || '-' },
        { key: 'name_en', label: t('translation.name_en'), children: group.name_en || '-' },
        { key: 'description_ar', label: t('translation.description_ar'), children: group.description_ar || '-' },
        { key: 'description_en', label: t('translation.description_en'), children: group.description_en || '-' },
        { key: 'color', label: t('translation.color'), children: colorDescription },


        { key: 'heads', label: t('translation.heads'), children: renderMembers(group.heads,t) },


        { key: 'team_leads', label: t('translation.team_leads', t('translation.team_leader')), children: renderTeamLeads(group.team_leads) },


        { key: 'specializations', label: t('translation.specializations'), children: renderSpecMembers(group.specializations) },
        {
            key: 'teams',
            label: t('translation.teams', 'Teams'),
            children: group.teams?.length ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                    {group.teams.map((team) => (
                        <div key={team.id}>
                            <Text strong>{i18next.language.startsWith('ar') ? team.name_ar : team.name_en}</Text>
                            <Text type="secondary" style={{ marginInlineStart: 8 }}>
                                {t('translation.team_members_count', { count: team.members_count || team.technicians?.length || 0 })}
                            </Text>
                            <Divider style={{ margin: '8px 0' }} />
                        </div>
                    ))}
                </Space>
            ) : (
                <Text disabled>-</Text>
            ),
        },
    ];

    return (
        <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            size="middle"
            layout="vertical"
            extra={
                <Tooltip title={t('translation.edit')} placement='bottom'>
                    <Button 
                        icon={<EditOutlined />}
                        onClick={onEdit} 
                    />
                </Tooltip>
            }
        >
            {items.map(item => (
                <Descriptions.Item key={item.key} label={item.label}>
                    {item.children}
                </Descriptions.Item>
            ))}
        </Descriptions>
    );
};

export default InfoTab;
