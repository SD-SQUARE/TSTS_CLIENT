import { useMemo, useState } from "react";
import {
    AppstoreOutlined,
    ApartmentOutlined,
    BankOutlined,
    BugOutlined,
    SafetyOutlined,
    SearchOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Empty,
    Input,
    Modal,
    Row,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { universityApi } from "../../universities/services/universityApi";
import { domainApi } from "../../domains/services/domainsApi";
import { departmentApi } from "../../departments/services/departmentApi";
import { specializationApi } from "../../specializations/services/specializationsApi";
import { problemsApi } from "../../Problems/services/problemsApi";
import { getTrustedDevices } from "../../trusted-devices/api/trustedDevices.api";
import LocalizedDateText from "../../../components/LocalizedDateText";

const PREVIEW_PAGE_SIZE = 500;

type DashboardKey =
    | "universities"
    | "domains"
    | "departments"
    | "specializations"
    | "problems"
    | "trustedDevices";

const extractRows = <T,>(payload: any): T[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as T[];

    const knownKeys = [
        "data",
        "universities",
        "domains",
        "departments",
        "specializations",
        "problems",
    ];

    for (const key of knownKeys) {
        if (Array.isArray(payload?.[key])) {
            return payload[key] as T[];
        }
    }

    return [];
};

const extractTotal = (payload: any) => {
    if (!payload) return 0;
    if (typeof payload.total === "number") return payload.total;
    if (typeof payload?.meta_data?.total === "number") return payload.meta_data.total;
    if (typeof payload?.meta?.total === "number") return payload.meta.total;
    if (typeof payload?.pagination?.total === "number") return payload.pagination.total;
    return extractRows(payload).length;
};

const getLocalizedName = (
    item: { name?: string | { en?: string; ar?: string }; name_en?: string; name_ar?: string } | undefined,
    language: "en" | "ar",
) => {
    if (!item) {
        return "-";
    }

    if (language === "ar") {
        return item.name_ar ?? (typeof item.name === "object" ? item.name?.ar : item.name) ?? "-";
    }

    return item.name_en ?? (typeof item.name === "object" ? item.name?.en : item.name) ?? "-";
};

const getLocalizedDescription = (
    item: { description?: string | { en?: string; ar?: string }; description_en?: string; description_ar?: string } | undefined,
    language: "en" | "ar",
) => {
    if (!item) {
        return "-";
    }

    if (language === "ar") {
        return item.description_ar ?? (typeof item.description === "object" ? item.description?.ar : item.description) ?? "-";
    }

    return item.description_en ?? (typeof item.description === "object" ? item.description?.en : item.description) ?? "-";
};

const createTextFilter = <T,>(
    title: string,
    getter: (record: T) => string,
): ColumnType<T> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) => (
        <div style={{ padding: 8 }} onKeyDown={(event) => event.stopPropagation()}>
            <Input
                placeholder={title}
                value={(selectedKeys[0] as string) || ""}
                onChange={(event) =>
                    setSelectedKeys(event.target.value ? [event.target.value] : [])
                }
                onPressEnter={() => confirm()}
                style={{ marginBottom: 8, display: "block" }}
            />
            <Space>
                <Button type="primary" icon={<SearchOutlined />} size="small" onClick={() => confirm()}>
                    Search
                </Button>
                <Button
                    size="small"
                    onClick={() => {
                        clearFilters?.();
                        confirm();
                    }}
                >
                    Reset
                </Button>
                <Button type="link" size="small" onClick={() => close()}>
                    Close
                </Button>
            </Space>
        </div>
    ),
    filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
        getter(record)
            .toLowerCase()
            .includes(String(value).toLowerCase()),
});

const SettingsOverviewDashboard = () => {
    const { t, i18n } = useTranslation();
    const language = (i18n.language === "ar" ? "ar" : "en") as "en" | "ar";
    const [activeView, setActiveView] = useState<DashboardKey | null>(null);

    const universitiesQuery = useQuery({
        queryKey: ["settings-dashboard", "universities"],
        queryFn: () => universityApi.getAll({ page: 1, page_size: PREVIEW_PAGE_SIZE }),
    });
    const domainsQuery = useQuery({
        queryKey: ["settings-dashboard", "domains"],
        queryFn: () => domainApi.getAll({ page: 1, page_size: PREVIEW_PAGE_SIZE }),
    });
    const departmentsQuery = useQuery({
        queryKey: ["settings-dashboard", "departments"],
        queryFn: () => departmentApi.getAll({ page: 1, page_size: PREVIEW_PAGE_SIZE }),
    });
    const specializationsQuery = useQuery({
        queryKey: ["settings-dashboard", "specializations"],
        queryFn: () => specializationApi.getAll({ page: 1, page_size: PREVIEW_PAGE_SIZE }),
    });
    const problemsQuery = useQuery({
        queryKey: ["settings-dashboard", "problems"],
        queryFn: () => problemsApi.getAll({ page: 1, page_size: PREVIEW_PAGE_SIZE }),
    });
    const trustedDevicesQuery = useQuery({
        queryKey: ["settings-dashboard", "trusted-devices"],
        queryFn: async () => {
            const response = await getTrustedDevices({
                page: 1,
                pageSize: PREVIEW_PAGE_SIZE,
            });
            return response.data;
        },
    });

    const universities = extractRows<any>(universitiesQuery.data);
    const domains = extractRows<any>(domainsQuery.data);
    const departments = extractRows<any>(departmentsQuery.data);
    const specializations = extractRows<any>(specializationsQuery.data);
    const problems = extractRows<any>(problemsQuery.data);
    const trustedDevices = extractRows<any>(trustedDevicesQuery.data);

    const textColumns = useMemo(() => {
        const nameEn = {
            title: t("name_en"),
            key: "name_en",
            render: (_: unknown, record: any) => getLocalizedName(record, "en"),
            ...createTextFilter<any>(t("name_en"), (record) => getLocalizedName(record, "en")),
        };

        const nameAr = {
            title: t("name_ar"),
            key: "name_ar",
            render: (_: unknown, record: any) => getLocalizedName(record, "ar"),
            ...createTextFilter<any>(t("name_ar"), (record) => getLocalizedName(record, "ar")),
        };

        const descEn = {
            title: t("description_en"),
            key: "description_en",
            render: (_: unknown, record: any) => getLocalizedDescription(record, "en"),
            ...createTextFilter<any>(t("description_en"), (record) => getLocalizedDescription(record, "en")),
        };

        const descAr = {
            title: t("description_ar"),
            key: "description_ar",
            render: (_: unknown, record: any) => getLocalizedDescription(record, "ar"),
            ...createTextFilter<any>(t("description_ar"), (record) => getLocalizedDescription(record, "ar")),
        };

        return { nameEn, nameAr, descEn, descAr };
    }, [t]);

    const modalTitle = useMemo(() => {
        switch (activeView) {
            case "universities":
                return t("universities");
            case "domains":
                return t("Domains");
            case "departments":
                return t("departments");
            case "specializations":
                return t("specializations");
            case "problems":
                return t("problems");
            case "trustedDevices":
                return t("sidebar.menu.trustedDevices");
            default:
                return "";
        }
    }, [activeView, t]);

    const modalConfig = useMemo(() => {
        const relationUniversityColumn = {
            title: t("university"),
            key: "university",
            render: (_: unknown, record: any) =>
                getLocalizedName(record.university ?? record.domain?.university, language),
            ...createTextFilter<any>(
                t("university"),
                (record) => getLocalizedName(record.university ?? record.domain?.university, language),
            ),
        };

        const relationDomainColumn = {
            title: t("domain"),
            key: "domain",
            render: (_: unknown, record: any) => getLocalizedName(record.domain, language),
            ...createTextFilter<any>(t("domain"), (record) => getLocalizedName(record.domain, language)),
        };

        const reviewRequiredColumn = {
            title: t("review_required"),
            dataIndex: "review_required",
            key: "review_required",
            render: (value: boolean) => (
                <Tag color={value ? "green" : "default"}>
                    {value ? t("yes") : t("no")}
                </Tag>
            ),
            filters: [
                { text: t("yes"), value: "true" },
                { text: t("no"), value: "false" },
            ],
            onFilter: (value: string | number | boolean, record: any) =>
                String(Boolean(record.review_required)) === String(value),
        } satisfies ColumnType<any>;

        switch (activeView) {
            case "universities":
                return {
                    rowKey: "id",
                    rows: universities,
                    columns: [
                        textColumns.nameEn,
                        textColumns.nameAr,
                        textColumns.descEn,
                        textColumns.descAr,
                    ] satisfies ColumnsType<any>,
                };
            case "domains":
                return {
                    rowKey: "id",
                    rows: domains,
                    columns: [
                        textColumns.nameEn,
                        textColumns.nameAr,
                        relationUniversityColumn,
                        textColumns.descEn,
                        textColumns.descAr,
                    ] satisfies ColumnsType<any>,
                };
            case "departments":
                return {
                    rowKey: "id",
                    rows: departments,
                    columns: [
                        textColumns.nameEn,
                        textColumns.nameAr,
                        relationUniversityColumn,
                        relationDomainColumn,
                        textColumns.descEn,
                        textColumns.descAr,
                    ] satisfies ColumnsType<any>,
                };
            case "specializations":
                return {
                    rowKey: "id",
                    rows: specializations,
                    columns: [
                        textColumns.nameEn,
                        textColumns.nameAr,
                        reviewRequiredColumn,
                        textColumns.descEn,
                        textColumns.descAr,
                    ] satisfies ColumnsType<any>,
                };
            case "problems":
                return {
                    rowKey: "id",
                    rows: problems,
                    columns: [
                        textColumns.nameEn,
                        textColumns.nameAr,
                        {
                            title: t("specialization_type"),
                            key: "specialization",
                            render: (_: unknown, record: any) =>
                                getLocalizedName(record.specialization, language),
                            ...createTextFilter<any>(
                                t("specialization_type"),
                                (record) => getLocalizedName(record.specialization, language),
                            ),
                        },
                        reviewRequiredColumn,
                        textColumns.descEn,
                        textColumns.descAr,
                    ] satisfies ColumnsType<any>,
                };
            case "trustedDevices":
                return {
                    rowKey: "id",
                    rows: trustedDevices,
                    columns: [
                        {
                            title: t("common.user"),
                            key: "user",
                            render: (_: unknown, record: any) => record.user?.email || "-",
                            ...createTextFilter<any>(
                                t("common.user"),
                                (record) => record.user?.email || "",
                            ),
                        },
                        {
                            title: t("trusted_devices.Device Name"),
                            dataIndex: "name",
                            key: "name",
                            ...createTextFilter<any>(
                                t("trusted_devices.Device Name"),
                                (record) => record.name || "",
                            ),
                        },
                        {
                            title: t("trusted_devices.Type"),
                            dataIndex: "deviceType",
                            key: "deviceType",
                            render: (value: string) => <Tag>{value || "-"}</Tag>,
                            ...createTextFilter<any>(
                                t("trusted_devices.Type"),
                                (record) => record.deviceType || "",
                            ),
                        },
                        {
                            title: t("trusted_devices.Browser"),
                            dataIndex: "browser",
                            key: "browser",
                            ...createTextFilter<any>(
                                t("trusted_devices.Browser"),
                                (record) => record.browser || "",
                            ),
                        },
                        {
                            title: t("trusted_devices.OS"),
                            dataIndex: "os",
                            key: "os",
                            ...createTextFilter<any>(
                                t("trusted_devices.OS"),
                                (record) => record.os || "",
                            ),
                        },
                        {
                            title: t("audit.createdAt"),
                            dataIndex: "activatedSince",
                            key: "activatedSince",
                            render: (value: string) => (
                                <LocalizedDateText value={value} language={language} />
                            ),
                        },
                    ] satisfies ColumnsType<any>,
                };
            default:
                return {
                    rowKey: "id",
                    rows: [],
                    columns: [] as ColumnsType<any>,
                };
        }
    }, [
        activeView,
        departments,
        domains,
        language,
        problems,
        specializations,
        t,
        textColumns,
        trustedDevices,
        universities,
    ]);

    const cards = [
        {
            key: "universities" as const,
            title: t("universities"),
            value: extractTotal(universitiesQuery.data),
            icon: <BankOutlined />,
            color: "#1677ff",
        },
        {
            key: "domains" as const,
            title: t("Domains"),
            value: extractTotal(domainsQuery.data),
            icon: <ApartmentOutlined />,
            color: "#7c3aed",
        },
        {
            key: "departments" as const,
            title: t("departments"),
            value: extractTotal(departmentsQuery.data),
            icon: <TeamOutlined />,
            color: "#0f766e",
        },
        {
            key: "specializations" as const,
            title: t("specializations"),
            value: extractTotal(specializationsQuery.data),
            icon: <AppstoreOutlined />,
            color: "#ea580c",
        },
        {
            key: "problems" as const,
            title: t("problems"),
            value: extractTotal(problemsQuery.data),
            icon: <BugOutlined />,
            color: "#dc2626",
        },
        {
            key: "trustedDevices" as const,
            title: t("sidebar.menu.trustedDevices"),
            value: extractTotal(trustedDevicesQuery.data),
            icon: <SafetyOutlined />,
            color: "#16a34a",
        },
    ];

    return (
        <>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Space direction="vertical" size={4}>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                        {t("profile.settings.overview.title")}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        {t("profile.settings.overview.description")}
                    </Typography.Text>
                </Space>

                <Row gutter={[16, 16]}>
                    {cards.map((card) => (
                        <Col key={card.key} xs={24} sm={12} xl={8}>
                            <Card
                                hoverable
                                onClick={() => setActiveView(card.key)}
                                style={{
                                    borderRadius: 18,
                                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                                }}
                            >
                                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                    <Tag
                                        icon={card.icon}
                                        color="processing"
                                        style={{
                                            width: "fit-content",
                                            borderRadius: 999,
                                            borderColor: card.color,
                                            color: card.color,
                                        }}
                                    >
                                        {card.title}
                                    </Tag>
                                    <Statistic value={card.value} />
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Space>

            <Modal
                title={modalTitle}
                open={Boolean(activeView)}
                onCancel={() => setActiveView(null)}
                footer={null}
                width={1200}
                destroyOnClose
            >
                {modalConfig.rows.length ? (
                    <Table
                        rowKey={modalConfig.rowKey}
                        columns={modalConfig.columns}
                        dataSource={modalConfig.rows}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        scroll={{ x: 1000 }}
                    />
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={t("common.no_data")}
                    />
                )}
            </Modal>
        </>
    );
};

export default SettingsOverviewDashboard;
