// features/trusted-devices/pages/TrustedDevicesPage.tsx
import { Table, Input, Button, Space, Tag, Modal, Typography } from "antd";
import { useState } from "react";
import { useTrustedDevices, useDeleteTrustedDevice } from "../hooks/useTrustedDevices";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

const CONFIRM_WORD = "DELETE";

const TrustedDevicesPage = () => {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [confirmText, setConfirmText] = useState("");

    const { data, isLoading } = useTrustedDevices({
        search,
        page,
        pageSize: 10,
    });

    const deleteMutation = useDeleteTrustedDevice();

    const handleDelete = () => {
        if (!selectedId) return;

        deleteMutation.mutate(selectedId, {
            onSuccess: () => {
                setSelectedId(null);
                setConfirmText("");
            },
        });
    };

    const columns = [
        {
            title: t("trusted_devices.User"),
            dataIndex: ["user", "email"],
        },
        {
            title: t("trusted_devices.ipAddress"),
            dataIndex: "ipAddress",
        },
        {
            title: t("trusted_devices.Device Name"),
            dataIndex: "name",
        },
        {
            title: t("trusted_devices.Type"),
            dataIndex: "deviceType",
            render: (v: string) => <Tag>{v}</Tag>,
        },
        {
            title: t("trusted_devices.Browser"),
            dataIndex: "browser",
        },
        {
            title: t("trusted_devices.OS"),
            dataIndex: "os",
        },
        {
            title: t("trusted_devices.Actions"),
            render: (_: any, record: any) => (
                <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setSelectedId(record.id)}
                >
                    {t("trusted_devices.Delete")}
                </Button>
            ),
        },
    ];

    return (
        <>
            <Space style={{ marginBottom: 16 , width: "100%", justifyContent: "flex-end"}}>
                <Input.Search
                    placeholder={t("trusted_devices.Search by email or SSN")}
                    onSearch={setSearch}
                    allowClear
                />
            </Space>

            <Table
                title={() => <Typography.Title level={3}>{t("trusted_devices.Trusted Devices")}</Typography.Title>}
                rowKey="id"
                loading={isLoading}
                columns={columns}
                dataSource={data?.data?.data}
                pagination={{
                    current: page,
                    total: data?.data?.meta.total,
                    onChange: setPage,
                }}
            />

            <Modal
                styles={{
                    title: {
                        direction: i18next.language == 'ar'? 'rtl':'ltr'
                    },
                    body: {
                        direction: i18next.language == 'ar'? 'rtl':'ltr'
                    },
                    container: {
                        direction: i18next.language == 'ar'? 'rtl':'ltr'
                    }
                }}
                open={!!selectedId}
                onCancel={() => {
                    setSelectedId(null);
                    setConfirmText("");
                }}
                title={t("trusted_devices.Confirm Device Revocation")}
                footer={[
                    <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                        <Button
                            block
                            onClick={() => {
                                setSelectedId(null);
                                setConfirmText("");
                            }}
                        >
                            {t("trusted_devices.Cancel")}
                        </Button>

                        <Button
                            block
                            danger
                            disabled={confirmText.trim() !== CONFIRM_WORD}
                            loading={deleteMutation.isPending}
                            onClick={handleDelete}
                        >
                            {t("trusted_devices.Delete")}
                        </Button>
                    </div>
                ]}
            >
                <Text>
                    {t("trusted_devices.Type DELETE to confirm device revocation.")}
                </Text>

                <Input
                    style={{ marginTop: 12 }}
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={CONFIRM_WORD}
                />
            </Modal>
        </>
    );
};

export default TrustedDevicesPage;
