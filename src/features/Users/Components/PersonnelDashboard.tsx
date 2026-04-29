import {
    Card,
    Col,
    Row,
    Space,
    Spin,
    Statistic,
    Tag,
    Typography,
} from "antd";
import {
    CheckCircleOutlined,
    EditOutlined,
    IdcardOutlined,
    SafetyOutlined,
    TeamOutlined,
    ToolOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGroups } from "../../Groups/Hooks/useGroups";
import { useUsers } from "../Hooks/useUsers";

const ACTIVE_STATUS = "Active";

const PersonnelDashboard = ({
    embedded = false,
}: {
    embedded?: boolean;
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const groupsQuery = useGroups(1, 1, {});
    const adminsQuery = useUsers("admins", 1, 1, {});
    const techniciansQuery = useUsers("technicians", 1, 1, {});
    const requestersQuery = useUsers("requesters", 1, 1, {});
    
    const activeAdminsQuery = useUsers("admins", 1, 1, { status: ACTIVE_STATUS });
    const activeTechniciansQuery = useUsers("technicians", 1, 1, { status: ACTIVE_STATUS });
    const activeRequestersQuery = useUsers("requesters", 1, 1, { status: ACTIVE_STATUS });
    
    const editableAdminsQuery = useUsers("admins", 1, 1, { allow_profile_edit: "true" });
    const editableTechniciansQuery = useUsers("technicians", 1, 1, { allow_profile_edit: "true" });
    const editableRequestersQuery = useUsers("requesters", 1, 1, { allow_profile_edit: "true" });

    const totalActiveUsers =
        (activeAdminsQuery.data?.total || 0) +
        (activeTechniciansQuery.data?.total || 0) +
        (activeRequestersQuery.data?.total || 0);
    const totalEditableUsers =
        (editableAdminsQuery.data?.total || 0) +
        (editableTechniciansQuery.data?.total || 0) +
        (editableRequestersQuery.data?.total || 0);

    const cards = [
        {
            key: "groups",
            title: t("sidebar.menu.groups"),
            value: groupsQuery.data?.total || 0,
            icon: <TeamOutlined />,
            color: "#1677ff",
            loading: groupsQuery.isLoading,
            path: "/identities/groups",
        },
        {
            key: "admins",
            title: t("sidebar.menu.admins"),
            value: adminsQuery.data?.total || 0,
            icon: <SafetyOutlined />,
            color: "#7c3aed",
            loading: adminsQuery.isLoading,
            path: "/identities/users/admins",
        },
        {
            key: "technicians",
            title: t("sidebar.menu.technicians"),
            value: techniciansQuery.data?.total || 0,
            icon: <ToolOutlined />,
            color: "#0f766e",
            loading: techniciansQuery.isLoading,
            path: "/identities/users/technicians",
        },
        {
            key: "requesters",
            title: t("sidebar.menu.requesters"),
            value: requestersQuery.data?.total || 0,
            icon: <IdcardOutlined />,
            color: "#ea580c",
            loading: requestersQuery.isLoading,
            path: "/identities/users/requesters",
        },
        {
            key: "active",
            title: t("personnelDashboard.activeAccounts"),
            value: totalActiveUsers,
            icon: <CheckCircleOutlined />,
            color: "#16a34a",
            loading:
                activeAdminsQuery.isLoading ||
                activeTechniciansQuery.isLoading ||
                activeRequestersQuery.isLoading,
            path: "/identities/users/requesters?status=Active",
        },
        {
            key: "editable",
            title: t("personnelDashboard.editableAccounts"),
            value: totalEditableUsers,
            icon: <EditOutlined />,
            color: "#1d4ed8",
            loading:
                editableAdminsQuery.isLoading ||
                editableTechniciansQuery.isLoading ||
                editableRequestersQuery.isLoading,
            path: "/identities/users/requesters?allow_profile_edit=true",
        },
    ];

    return (
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
                            onClick={() => navigate(card.path)}
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
    );
};

export default PersonnelDashboard;
