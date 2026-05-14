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
        if (!data || data.length === 0) return [];

        // Collect all unique periods across all specializations and sort them
        const allPeriods = Array.from(
            new Set(data.flatMap(ticket => ticket.statistics.map(s => s.period)))
        ).sort(); // lexicographic sort works for YYYY, YYYY-MM, YYYY-MM-DD formats

        // For each specialization, fill in missing periods with 0
        return data.flatMap(ticket => {
            const periodMap = new Map(ticket.statistics.map(s => [s.period, s.value]));
            return allPeriods.map(period => ({
                category: ticket.ticketType,
                period,
                value: periodMap.get(period) ?? 0,
            }));
        });
    }, [data]);

    const config = {
        data: flattenedData,
        xField: 'period',
        yField: 'value',
        sizeField: 3,
        colorField: 'category',
        smooth: true,
        animation: {
            appear: { animation: 'path-in', duration: 1000 },
        },
        point: { size: 4, shape: 'circle' },
        label: {
            content: (d: any) => d.value > 0 ? `${d.value}` : '',
            style: {
                fill: '#595959',
                fontSize: 11,
                fontWeight: 600,
                textBaseline: 'bottom' as const,
            },
            offset: 10,
            layout: [{ type: 'hide-overlap' }],
        },
        axis: {
            x: {
                label: {
                    autoRotate: true,
                    autoHide: false,
                },
            },
        },
        legend: {
            position: 'top' as const,
        },
        tooltip: {
            title: (d: any) => d.period,
        },
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
        <div style={{ height: 320, direction: 'ltr' }}>
            <Line {...config} />
        </div>
    );
};

export default DashboardLineChart;