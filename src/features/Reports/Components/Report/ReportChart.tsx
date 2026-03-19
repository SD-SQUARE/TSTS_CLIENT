import React from 'react';
import { Card, Spin, Flex, Empty } from 'antd';
import { Line } from '@ant-design/charts';
import type { TicketStatistic } from '../../Types/reports';
import { useTranslation } from 'react-i18next';

interface Props {
    data?: TicketStatistic[];
    loading: boolean;
    title: string;
}

const ReportChart: React.FC<Props> = ({ data, loading, title }) => {
    const { t } = useTranslation();

    const config = {
        data: data || [],
        xField: 'period',
        yField: 'value',
        smooth: true,
        point: { size: 5, shape: 'circle' },
        color: '#1677ff',
        animation: { appear: { animation: 'path-in', duration: 800 } },
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Flex justify="center" align="center" style={{ height: 350 }}>
                    <Spin />
                </Flex>
            );
        }

        if (!data || data.length === 0) {
            return (
                <Flex justify="center" align="center" style={{ height: 350 }}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={t('common.no_data')}
                    />
                </Flex>
            );
        }

        return (
            <div style={{ height: 350 }}>
                <Line {...config} />
            </div>
        );
    };

    return (
        <Card title={title}>
            {renderContent()}
        </Card>
    );
};

export default ReportChart;