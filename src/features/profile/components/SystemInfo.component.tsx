import { useMemo } from "react";
import {
    Card,
    Col,
    Empty,
    Progress,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import { useSystemInfo } from "../hooks/useSystemInfo.hook";
import LocalizedDateText from "../../../components/LocalizedDateText";
import SettingsOverviewDashboard from "./SettingsOverviewDashboard.component";

const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;
    return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[index]}`;
};

const formatDuration = (seconds: number) => {
    const totalSeconds = Math.max(Math.floor(seconds), 0);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

const SystemInfoTab = ({ searchTerm = "" }: { searchTerm?: string }) => {
    const { t, i18n } = useTranslation();
    const { data, isLoading } = useSystemInfo();

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const cards = useMemo(() => {
        if (!data) return [];

        return [
            {
                key: "cpu",
                title: t("profile.settings.systemInfo.cards.cpu"),
                percent: data.cpu.usagePercent,
                detail: `${data.cpu.cores} ${t("profile.settings.systemInfo.cards.cores")}`,
                keywords: [data.cpu.model, data.cpu.cores, data.cpu.speedMhz].join(" ").toLowerCase(),
                color: "#1677ff",
            },
            {
                key: "memory",
                title: t("profile.settings.systemInfo.cards.memory"),
                percent: data.memory.usagePercent,
                detail: `${formatBytes(data.memory.used)} / ${formatBytes(data.memory.total)}`,
                keywords: [data.memory.used, data.memory.total, data.memory.processHeapUsed].join(" ").toLowerCase(),
                color: "#52c41a",
            },
            {
                key: "disk",
                title: t("profile.settings.systemInfo.cards.disk"),
                percent: data.disk?.usagePercent || 0,
                detail: data.disk
                    ? `${formatBytes(data.disk.used)} / ${formatBytes(data.disk.total)}`
                    : t("profile.settings.systemInfo.unavailable"),
                keywords: [data.disk?.path, data.disk?.used, data.disk?.total].join(" ").toLowerCase(),
                color: "#faad14",
            },
        ];
    }, [data, t]);

    const detailRows = useMemo(() => {
        if (!data) return [];

        const rows = [
            {
                key: "cpu-model",
                category: t("profile.settings.systemInfo.cards.cpu"),
                label: t("profile.settings.systemInfo.details.cpuModel"),
                value: data.cpu.model,
            },
            {
                key: "cpu-speed",
                category: t("profile.settings.systemInfo.cards.cpu"),
                label: t("profile.settings.systemInfo.details.cpuSpeed"),
                value: `${data.cpu.speedMhz} MHz`,
            },
            {
                key: "cpu-load",
                category: t("profile.settings.systemInfo.cards.cpu"),
                label: t("profile.settings.systemInfo.details.loadAverage"),
                value: data.cpu.loadAverage.map((value) => value.toFixed(2)).join(" / "),
            },
            {
                key: "memory-free",
                category: t("profile.settings.systemInfo.cards.memory"),
                label: t("profile.settings.systemInfo.details.memoryFree"),
                value: formatBytes(data.memory.free),
            },
            {
                key: "memory-process",
                category: t("profile.settings.systemInfo.cards.memory"),
                label: t("profile.settings.systemInfo.details.processMemory"),
                value: formatBytes(data.memory.processRss),
            },
            {
                key: "heap-used",
                category: t("profile.settings.systemInfo.cards.memory"),
                label: t("profile.settings.systemInfo.details.heapUsed"),
                value: `${formatBytes(data.memory.processHeapUsed)} / ${formatBytes(data.memory.processHeapTotal)}`,
            },
            {
                key: "disk-path",
                category: t("profile.settings.systemInfo.cards.disk"),
                label: t("profile.settings.systemInfo.details.diskPath"),
                value: data.disk?.path || t("profile.settings.systemInfo.unavailable"),
            },
            {
                key: "disk-free",
                category: t("profile.settings.systemInfo.cards.disk"),
                label: t("profile.settings.systemInfo.details.diskFree"),
                value: data.disk ? formatBytes(data.disk.free) : t("profile.settings.systemInfo.unavailable"),
            },
            {
                key: "host",
                category: t("profile.settings.systemInfo.cards.runtime"),
                label: t("profile.settings.systemInfo.details.hostname"),
                value: data.runtime.hostname,
            },
            {
                key: "platform",
                category: t("profile.settings.systemInfo.cards.runtime"),
                label: t("profile.settings.systemInfo.details.platform"),
                value: `${data.runtime.platform} / ${data.runtime.arch}`,
            },
            {
                key: "uptime",
                category: t("profile.settings.systemInfo.cards.runtime"),
                label: t("profile.settings.systemInfo.details.uptime"),
                value: formatDuration(data.runtime.uptimeSeconds),
            },
            {
                key: "process-uptime",
                category: t("profile.settings.systemInfo.cards.runtime"),
                label: t("profile.settings.systemInfo.details.processUptime"),
                value: formatDuration(data.runtime.processUptimeSeconds),
            },
            {
                key: "node",
                category: t("profile.settings.systemInfo.cards.runtime"),
                label: t("profile.settings.systemInfo.details.nodeVersion"),
                value: data.runtime.nodeVersion,
            },
            {
                key: "pid",
                category: t("profile.settings.systemInfo.cards.runtime"),
                label: t("profile.settings.systemInfo.details.processId"),
                value: String(data.runtime.pid),
            },
        ];

        if (!normalizedSearch) {
            return rows;
        }

        return rows.filter((row) =>
            `${row.category} ${row.label} ${row.value}`.toLowerCase().includes(normalizedSearch),
        );
    }, [data, normalizedSearch, t]);

    const visibleCards = useMemo(() => {
        if (!normalizedSearch) {
            return cards;
        }

        return cards.filter((card) =>
            `${card.title} ${card.detail} ${card.keywords}`.toLowerCase().includes(normalizedSearch),
        );
    }, [cards, normalizedSearch]);

    if (isLoading) {
        return <Spin />;
    }

    if (!data) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("profile.settings.systemInfo.unavailable")}
            />
        );
    }

    if (!visibleCards.length && !detailRows.length) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("profile.settings.noSearchResults")}
            />
        );
    }

    return (
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <SettingsOverviewDashboard />

            <Card
                style={{
                    borderRadius: 18,
                    background: "linear-gradient(135deg, #0b2344 0%, #184d9b 100%)",
                    color: "white",
                }}
            >
                <Space direction="vertical" size={4}>
                    <Typography.Title level={4} style={{ margin: 0, color: "white" }}>
                        {t("profile.settings.systemInfo.title")}
                    </Typography.Title>
                    <Typography.Text style={{ color: "rgba(255,255,255,0.82)" }}>
                        {t("profile.settings.systemInfo.description")}
                    </Typography.Text>
                    <Tag color="blue-inverse" style={{ width: "fit-content", marginTop: 8 }}>
                        {t("profile.settings.systemInfo.lastUpdated")}{" "}
                        <LocalizedDateText
                            value={data.generatedAt}
                            language={i18n.language}
                            options={{ year: "numeric", month: "2-digit", day: "2-digit", hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }}
                        />
                    </Tag>
                </Space>
            </Card>

            <Row gutter={[16, 16]}>
                {visibleCards.map((card) => (
                    <Col key={card.key} xs={24} md={8}>
                        <Card
                            style={{
                                borderRadius: 18,
                                minHeight: 260,
                                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                            }}
                        >
                            <Space direction="vertical" size={16} style={{ width: "100%", alignItems: "center" }}>
                                <Progress
                                    type="dashboard"
                                    percent={Math.min(Math.max(card.percent, 0), 100)}
                                    strokeColor={card.color}
                                    size={170}
                                />
                                <Typography.Title level={5} style={{ margin: 0 }}>
                                    {card.title}
                                </Typography.Title>
                                <Typography.Text type="secondary" style={{ textAlign: "center" }}>
                                    {card.detail}
                                </Typography.Text>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <Card style={{ borderRadius: 18, height: "100%" }}>
                        <Statistic
                            title={t("profile.settings.systemInfo.cards.runtime")}
                            value={formatDuration(data.runtime.uptimeSeconds)}
                        />
                        <Space direction="vertical" size={10} style={{ marginTop: 18, width: "100%" }}>
                            <Tag color="geekblue">{data.runtime.hostname}</Tag>
                            <Tag color="purple">{data.runtime.nodeVersion}</Tag>
                            <Tag color="gold">{`${data.runtime.platform} / ${data.runtime.arch}`}</Tag>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card style={{ borderRadius: 18 }}>
                        <Table
                            dataSource={detailRows}
                            pagination={false}
                            rowKey="key"
                            columns={[
                                {
                                    title: t("profile.settings.systemInfo.details.category"),
                                    dataIndex: "category",
                                    key: "category",
                                    render: (value: string) => <Tag>{value}</Tag>,
                                },
                                {
                                    title: t("profile.settings.systemInfo.details.metric"),
                                    dataIndex: "label",
                                    key: "label",
                                },
                                {
                                    title: t("profile.settings.systemInfo.details.value"),
                                    dataIndex: "value",
                                    key: "value",
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </Space>
    );
};

export default SystemInfoTab;
