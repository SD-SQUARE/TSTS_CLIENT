/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, Row, Col, Space, DatePicker, Select, Button } from 'antd';
import { FilterOutlined, DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface Props {
    periodType: string;
    dates: [string | undefined, string | undefined];
    onDateChange: (dates: [string, string] | [undefined, undefined]) => void;
    onPeriodChange: (value: string) => void;
    onDownload: () => void;
    downloadLoading?: boolean;
}

const ReportFilterBar: React.FC<Props> = ({
    periodType,
    dates,
    onDateChange,
    onPeriodChange,
    onDownload,
    downloadLoading
}) => {
    const { t } = useTranslation();

    const pickerValue: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [
        dates[0] ? dayjs(dates[0]) : null,
        dates[1] ? dayjs(dates[1]) : null,
    ];

    return (
        <Card>
            <Row gutter={16} align="middle" justify="space-between">
                <Col>
                    <Space size="middle">
                        <Space>
                            <FilterOutlined />
                            <RangePicker
                                value={pickerValue}
                                picker={periodType === 'year' ? 'year' : periodType === 'month' ? 'month' : 'date'}
                                allowClear={true}
                                onChange={(vals) => {
                                    if (!vals || !vals[0] || !vals[1]) {
                                        onDateChange([undefined, undefined]);
                                        return;
                                    }
                                    const start = vals[0].startOf(periodType as any).format('YYYY-MM-DD');
                                    const end = vals[1].endOf(periodType as any).format('YYYY-MM-DD');
                                    onDateChange([start, end]);
                                }}
                            />
                        </Space>
                        <Select
                            value={periodType}
                            onChange={onPeriodChange}
                            style={{ width: 120 }}
                            options={[
                                { value: 'day', label: t('period.daily') },
                                { value: 'month', label: t('period.monthly') },
                                { value: 'year', label: t('period.yearly') },
                            ]}
                        />
                    </Space>
                </Col>

                <Col>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={onDownload}
                        loading={downloadLoading}
                    >
                        {t('common.download')}
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default ReportFilterBar;