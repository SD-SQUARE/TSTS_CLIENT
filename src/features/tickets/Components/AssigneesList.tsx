import React from 'react';
import { Collapse, Typography, List, Card, Avatar, Tag, Skeleton, Space, Flex } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../Hooks/useTicket';
import { useParams } from 'react-router-dom';

interface Participant {
    id: string;
    name?: string;
    image?: string;
}

const AssigneeItem: React.FC<{ id: string; roleLabel: string; isRequester?: boolean }> = ({ id, roleLabel, isRequester }) => {
    const { i18n } = useTranslation();
    const { data: profile, isLoading } = useUserProfile(id);

    if (isLoading) {
        return <Skeleton avatar active paragraph={{ rows: 2 }} style={{ padding: '8px' }} />;
    }

    const isAr = i18n.language === 'ar';
    const fullName = isAr
        ? `${profile?.first_name_ar} ${profile?.last_name_ar}`
        : `${profile?.first_name_en} ${profile?.last_name_en}`;

    const job = isAr ? profile?.job_ar : profile?.job_en;

    return (
        <Card
            size="small"
            style={{
                marginBottom: 8,
                borderRadius: '8px',
                borderLeft: isRequester ? '4px solid #1677ff' : '1px solid #f0f0f0'
            }}
            hoverable
        >
            <Card.Meta
                avatar={
                    <Avatar
                        src={profile?.image}
                        size={40}
                        icon={<UserOutlined />}
                    />
                }
                title={
                    <Flex justify="space-between" align="center">
                        <Typography.Text strong style={{ fontSize: '14px' }}>{fullName}</Typography.Text>
                        <Tag color={isRequester ? 'blue' : 'default'} style={{ fontSize: '0.8em', marginInlineEnd: 0 }}>
                            {roleLabel}
                        </Tag>
                    </Flex>
                }
                description={
                    <div style={{ marginTop: 2 }}>
                        <Typography.Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                           <Tag color="orange"> {job} </Tag>
                        </Typography.Text>
                        <Space size={8} wrap>
                            {profile?.email && (
                                <Flex gap={8}>
                                    <MailOutlined />
                                    <Typography.Text type="secondary" style={{ fontSize: '11px' }} copyable>
                                        {profile.email}
                                    </Typography.Text>
                                </Flex>
                            )}
                            {profile?.contacts?.mobiles?.[0] && (
                                <Flex  gap={8}>
                                    <PhoneOutlined />
                                    <Typography.Text type="secondary" style={{ fontSize: '11px' }} copyable >
                                        {profile.contacts.mobiles[0]}
                                    </Typography.Text>
                                </Flex >
                            )}
                        </Space>
                    </div>
                }
            />
        </Card>
    );
};

interface AssigneeListProps {
    assignees: Participant[];
    requesterId?: string; 
}

const AssigneeList: React.FC<AssigneeListProps> = ({ assignees, requesterId }) => {
    const { t } = useTranslation();
    const { role } = useParams(); 
    const defaultOpenKey = role !== 'requester' ? ['1'] : [];

    return (
        <Collapse ghost expandIconPosition="end" defaultActiveKey={defaultOpenKey}>
            <Collapse.Panel
                header={
                    <Typography.Text strong>
                        {t('tickets.participants')} ({(requesterId ? 1 : 0) + (assignees?.length || 0)})
                    </Typography.Text>
                }
                key="1"
            >
                {requesterId && (
                    <div style={{ marginBottom: 16 }}>
                        <AssigneeItem
                            id={requesterId}
                            roleLabel={t('tickets.requester')}
                            isRequester={true}
                        />
                    </div>
                )}
                {assignees?.length > 0 && (
                    <List
                        dataSource={assignees}
                        renderItem={(item) => (
                            <AssigneeItem
                                id={item.id}
                                roleLabel={t('tickets.techs')}
                            />
                        )}
                    />
                )}
            </Collapse.Panel>
        </Collapse>
    );
};

export default AssigneeList;