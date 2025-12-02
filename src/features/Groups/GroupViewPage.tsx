/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Card, Space, Typography, Spin, Button, Result, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TabsProps } from 'antd';


import { useGroupDetail } from './Hooks/useGroupForm';
import type { NamedObject } from './Types/groups';
import InfoTab from './GroupViewTabs/InfoTab';
import AssignTab from './GroupViewTabs/AssignTab';

const { Title } = Typography;


const GroupViewPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const groupId = id;
    const { data: group, isLoading, isError } = useGroupDetail(groupId);
    const currentLanguage = i18n.language;

    const handleBack = () => { navigate('/groups'); };

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
            children: <InfoTab group={group} currentLanguage={currentLanguage} t={t} />,
        },
        {
            key: 'assign',
            label: t('group_form.tab_assign') || 'Assign Users',
            children: <AssignTab groupId={groupId} initialMembers={group.members as NamedObject[]} t={t} />,
        },
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
                        {t('group_form.view_title') || 'Viewing Group'}
                        : <Typography.Text copyable style={{ color: titleColor, fontStyle: 'italic', fontSize: 20 }}>
                            {group[`name_${currentLanguage}`]}
                        </Typography.Text>
                    </Title>
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
    );
};

export default GroupViewPage;