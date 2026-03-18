import React from 'react';
import { Card, Flex, Space, Typography } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ReportItem } from '../../Types/reports';

const { Paragraph } = Typography;

interface ReportCardProps {
    report: ReportItem;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
    const navigate = useNavigate();

    return (
        <>
            <style>{`
                .dark-hover-card {
                    transition: all 0.3s ease-in-out !important;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06) !important;
                }
                .dark-hover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2) !important;
                    
                }
            `}</style>
            <Card
                className='dark-hover-card'
                hoverable
                onClick={() => navigate(`/reports/${report.id}`)}
                style={{
                    height: '100%',
                    borderRadius: '12px',
                    borderTop: '4px solid #1677ff',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.067)'
                }}
            >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Flex align="center" gap="small">
                        <div style={{
                            padding: '8px',
                            backgroundColor: '#e6f4ff',
                            borderRadius: '8px',
                            display: 'flex'
                        }}>
                            <BarChartOutlined style={{ color: '#1677ff', fontSize: '20px' }} />
                        </div>
                        <Typography.Title level={5} style={{ margin: 0 }}>
                            {report.title}
                        </Typography.Title>
                    </Flex>

                    <Paragraph ellipsis={{ rows: 3 }} type="secondary">
                        {report.description}
                    </Paragraph>
                </Space>
            </Card>
        </>
    );
};

export default ReportCard;