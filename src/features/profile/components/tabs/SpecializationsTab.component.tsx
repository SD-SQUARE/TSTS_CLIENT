// tabs/SpecializationsTab.tsx
import { Card, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useUserSpecializations } from "../../hooks/useUserSpecializations.hook";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

const SpecializationsTab = () => {
    
    const auth = useSelector((state: any) => state.auth);
    const userId = auth.user?.id ?? "";
    const page = 1;
    const pageSize = 10;
    const { data: specializations, isLoading } = useUserSpecializations(userId, page, pageSize);

    const columns: ColumnsType<(typeof specializations.data)[number]> = [
        {
            title: "Name (EN)",
            dataIndex: "name_en",
            key: "name_en",
            ellipsis: {
                showTitle: false,
            },
            render: name => (
                <Tooltip title={name}>
                    <Text strong>{name}</Text>
                </Tooltip>
            ),
        },
        {
            title: "Name (AR)",
            dataIndex: "name_ar",
            key: "name_ar",
            ellipsis: {
                showTitle: false,
            },
            render: name => (
                <Tooltip title={name}>
                    <Text>{name}</Text>
                </Tooltip>
            ),
        },
        {
            title: "Description (EN)",
            dataIndex: "description_en",
            key: "description_en",
            ellipsis: {
                showTitle: false,
            },
            render: desc => (
                <Tooltip title={desc}>
                    <Text type="secondary">{desc}</Text>
                </Tooltip>
            ),
        },
        {
            title: "Description (AR)",
            dataIndex: "description_ar",
            key: "description_ar",
            ellipsis: {
                showTitle: false,
            },
            render: desc => (
                <Tooltip title={desc}>
                    <Text type="secondary">{desc}</Text>
                </Tooltip>
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
                User Specializations
            </Title>

            <Table
                rowKey="id"
                dataSource={specializations?.data}
                columns={columns}
                pagination={{
                    total: specializations?.meta_data.total,
                    pageSize: specializations?.meta_data.page_size,
                    showSizeChanger: false,
                }}
                scroll={{ x: 800 }}
                locale={{
                    emptyText: "No specializations assigned to this user",
                }}
            />
        </Card>
    );
};

export default SpecializationsTab;
