
import React, { useEffect, useState } from 'react';
import {  Typography, Card, Empty, Spin, Button, Space, FloatButton,  Segmented } from 'antd';
import {
    ClockCircleOutlined, CheckCircleOutlined, SyncOutlined,
    ExclamationCircleOutlined, RollbackOutlined, ZoomInOutlined,
    ZoomOutOutlined, ReloadOutlined,
    TableOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTicketActivities, useTimelineZoom } from '../../Hooks/useTicket';
import TicketHistoryTimeline from './HistoryTabs/TimelineView';
import TicketHistoryTable from './HistoryTabs/TableView';


const TicketHistoryTab: React.FC = () => {
    const { t } = useTranslation();
    const { id: ticketId } = useParams();

    const [viewType, setViewType] = useState<'timeline' | 'table'>('timeline');

    const { zoom, handleZoomIn, handleZoomOut, handleResetZoom } = useTimelineZoom(1);
    const { data: activities, isLoading, refetch } = useTicketActivities(ticketId);

    useEffect(() => {
        refetch();
    }, [refetch]);

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
                <Space direction='vertical' align='end'>
                    <Segmented options={[
                        { value: 'timeline', icon: <HistoryOutlined /> },
                        { value: 'table', icon: <TableOutlined /> },
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
                    activities={activities} 
                    zoom={zoom} 
                    handlers={{ handleZoomIn, handleZoomOut, handleResetZoom }}
                    getIcon={getActivityIcon}
                    getColor={getActivityColor}
                />
            ) : (
                <TicketHistoryTable 
                    activities={activities} 
                    getIcon={getActivityIcon}
                    getColor={getActivityColor}
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