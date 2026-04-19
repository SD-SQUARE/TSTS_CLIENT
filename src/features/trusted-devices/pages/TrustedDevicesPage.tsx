// features/trusted-devices/pages/TrustedDevicesPage.tsx
import { Input,Button, Tag, Modal, Typography } from "antd";
import { useState } from "react";
import { useTrustedDevices, useDeleteTrustedDevice } from "../hooks/useTrustedDevices";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { DeleteOutlined } from "@ant-design/icons";
import AppTable from "../../../components/AppTable";
import {
  getServerSelectFilterProps,
  getServerTextFilterProps,
} from "../../../components/table/serverFilters";

const { Text } = Typography;

const CONFIRM_WORD = "DELETE";

const TrustedDevicesPage = () => {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        user: undefined as string | undefined,
        ipAddress: undefined as string | undefined,
        name: undefined as string | undefined,
        deviceType: undefined as string | undefined,
        browser: undefined as string | undefined,
        os: undefined as string | undefined,
    });

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [confirmText, setConfirmText] = useState("");

    const { data, isLoading } = useTrustedDevices({
        page,
        pageSize: 10,
        ...filters,
    });

    const deleteMutation = useDeleteTrustedDevice();
    const resetToFirstPage = () => setPage(1);

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
            ...getServerTextFilterProps({
                filterKey: "user",
                filters,
                setFilters,
                placeholder: t("trusted_devices.Search by email or SSN"),
                onChange: resetToFirstPage,
            }),
        },
        {
            title: t("trusted_devices.ipAddress"),
            dataIndex: "ipAddress",
            ...getServerTextFilterProps({
                filterKey: "ipAddress",
                filters,
                setFilters,
                placeholder: `${t("common.search")} ${t("trusted_devices.ipAddress")}`,
                onChange: resetToFirstPage,
            }),
        },
        {
            title: t("trusted_devices.Device Name"),
            dataIndex: "name",
            ...getServerTextFilterProps({
                filterKey: "name",
                filters,
                setFilters,
                placeholder: `${t("common.search")} ${t("trusted_devices.Device Name")}`,
                onChange: resetToFirstPage,
            }),
        },
        {
            title: t("trusted_devices.Type"),
            dataIndex: "deviceType",
            render: (v: string) => <Tag>{v}</Tag>,
            ...getServerSelectFilterProps({
                filterKey: "deviceType",
                filters,
                setFilters,
                placeholder: `${t("common.select")} ${t("trusted_devices.Type")}`,
                options: [
                    { label: "Desktop", value: "desktop" },
                    { label: "Laptop", value: "laptop" },
                    { label: "Mobile", value: "mobile" },
                    { label: "Tablet", value: "tablet" },
                ],
                onChange: resetToFirstPage,
            }),
        },
        {
            title: t("trusted_devices.Browser"),
            dataIndex: "browser",
            ...getServerTextFilterProps({
                filterKey: "browser",
                filters,
                setFilters,
                placeholder: `${t("common.search")} ${t("trusted_devices.Browser")}`,
                onChange: resetToFirstPage,
            }),
        },
        {
            title: t("trusted_devices.OS"),
            dataIndex: "os",
            ...getServerTextFilterProps({
                filterKey: "os",
                filters,
                setFilters,
                placeholder: `${t("common.search")} ${t("trusted_devices.OS")}`,
                onChange: resetToFirstPage,
            }),
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
            <AppTable
                title={() => <Typography.Title level={3}>{t("trusted_devices.Trusted Devices")}</Typography.Title>}
                rowKey="id"
                skeletonLoading={isLoading}
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
