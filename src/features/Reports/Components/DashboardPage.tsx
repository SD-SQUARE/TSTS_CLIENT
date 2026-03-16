/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button, Card, DatePicker, Flex, Input, Select, Space, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDashboardCharts, useReportsList } from '../Hooks/useReports';
import DashboardLineChart from './Dashboard/DashboardLineChart';
import ReportCardList from './Dashboard/ReportCardList';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;


const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');

    const [dates, setDates] = useState<[string, string]>([
        dayjs().startOf('year').format('YYYY-MM-DD'),
        dayjs().endOf('year').format('YYYY-MM-DD')
    ]);
    const [periodType, setPeriodType] = useState<string>('month');

    const { data: chartData, isLoading: isChartLoading, dataUpdatedAt, refetch, isRefetching } = useDashboardCharts({
        startDate: dates[0],
        endDate: dates[1],
        periodType
        }
    );
    const { data: reportsData, isLoading: isReportsLoading } = useReportsList(search);

    return (
        <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Title level={2}>{t('dashboard.welcome')}</Title>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>

                <Card
                    title={t('dashboard.trends')}
                    extra={
                        <Space size="middle">
                            <Select
                                value={periodType}
                                onChange={setPeriodType}
                                style={{ width: 120 }}
                                options={[
                                    { value: 'day', label: t('period.daily') },
                                    { value: 'month', label: t('period.monthly') },
                                    { value: 'year', label: t('period.yearly') },
                                ]}
                            />
                            <RangePicker
                                picker={periodType === 'year' ? 'year' : periodType === 'month' ? 'month' : 'date'}
                                defaultValue={[dayjs(dates[0]), dayjs(dates[1])]}
                                onChange={(vals) => {
                                    if (vals) {
                                        setDates([
                                            vals[0]!.startOf(periodType as any).format('YYYY-MM-DD'),
                                            vals[1]!.endOf(periodType as any).format('YYYY-MM-DD')
                                        ]);
                                    }
                                }}
                            />
                        </Space>
                    }
                >
                    <DashboardLineChart data={chartData} loading={isChartLoading} />
                </Card>

                <Card
                    title={t('dashboard.reports_overview')}
                    bordered={false}
                >
                    <Flex justify="center" style={{ marginBottom: 24 }}>
                        <Search
                            placeholder={t('common.search_placeholder')}
                            onSearch={(val) => setSearch(val)}
                            allowClear
                            style={{ width: '100%', maxWidth: 600 }}
                            size="large"
                        />
                    </Flex>
                    <ReportCardList reports={reportsData} loading={isReportsLoading} />
                </Card>

            </Space>
        </div>
    );
};

export default DashboardPage;