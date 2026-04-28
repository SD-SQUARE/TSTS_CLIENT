import { useMemo, useState } from "react";
import {
    Button,
    Card,
    Col,
    Empty,
    Input,
    Modal,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { FilterDropdownProps } from "antd/es/table/interface";
import {
    CheckCircleOutlined,
    EditOutlined,
    IdcardOutlined,
    SearchOutlined,
    SafetyOutlined,
    TeamOutlined,
    ToolOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useGroups } from "../../Groups/Hooks/useGroups";
import { useUsers } from "../Hooks/useUsers";
import type { Lookup } from "../Types/users";

const ACTIVE_STATUS = "Active";
const QUERY_PAGE_SIZE = 50;

type DashboardViewKey =
    | "groups"
    | "admins"
    | "technicians"
    | "requesters"
    | "active"
    | "editable";

const getLookupLabel = (
    item: Lookup | { name?: string; name_en?: string; name_ar?: string } | undefined,
    currentLanguage: "en" | "ar",
) => {
    if (!item) {
        return "-";
    }

    if (currentLanguage === "ar") {
        return item.name_ar || item.name || "-";
    }

    return item.name_en || item.name || "-";
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
                <Button type="primary" size="small" icon={<SearchOutlined />} onClick={() => confirm()}>
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

const PersonnelDashboard = ({
    embedded = false,
}: {
    embedded?: boolean;
}) => {
    const { t, i18n } = useTranslation();
    const currentLanguage = (i18n.language === "ar" ? "ar" : "en") as "en" | "ar";
    const [activeView, setActiveView] = useState<DashboardViewKey | null>(null);

    const groupsQuery = useGroups(1, QUERY_PAGE_SIZE, {});
    const adminsQuery = useUsers("admins", 1, QUERY_PAGE_SIZE, {});
    const techniciansQuery = useUsers("technicians", 1, QUERY_PAGE_SIZE, {});
    const requestersQuery = useUsers("requesters", 1, QUERY_PAGE_SIZE, {});
    const activeAdminsQuery = useUsers("admins", 1, QUERY_PAGE_SIZE, { status: ACTIVE_STATUS });
    const activeTechniciansQuery = useUsers("technicians", 1, QUERY_PAGE_SIZE, { status: ACTIVE_STATUS });
    const activeRequestersQuery = useUsers("requesters", 1, QUERY_PAGE_SIZE, { status: ACTIVE_STATUS });
    const editableAdminsQuery = useUsers("admins", 1, QUERY_PAGE_SIZE, { allow_profile_edit: "true" });
    const editableTechniciansQuery = useUsers("technicians", 1, QUERY_PAGE_SIZE, { allow_profile_edit: "true" });
    const editableRequestersQuery = useUsers("requesters", 1, QUERY_PAGE_SIZE, { allow_profile_edit: "true" });

    const groups = groupsQuery.data?.data || [];
    const admins = adminsQuery.data?.data || [];
    const technicians = techniciansQuery.data?.data || [];
    const requesters = requestersQuery.data?.data || [];
    const activeUsers = [
        ...(activeAdminsQuery.data?.data || []),
        ...(activeTechniciansQuery.data?.data || []),
        ...(activeRequestersQuery.data?.data || []),
    ];
    const editableUsers = [
        ...(editableAdminsQuery.data?.data || []),
        ...(editableTechniciansQuery.data?.data || []),
        ...(editableRequestersQuery.data?.data || []),
    ];

    const totalActiveUsers =
        (activeAdminsQuery.data?.total || 0) +
        (activeTechniciansQuery.data?.total || 0) +
        (activeRequestersQuery.data?.total || 0);
    const totalEditableUsers =
        (editableAdminsQuery.data?.total || 0) +
        (editableTechniciansQuery.data?.total || 0) +
        (editableRequestersQuery.data?.total || 0);

    const modalTitle = useMemo(() => {
        switch (activeView) {
            case "groups":
                return t("sidebar.menu.groups");
            case "admins":
                return t("sidebar.menu.admins");
            case "technicians":
                return t("sidebar.menu.technicians");
            case "requesters":
                return t("sidebar.menu.requesters");
            case "active":
                return t("personnelDashboard.activeAccounts");
            case "editable":
                return t("personnelDashboard.editableAccounts");
            default:
                return "";
        }
    }, [activeView, t]);

    const groupColumns: ColumnsType<any> = [
        {
            title: t("profile.groups.columns.name"),
            key: "name",
            render: (_, record) => (
                <Typography.Text strong>
                    {currentLanguage === "ar" ? record.name_ar : record.name_en}
                </Typography.Text>
            ),
            ...createTextFilter<any>(
                t("profile.groups.columns.name"),
                (record) => currentLanguage === "ar" ? record.name_ar || "" : record.name_en || "",
            ),
        },
        {
            title: t("profile.groups.columns.description"),
            key: "description",
            render: (_, record) => (
                <Typography.Text type="secondary">
                    {currentLanguage === "ar" ? record.description_ar : record.description_en}
                </Typography.Text>
            ),
            ...createTextFilter<any>(
                t("profile.groups.columns.description"),
                (record) => currentLanguage === "ar" ? record.description_ar || "" : record.description_en || "",
            ),
        },
        {
            title: t("profile.groups.columns.color"),
            dataIndex: "color",
            key: "color",
            render: (value: string) => <Tag color={value}>{value}</Tag>,
        },
    ];

    const userColumns: ColumnsType<any> = [
        {
            title: t("user_list.full_name"),
            key: "full_name",
            render: (_, record) => (
                <Typography.Text strong>
                    {record[`full_name_${currentLanguage}` as "full_name_en" | "full_name_ar"] ||
                        `${record[`first_name_${currentLanguage}` as "first_name_en" | "first_name_ar"] || ""} ${record[`mid_name_${currentLanguage}` as "mid_name_en" | "mid_name_ar"] || ""} ${record[`last_name_${currentLanguage}` as "last_name_en" | "last_name_ar"] || ""}`.trim()}
                </Typography.Text>
            ),
            ...createTextFilter<any>(
                t("user_list.full_name"),
                (record) =>
                    record[`full_name_${currentLanguage}` as "full_name_en" | "full_name_ar"] ||
                    `${record[`first_name_${currentLanguage}` as "first_name_en" | "first_name_ar"] || ""} ${record[`mid_name_${currentLanguage}` as "mid_name_en" | "mid_name_ar"] || ""} ${record[`last_name_${currentLanguage}` as "last_name_en" | "last_name_ar"] || ""}`.trim(),
            ),
        },
        {
            title: t("user_list.email"),
            dataIndex: "email",
            key: "email",
            ...createTextFilter<any>(t("user_list.email"), (record) => record.email || ""),
        },
        {
            title: t("audit.role"),
            dataIndex: "user_type",
            key: "user_type",
            render: (value: string) => <Tag>{value}</Tag>,
            ...createTextFilter<any>(t("audit.role"), (record) => record.user_type || ""),
        },
        {
            title: t("user_list.status"),
            dataIndex: "status",
            key: "status",
            render: (value: string) => (
                <Tag color={value === ACTIVE_STATUS ? "green" : "default"}>{value}</Tag>
            ),
        },
        {
            title: t("user_list.university"),
            key: "university",
            render: (_, record) => getLookupLabel(record.university, currentLanguage),
            ...createTextFilter<any>(
                t("user_list.university"),
                (record) => getLookupLabel(record.university, currentLanguage),
            ),
        },
        {
            title: t("user_list.domain"),
            key: "domain",
            render: (_, record) => getLookupLabel(record.domain, currentLanguage),
            ...createTextFilter<any>(
                t("user_list.domain"),
                (record) => getLookupLabel(record.domain, currentLanguage),
            ),
        },
    ];

    const modalData = useMemo(() => {
        switch (activeView) {
            case "groups":
                return { rows: groups, columns: groupColumns, rowKey: "id" };
            case "admins":
                return { rows: admins, columns: userColumns, rowKey: "id" };
            case "technicians":
                return { rows: technicians, columns: userColumns, rowKey: "id" };
            case "requesters":
                return { rows: requesters, columns: userColumns, rowKey: "id" };
            case "active":
                return { rows: activeUsers, columns: userColumns, rowKey: "id" };
            case "editable":
                return { rows: editableUsers, columns: userColumns, rowKey: "id" };
            default:
                return { rows: [], columns: userColumns, rowKey: "id" };
        }
    }, [
        activeView,
        activeUsers,
        admins,
        editableUsers,
        groupColumns,
        groups,
        requesters,
        technicians,
        userColumns,
    ]);

    const cards = [
        {
            key: "groups" as const,
            title: t("sidebar.menu.groups"),
            value: groupsQuery.data?.total || 0,
            icon: <TeamOutlined />,
            color: "#1677ff",
            loading: groupsQuery.isLoading,
        },
        {
            key: "admins" as const,
            title: t("sidebar.menu.admins"),
            value: adminsQuery.data?.total || 0,
            icon: <SafetyOutlined />,
            color: "#7c3aed",
            loading: adminsQuery.isLoading,
        },
        {
            key: "technicians" as const,
            title: t("sidebar.menu.technicians"),
            value: techniciansQuery.data?.total || 0,
            icon: <ToolOutlined />,
            color: "#0f766e",
            loading: techniciansQuery.isLoading,
        },
        {
            key: "requesters" as const,
            title: t("sidebar.menu.requesters"),
            value: requestersQuery.data?.total || 0,
            icon: <IdcardOutlined />,
            color: "#ea580c",
            loading: requestersQuery.isLoading,
        },
        {
            key: "active" as const,
            title: t("personnelDashboard.activeAccounts"),
            value: totalActiveUsers,
            icon: <CheckCircleOutlined />,
            color: "#16a34a",
            loading:
                activeAdminsQuery.isLoading ||
                activeTechniciansQuery.isLoading ||
                activeRequestersQuery.isLoading,
        },
        {
            key: "editable" as const,
            title: t("personnelDashboard.editableAccounts"),
            value: totalEditableUsers,
            icon: <EditOutlined />,
            color: "#1d4ed8",
            loading:
                editableAdminsQuery.isLoading ||
                editableTechniciansQuery.isLoading ||
                editableRequestersQuery.isLoading,
        },
    ];

    return (
        <>
            <Space direction="vertical" size={embedded ? 16 : 20} style={{ width: "100%" }}>
                {!embedded && (
                    <Space direction="vertical" size={4}>
                        <Typography.Title level={3} style={{ margin: 0 }}>
                            {t("sidebar.menu.personnel")}
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            {t("sidebar.menu.groups")} / {t("sidebar.menu.users")}
                        </Typography.Text>
                    </Space>
                )}

                <Row gutter={[16, 16]}>
                    {cards.map((card) => (
                        <Col key={card.key} xs={24} sm={12} xl={8}>
                            <Card
                                hoverable
                                onClick={() => setActiveView(card.key)}
                                style={{
                                    borderRadius: 18,
                                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                                    cursor: "pointer",
                                }}
                            >
                                {card.loading ? (
                                    <Spin />
                                ) : (
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
                                )}
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
                width={1100}
                destroyOnClose
            >
                {modalData.rows.length ? (
                    <Table
                        rowKey={modalData.rowKey}
                        columns={modalData.columns}
                        dataSource={modalData.rows}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        scroll={{ x: 900 }}
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

export default PersonnelDashboard;
