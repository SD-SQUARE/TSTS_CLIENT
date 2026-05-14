import { Card, Col, Row, Statistic, Progress } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    HourglassOutlined,
    SafetyOutlined,
    RiseOutlined,
    FallOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface DashboardAnalytics {
    totalTickets: number;
    openTickets: number;
    closedTickets: number;
    inProgressTickets: number;
    pendingTickets: number;
    resolvedTickets: number;
    avgResolutionTimeHours: number;
    slaCompliance: number;
    slaViolated: number;
    ticketsCreatedToday: number;
    ticketsResolvedToday: number;
}

interface AnalyticsCardsProps {
    data?: DashboardAnalytics;
    loading?: boolean;
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ data, loading }) => {
    const { t } = useTranslation();

    const defaultData: DashboardAnalytics = {
        totalTickets: 0,
        openTickets: 0,
        closedTickets: 0,
        inProgressTickets: 0,
        pendingTickets: 0,
        resolvedTickets: 0,
        avgResolutionTimeHours: 0,
        slaCompliance: 100,
        slaViolated: 0,
        ticketsCreatedToday: 0,
        ticketsResolvedToday: 0,
    };

    const analytics = data || defaultData;

    return (
        <Row gutter={[16, 16]}>
            {/* Total Tickets */}
            <Col xs={24} sm={12} lg={6}>
                <Card loading={loading} bordered={false} style={{ background: '#f0f5ff' }}>
                    <Statistic
                        title={t('dashboard.analytics.total_tickets', { defaultValue: 'Total Tickets' })}
                        value={analytics.totalTickets}
                        prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Card>
            </Col>

            {/* Open Tickets */}
            <Col xs={24} sm={12} lg={6}>
                <Card loading={loading} bordered={false} style={{ background: '#fff7e6' }}>
                    <Statistic
                        title={t('dashboard.analytics.open_tickets', { defaultValue: 'Open Tickets' })}
                        value={analytics.openTickets}
                        prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                        valueStyle={{ color: '#faad14' }}
                    />
                </Card>
            </Col>

            {/* In Progress */}
            <Col xs={24} sm={12} lg={6}>
                <Card loading={loading} bordered={false} style={{ background: '#e6f7ff' }}>
                    <Statistic
                        title={t('dashboard.analytics.in_progress', { defaultValue: 'In Progress' })}
                        value={analytics.inProgressTickets}
                        prefix={<ClockCircleOutlined style={{ color: '#13c2c2' }} />}
                        valueStyle={{ color: '#13c2c2' }}
                    />
                </Card>
            </Col>

            {/* Closed Tickets */}
            <Col xs={24} sm={12} lg={6}>
                <Card loading={loading} bordered={false} style={{ background: '#f6ffed' }}>
                    <Statistic
                        title={t('dashboard.analytics.closed_tickets', { defaultValue: 'Closed Tickets' })}
                        value={analytics.closedTickets}
                        prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Card>
            </Col>

            {/* SLA Compliance */}
            <Col xs={24} sm={12} lg={8}>
                <Card loading={loading} bordered={false}>
                    <Statistic
                        title={t('dashboard.analytics.sla_compliance', { defaultValue: 'SLA Compliance' })}
                        value={analytics.slaCompliance}
                        suffix="%"
                        prefix={<SafetyOutlined />}
                        valueStyle={{ color: analytics.slaCompliance >= 80 ? '#52c41a' : '#ff4d4f' }}
                    />
                    <Progress
                        percent={analytics.slaCompliance}
                        strokeColor={analytics.slaCompliance >= 80 ? '#52c41a' : '#ff4d4f'}
                        showInfo={false}
                        style={{ marginTop: 8 }}
                    />
                    <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                        {t('dashboard.analytics.violated', { defaultValue: 'Violated' })}: {analytics.slaViolated}
                    </div>
                </Card>
            </Col>

            {/* Average Resolution Time */}
            <Col xs={24} sm={12} lg={8}>
                <Card loading={loading} bordered={false}>
                    <Statistic
                        title={t('dashboard.analytics.avg_resolution_time', { defaultValue: 'Avg Resolution Time' })}
                        value={analytics.avgResolutionTimeHours}
                        suffix={t('dashboard.analytics.hours', { defaultValue: 'hours' })}
                        prefix={<HourglassOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                    />
                </Card>
            </Col>

            {/* Today's Activity */}
            <Col xs={24} sm={12} lg={8}>
                <Card loading={loading} bordered={false}>
                    <div style={{ marginBottom: 16 }}>
                        <Statistic
                            title={t('dashboard.analytics.created_today', { defaultValue: 'Created Today' })}
                            value={analytics.ticketsCreatedToday}
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: '#1890ff', fontSize: 20 }}
                        />
                    </div>
                    <Statistic
                        title={t('dashboard.analytics.resolved_today', { defaultValue: 'Resolved Today' })}
                        value={analytics.ticketsResolvedToday}
                        prefix={<FallOutlined />}
                        valueStyle={{ color: '#52c41a', fontSize: 20 }}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default AnalyticsCards;
