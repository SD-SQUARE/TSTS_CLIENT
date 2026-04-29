import {
    AppstoreOutlined,
    ApartmentOutlined,
    BankOutlined,
    BugOutlined,
    SafetyOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import {
    Card,
    Col,
    Row,
    Space,
    Statistic,
    Tag,
    Typography,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { universityApi } from "../../universities/services/universityApi";
import { domainApi } from "../../domains/services/domainsApi";
import { departmentApi } from "../../departments/services/departmentApi";
import { specializationApi } from "../../specializations/services/specializationsApi";
import { problemsApi } from "../../Problems/services/problemsApi";
import { getTrustedDevices } from "../../trusted-devices/api/trustedDevices.api";

const PREVIEW_PAGE_SIZE = 1;

const extractTotal = (payload: any) => {
    if (!payload) return 0;
    if (typeof payload.total === "number") return payload.total;
    if (typeof payload?.meta_data?.total === "number") return payload.meta_data.total;
    if (typeof payload?.meta?.total === "number") return payload.meta.total;
    if (typeof payload?.pagination?.total === "number") return payload.pagination.total;
    return 0;
};

const SettingsOverviewDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

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

    const cards = [
        {
            key: "universities",
            title: t("sidebar.menu.universities"),
            value: extractTotal(universitiesQuery.data),
            icon: <BankOutlined />,
            color: "#1677ff",
            path: "/settings/universities",
        },
        {
            key: "domains",
            title: t("sidebar.menu.domains"),
            value: extractTotal(domainsQuery.data),
            icon: <ApartmentOutlined />,
            color: "#7c3aed",
            path: "/settings/domains",
        },
        {
            key: "departments",
            title: t("sidebar.menu.departments"),
            value: extractTotal(departmentsQuery.data),
            icon: <TeamOutlined />,
            color: "#0f766e",
            path: "/settings/departments",
        },
        {
            key: "specializations",
            title: t("sidebar.menu.specializations"),
            value: extractTotal(specializationsQuery.data),
            icon: <AppstoreOutlined />,
            color: "#ea580c",
            path: "/settings/specializations",
        },
        {
            key: "problems",
            title: t("sidebar.menu.problems"),
            value: extractTotal(problemsQuery.data),
            icon: <BugOutlined />,
            color: "#dc2626",
            path: "/settings/problems",
        },
        {
            key: "trustedDevices",
            title: t("sidebar.menu.trustedDevices"),
            value: extractTotal(trustedDevicesQuery.data),
            icon: <SafetyOutlined />,
            color: "#16a34a",
            path: "/settings/trustedDevices",
        },
    ];

    return (
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
                            onClick={() => navigate(card.path)}
                            style={{
                                borderRadius: 18,
                                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                                cursor: "pointer",
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
    );
};

export default SettingsOverviewDashboard;
