/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { Line } from '@ant-design/charts';
import { Spin, Flex, Empty } from 'antd';
import type { TicketDashboardItem } from '../../Types/reports';
import { useTranslation } from 'react-i18next';

interface Props {
    data?: TicketDashboardItem[];
    loading: boolean;
}

const DashboardLineChart: React.FC<Props> = ({ data, loading }) => {
    const { t } = useTranslation();

    const flattenedData = useMemo(() => {
        return data?.flatMap(ticket =>
            ticket.statistics.map(stats => ({
                category: ticket.ticketType,
                period: stats.period,
                value: stats.value
            }))
        ) || [];
    }, [data]);

    const config = {
        data: flattenedData,
        xField: 'period',
        yField: 'value',
        colorField: 'category',
        smooth: true,
        animation: {
            appear: { animation: 'path-in', duration: 1000 },
        },
        color: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f'],
        point: { size: 4, shape: 'circle' },
        legend: { position: 'top' as const },
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" style={{ height: 400 }}>
                <Spin size="large" />
            </Flex>
        );
    }

    if (flattenedData.length === 0) {
        return (
            <Flex justify="center" align="center" style={{ height: 400 }}>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t('common.no_data')}
                />
            </Flex>
        );
    }

    return (
        <div style={{ height: 400 }}>
            <Line {...config} />
        </div>
    );
};

export default DashboardLineChart;