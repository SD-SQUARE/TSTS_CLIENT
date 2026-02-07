// tabs/GroupsTab.tsx
import { Card, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useUserGroups } from "../../hooks/useUserGroups.hook";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

const GroupsTab = () => {
    const { t } = useTranslation();
    const auth = useSelector((state: any) => state.auth);
    const userId = auth.user?.id ?? "";
    const page = 1;
    const pageSize = 10;
    const { data: groups, isLoading } = useUserGroups(userId, page, pageSize);

    const columns: ColumnsType<(typeof groups.groups)[number]> = [
        {
            title: t("profile.groups.columns.name"),
            dataIndex: "name",
            key: "name",
            ellipsis: true,
            render: (name: string) => (
                <Text strong>{name}</Text>
            ),
        },
        {
            title: t("profile.groups.columns.description"),
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (desc: string) => (
                <Text type="secondary">{desc}</Text>
            ),
        },
        {
            title: t("profile.groups.columns.color"),
            dataIndex: "color",
            key: "color",
            width: 140,
            align: "center",
            render: (color: string) => (
                <Tag
                    color={color}
                    style={{
                        borderRadius: 999,
                        padding: "4px 12px",
                        textTransform: "capitalize",
                    }}
                >
                    {color}
                </Tag>
            ),
        },
    ];

    return (
        <Card
            bordered={false}
            style={{
                borderRadius: 16,
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            }}
        >
            <Title level={5} style={{ marginBottom: 16 }}>
                {t("profile.groups.title")}
            </Title>

            <Table
                rowKey="id"
                dataSource={groups?.groups}
                columns={columns}
                pagination={{
                    total: groups?.meta_data.total,
                    pageSize: groups?.meta_data.page_size,
                    showSizeChanger: false,
                }}
                scroll={{ x: 600 }}
                locale={{
                    emptyText: t("profile.groups.empty"),
                }}
            />
        </Card>
    );
};

export default GroupsTab;

