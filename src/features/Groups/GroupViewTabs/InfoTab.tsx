

import React from 'react';
import { Descriptions, Space, Typography, Tag } from 'antd';


import { useGroupDetail } from '../Hooks/useGroupForm';
import type { NamedObject } from '../Types/groups';
import i18n from '../../../i18n';



const { Text } = Typography;


const renderMembers = (members: any ,t = undefined) => {
    if (!members || members.length === 0) {
        return <Text disabled>-</Text>;
    }
    return (
        <Space size={[0, 8]} wrap>
            {members.map(member => (

                <Tag key={member.id} color="blue" style={{ margin: '4px 0' }}>
                    {t == undefined ?
                        `${member.name}` : i18n.language === "en" ? `${member.firstName.en}` : `${member.firstName.ar}`}
                </Tag>
            ))}
        </Space>
    );
};


const renderTeamLeader = (leader: any) => {
    if (!leader) {
        return <Text disabled>-</Text>;
    }

    return <Tag color="green">{
        i18n.language === "en" ?
            leader.firstName.en
            : leader.firstName.ar
    }</Tag>;
};

interface InfoTabProps { group: NonNullable<ReturnType<typeof useGroupDetail>['data']>; currentLanguage: string; t: (key: string) => string; }


const InfoTab: React.FC<InfoTabProps> = ({ group, t }) => {

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


        { key: 'team_leader', label: t('translation.team_leader'), children: renderTeamLeader(group.team_leader) },


        { key: 'specializations', label: t('translation.specializations'), children: renderMembers(group.specializations) },
    ];

    return (
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
    );
};

export default InfoTab;