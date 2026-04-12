import React from 'react';
import { Timeline, Card, Typography, FloatButton, Flex, Space } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activities: any[];
    zoom: number;
    handlers: {
        handleZoomIn: () => void;
        handleZoomOut: () => void;
        handleResetZoom: () => void;
    };
    getIcon: (type: string) => React.ReactNode;
    getColor: (type: string) => string;
}

const TicketHistoryTimeline: React.FC<Props> = ({ activities, zoom, handlers, getIcon, getColor }) => {
    return (
        <>
            <div style={{ maxWidth: `${800 * zoom}px`, margin: '0 auto', transition: 'all 0.3s ease' }}>
                <Timeline
                    mode="alternate"
                    items={activities.map((item) => ({
                        color: getColor(item.type),
                        dot: getIcon(item.type),
                        children: (
                            <Card size="small" style={{ textAlign: 'left', fontSize: `${14 * zoom}px` }}>
                                <Typography.Text strong style={{ display: 'block', fontSize: `${16 * zoom}px` }}>
                                    {item.title}
                                </Typography.Text>
                                <Typography.Paragraph type="secondary" style={{ fontSize: `${12 * zoom}px`, marginBottom: 8 * zoom }}>
                                    <Flex vertical gap={4} dir="ltr" style={{ alignItems: 'flex-start' }}>
                                        <Space size={6} style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px' }}>
                                            <CalendarOutlined />
                                            <span dir='ltr'>{dayjs(item.date).format('DD-MM-YYYY')}</span>
                                            <ClockCircleOutlined />
                                            <span dir='ltr'>{dayjs(item.date).format('h:mm A')}</span>
                                        </Space>
                                    </Flex>
                                </Typography.Paragraph>
                                <Typography.Text style={{ fontSize: `${14 * zoom}px` }}>
                                    {item.content}
                                </Typography.Text>
                            </Card>
                        ),
                    }))}
                />
            </div>
            <FloatButton.Group shape="circle" style={{ right: 24 }}>
                <FloatButton icon={<ZoomInOutlined />} onClick={handlers.handleZoomIn} />
                <FloatButton icon={<ZoomOutOutlined />} onClick={handlers.handleZoomOut} />
                <FloatButton icon={<ReloadOutlined />} onClick={handlers.handleResetZoom} />
            </FloatButton.Group>
        </>
    );
};

export default TicketHistoryTimeline;