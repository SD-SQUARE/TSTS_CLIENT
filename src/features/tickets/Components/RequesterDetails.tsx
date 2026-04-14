import React from 'react';
import { Collapse, Typography, Avatar, Tag, Flex, Divider, Skeleton, Card } from 'antd';
import { 
    UserOutlined, MailOutlined, PhoneOutlined, BankOutlined, 
    SolutionOutlined, 
    ApartmentOutlined,
    MobileOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../Hooks/useTicket';

interface RequesterDetailsProps {
    requesterId: string;
}

const RequesterDetails: React.FC<RequesterDetailsProps> = ({ requesterId }) => {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    
    const { data: profile, isLoading } = useUserProfile(requesterId);

    if (isLoading) {
        return (
            <Card size="small" style={{ marginBottom: 16 }}>
                <Skeleton avatar active paragraph={{ rows: 2 }} />
            </Card>
        );
    }

    const fullName = isAr ? profile?.full_name_ar : profile?.full_name_en;
    const jobTitle = isAr ? profile?.job_ar : profile?.job_en;

    const mobile = profile?.contacts?.mobiles?.[0];
    const phone = profile?.contacts?.phones?.[0];

    return (
        <Collapse 
            ghost 
            expandIconPosition="end" 
            style={{ 
                marginBottom: '16px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #f0f0f0',
                borderLeft: '4px solid #52c41a' 
            }}
        >
            <Collapse.Panel
                header={
                    <Flex align="center" gap="middle">
                        <Avatar
                            src={profile?.image}
                            size={40}
                            icon={<UserOutlined />}
                            style={{ backgroundColor: '#52c41a', flexShrink: 0 }}
                        />
                        <Flex vertical style={{ overflow: 'hidden' }}>
                            <Flex align="center" gap="small" wrap="wrap">
                                <Typography.Text strong style={{ fontSize: '14px' }}>
                                    {fullName}
                                </Typography.Text>
                                <Typography.Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                                    ({t('tickets.requester')})
                                </Typography.Text>
                            </Flex>
                            <Flex gap={4} align="center">
                                <MailOutlined style={{ fontSize: '11px', color: '#8c8c8c' }} />
                                <Typography.Text type="secondary" style={{ fontSize: '12px' }} copyable>
                                    {profile?.email}
                                </Typography.Text>
                            </Flex>
                        </Flex>
                    </Flex>
                }
                key="1"
            >
                <div style={{ padding: '0 4px 8px 56px' }}>
                    <Flex vertical gap="middle">
                        {jobTitle && (
                            <div style={{ marginBottom: 4 }}>
                                <Tag color="orange" icon={<SolutionOutlined />}>
                                    {jobTitle}
                                </Tag>
                            </div>
                        )}

                        <Divider orientation="horizontal" plain style={{ margin: '8px 0', fontSize: '12px' }}>
                            <Typography.Text type="secondary">{t('tickets.contact_info')}</Typography.Text>
                        </Divider>

                        <Flex gap="large" wrap="wrap">
                            {mobile && (
                                <Flex gap={8} align="center">
                                    <MobileOutlined style={{ color: '#8c8c8c' }} />
                                    <Typography.Text type="secondary" style={{ fontSize: '13px' }} copyable>
                                        {mobile}
                                    </Typography.Text>
                                </Flex>
                            )}
                            {phone && (
                                <Flex gap={8} align="center">
                                    <PhoneOutlined rotate={90} style={{ color: '#8c8c8c' }} />
                                    <Typography.Text type="secondary" style={{ fontSize: '13px' }} copyable>
                                        {phone}
                                    </Typography.Text>
                                </Flex>
                            )}
                        </Flex>

                        <Divider orientation="horizontal" plain style={{ margin: '8px 0', fontSize: '12px' }}>
                            <Typography.Text type="secondary">{t('tickets.organization_details')}</Typography.Text>
                        </Divider>

                        <Flex vertical gap="small">
                            {profile?.university?.name && (
                                <Flex gap={8} align="center">
                                    <BankOutlined style={{ color: '#8c8c8c' }} />
                                    <Typography.Text style={{ fontSize: '13px' }}>
                                        {profile.university.name}
                                    </Typography.Text>
                                </Flex>
                            )}
                            {profile?.domain?.name && (
                                <Flex gap={8} align="center">
                                    <ApartmentOutlined style={{ color: '#8c8c8c' }} />
                                    <Typography.Text style={{ fontSize: '13px' }}>
                                        {profile.domain.name}
                                    </Typography.Text>
                                </Flex>
                            )}
                            {profile?.department?.name && (
                                <Flex gap={8} align="center">
                                    <ApartmentOutlined style={{ color: '#8c8c8c' }} />
                                    <Typography.Text style={{ fontSize: '13px' }}>
                                        {profile.department}
                                    </Typography.Text>
                                </Flex>
                            )}
                        </Flex>
                    </Flex>
                </div>
            </Collapse.Panel>
        </Collapse>
    );
};

export default RequesterDetails;