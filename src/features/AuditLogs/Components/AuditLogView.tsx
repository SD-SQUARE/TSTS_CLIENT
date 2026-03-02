import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Flex, Typography, Space, Spin } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useAuditLogDetails } from '../Hooks/useAuditLogs';
import { useTranslation } from 'react-i18next';
import AuditLogDetails from './AuditViewTables/AuditLogDetails';
import AuditLogStepsTable from './AuditViewTables/AuditLogStepsTable';


const AuditLogView: React.FC = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data, isLoading } = useAuditLogDetails(id!);

    if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

    return (
        <div style={{ padding: '20px' }}>
            <Flex align="center" gap="middle" style={{ marginBottom: '20px' }}>
                <Button
                    shape="circle"
                    icon={<LeftOutlined />}
                    onClick={() => navigate(-1)}
                />
                <Typography.Title level={4} style={{ margin: 0 }}>
                    {t('audit.details')}
                </Typography.Title>
            </Flex>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <AuditLogDetails data={data} />

                <AuditLogStepsTable 
                    steps={data?.steps} 
                    metadata={data?.metadata} 
                />
            </Space>
        </div>
    );
};

export default AuditLogView;