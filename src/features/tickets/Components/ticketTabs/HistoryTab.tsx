
import React, { useEffect, useState } from 'react';
import { Typography, Card, Empty, Spin, Button, Space, FloatButton, Segmented,  DatePicker, Flex } from 'antd';
import {
    ClockCircleOutlined, CheckCircleOutlined, SyncOutlined,
    ExclamationCircleOutlined, RollbackOutlined, ZoomInOutlined,
    ZoomOutOutlined, ReloadOutlined,
    TableOutlined,
    HistoryOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTicketActivities, useTimelineZoom } from '../../Hooks/useTicket';
import TicketHistoryTimeline from './HistoryTabs/TimelineView';
import TicketHistoryTable from './HistoryTabs/TableView';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const TicketHistoryTab: React.FC = () => {
    const { t } = useTranslation();
    const { id: ticketId } = useParams();

    const [userSearch, setUserSearch] = useState<string | undefined>(undefined);
    const [actionSearch, setActionSearch] = useState<string | undefined>(undefined);

    const [viewType, setViewType] = useState<'timeline' | 'table'>('table');
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    const { zoom, handleZoomIn, handleZoomOut, handleResetZoom } = useTimelineZoom(1);
    const { data: activities, isLoading, refetch } = useTicketActivities(ticketId, {user_id: userSearch,
        type: actionSearch,});

    useEffect(() => {
        refetch();
    }, [refetch, userSearch, actionSearch]);

    const getActivityIcon = (type: string) => {
        const iconSize = 16 * zoom;
        switch (type) {
            case 'reopened': return <RollbackOutlined style={{ fontSize: iconSize }} />;
            case 'closed': return <CheckCircleOutlined style={{ fontSize: iconSize }} />;
            case 'pending': return <ClockCircleOutlined style={{ fontSize: iconSize }} />;
            case 'error': return <ExclamationCircleOutlined style={{ fontSize: iconSize }} />;
            default: return <SyncOutlined style={{ fontSize: iconSize }} />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'reopened': return 'orange';
            case 'closed': return 'green';
            case 'pending': return 'blue';
            case 'error': return 'red';
            default: return 'gray';
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredActivities = activities?.filter((item: any) => {

        const matchesDate = !dateRange || (
            dayjs(item.createdAt).isAfter(dateRange[0].startOf('day')) &&
            dayjs(item.createdAt).isBefore(dateRange[1].endOf('day'))
        );

        return  matchesDate;
    });


    if (isLoading) return <Spin style={{ display: 'block', margin: '50px auto' }} />;
    if (!activities || activities.length === 0) return <Empty description={t('common.noHistory')} />;

    

    return (
        <div style={{ padding: '24px', position: 'relative' }}>
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'end',
                gap: '12px',
                marginBottom: 20
            }}>
                <Space  align='end'>
                    <Flex gap="small" wrap="wrap" justify="end">
                        <RangePicker
                        placeholder={[t('common.startDate'), t('common.endDate')]}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={(dates) => setDateRange(dates as any)}
                            style={{ width: 210 }}
                        />
                    </Flex>
                    <Segmented options={[
                        { value: 'table', icon: <TableOutlined /> },
                        { value: 'timeline', icon: <HistoryOutlined /> },
                    ]} value={viewType} onChange={(value) => setViewType(value as 'timeline' | 'table')} />
                    {viewType === 'timeline' && (
                        <Card size="small" style={{ borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <Space>
                                <Button type="text" icon={<ZoomOutOutlined />} onClick={handleZoomOut} disabled={zoom <= 0.6} />
                                <Typography.Text strong>{Math.round(zoom * 100)}%</Typography.Text>
                                <Button type="text" icon={<ZoomInOutlined />} onClick={handleZoomIn} disabled={zoom >= 2} />
                                <Button type="text" icon={<ReloadOutlined />} onClick={handleResetZoom} />
                            </Space>
                        </Card>
                    )}
                </Space>
            </div>

            {viewType === 'timeline' ? (

                <TicketHistoryTimeline
                    activities={filteredActivities}
                    zoom={zoom}
                    handlers={{ handleZoomIn, handleZoomOut, handleResetZoom }}
                    getIcon={getActivityIcon}
                    getColor={getActivityColor}
                />
            ) : (
                <TicketHistoryTable
                    activities={filteredActivities}
                    getIcon={getActivityIcon}
                    getColor={getActivityColor}
                    onUserSearch={setUserSearch}
                    onActionSearch={setActionSearch}
                    currentFilters={{ user: userSearch, action: actionSearch }}
                />
            )
            }

            {viewType === 'timeline' && (
                <FloatButton.Group shape="circle" style={{ right: 24 }}>
                    <FloatButton icon={<ZoomInOutlined />} onClick={handleZoomIn} />
                    <FloatButton icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
                    <FloatButton icon={<ReloadOutlined />} onClick={handleResetZoom} />
                </FloatButton.Group>
            )}
        </div>
    );
};

export default TicketHistoryTab;