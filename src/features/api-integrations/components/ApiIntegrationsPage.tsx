import { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, PlusOutlined, ApiOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  useApiIntegrationMeta,
  useApiKeyMutations,
  useApiKeys,
} from "../hooks/useApiIntegrations";
import type { ApiKeyPayload, ApiKeyRecord } from "../services/apiIntegrationsApi";
import { getErrorMessage } from "../../../utils/error";

type ApiKeyFormValues = Omit<ApiKeyPayload, "expiresAt"> & {
  expiresAt?: Dayjs | null;
};

const ApiIntegrationsPage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<ApiKeyFormValues>();
  const [editingKey, setEditingKey] = useState<ApiKeyRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const { data: meta, isLoading: metaLoading } = useApiIntegrationMeta();
  const { data: apiKeys = [], isLoading } = useApiKeys();
  const { createKey, updateKey, revokeKey } = useApiKeyMutations();

  const zoneLabelMap = useMemo(
    () => new Map((meta?.zones ?? []).map((zone) => [zone.key, zone.label])),
    [meta?.zones],
  );

  const openCreateModal = () => {
    setEditingKey(null);
    form.setFieldsValue({
      name: "",
      description: "",
      zones: [],
      methods: ["GET"],
      expiresAt: null,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record: ApiKeyRecord) => {
    setEditingKey(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description ?? "",
      zones: record.zones,
      methods: record.methods,
      expiresAt: record.expiresAt ? dayjs(record.expiresAt) : null,
      isActive: record.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingKey(null);
    form.resetFields();
  };

  const normalizePayload = (values: ApiKeyFormValues): ApiKeyPayload => ({
    ...values,
    description: values.description?.trim() || null,
    expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
    isActive: values.isActive !== false,
  });

  const handleSave = async () => {
    try {
      const values = normalizePayload(await form.validateFields());
      if (editingKey) {
        await updateKey.mutateAsync({ id: editingKey.id, payload: values });
        message.success(t("apiIntegrations.saved"));
      } else {
        const result = await createKey.mutateAsync(values);
        setGeneratedKey(result.key);
        message.success(t("apiIntegrations.created"));
      }
      closeModal();
    } catch (error) {
      message.error(getErrorMessage(error, t("errors.submitFailed")));
    }
  };

  const formatDate = (value?: string | null) =>
    value ? dayjs(value).format("YYYY-MM-DD HH:mm") : t("common.none");

  const columns: ColumnsType<ApiKeyRecord> = [
    {
      title: t("apiIntegrations.name"),
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.name}</Typography.Text>
          {record.description ? (
            <Typography.Text type="secondary">{record.description}</Typography.Text>
          ) : null}
        </Space>
      ),
    },
    {
      title: t("apiIntegrations.prefix"),
      dataIndex: "keyPrefix",
      key: "keyPrefix",
      width: 130,
      render: (prefix: string) => <Typography.Text copyable>{prefix}</Typography.Text>,
    },
    {
      title: t("apiIntegrations.zones"),
      dataIndex: "zones",
      key: "zones",
      width: 260,
      render: (zones: string[]) => (
        <Space size={[4, 4]} wrap>
          {zones.map((zone) => (
            <Tag color="blue" key={zone}>
              {zoneLabelMap.get(zone) ?? zone}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t("apiIntegrations.methods"),
      dataIndex: "methods",
      key: "methods",
      width: 210,
      render: (methods: string[]) => (
        <Space size={[4, 4]} wrap>
          {methods.map((method) => (
            <Tag color="geekblue" key={method}>
              {method}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t("user_list.status"),
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "default"}>
          {isActive ? t("apiIntegrations.active") : t("apiIntegrations.inactive")}
        </Tag>
      ),
    },
    {
      title: t("apiIntegrations.lastUsed"),
      dataIndex: "lastUsedAt",
      key: "lastUsedAt",
      width: 170,
      render: formatDate,
    },
    {
      title: t("apiIntegrations.expiresAt"),
      dataIndex: "expiresAt",
      key: "expiresAt",
      width: 170,
      render: formatDate,
    },
    {
      title: t("user_list.operations"),
      key: "actions",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title={t("apiIntegrations.revokeConfirm")}
            okText={t("translation.yes")}
            cancelText={t("translation.no")}
            onConfirm={() => revokeKey.mutate(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} loading={revokeKey.isPending} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, minWidth: 0, overflow: 'hidden' }}>
      <Flex justify="space-between" align="center" gap={16} wrap="wrap" style={{ marginBottom: 16 }}>
        <div>
          <Typography.Title level={2} style={{ margin: 0 }}>
            {t("apiIntegrations.title")}
          </Typography.Title>
          <Typography.Text type="secondary">{t("apiIntegrations.subtitle")}</Typography.Text>
        </div>
        <Space wrap>
          <Button
            icon={<ApiOutlined />}
            onClick={() => {
              const url = `${window.location.origin}/api-integration-guide`;
              navigator.clipboard.writeText(url).then(() =>
                message.success(t("apiIntegrations.guideLinkCopied", "Integration guide link copied!"))
              );
            }}
          >
            {t("apiIntegrations.viewDocs", "Copy Guide Link")}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            {t("apiIntegrations.createKey")}
          </Button>
        </Space>
      </Flex>

      {/* Scopes reference */}
      {meta?.zones && meta.zones.length > 0 && (
        <Card style={{ marginBottom: 16 }} title={t("apiIntegrations.availableScopes", "Available Scopes")}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {meta.zones.map((zone) => (
              <Card
                key={zone.key}
                size="small"
                style={{ borderRadius: 10 }}
                title={
                  <Space>
                    <Tag color="blue">{zone.key}</Tag>
                    <Typography.Text strong>{zone.label}</Typography.Text>
                  </Space>
                }
              >
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {zone.description}
                </Typography.Text>
                {zone.paths?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {zone.paths.slice(0, 3).map((p) => (
                      <Typography.Text
                        key={p}
                        code
                        style={{ display: "block", fontSize: 11, marginBottom: 2 }}
                      >
                        {p}
                      </Typography.Text>
                    ))}
                    {zone.paths.length > 3 && (
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        {t("apiIntegrations.morePaths", "+{{count}} more", { count: zone.paths.length - 3 })}
                      </Typography.Text>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
          {meta.methods?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Typography.Text type="secondary" style={{ marginRight: 8 }}>
                {t("apiIntegrations.allowedMethods", "Allowed HTTP Methods:")}
              </Typography.Text>
              <Space size={[4, 4]} wrap>
                {meta.methods.map((m) => (
                  <Tag color="geekblue" key={m}>{m}</Tag>
                ))}
              </Space>
            </div>
          )}
        </Card>
      )}

      <Card>
        <div style={{ overflowX: "auto" }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={apiKeys}
            loading={isLoading || metaLoading}
            scroll={{ x: 1180 }}
          />
        </div>
      </Card>

      <Modal
        title={editingKey ? t("apiIntegrations.editKey") : t("apiIntegrations.createKey")}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        confirmLoading={createKey.isPending || updateKey.isPending}
        okText={t("common.save")}
        width={760}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t("apiIntegrations.name")}
            rules={[{ required: true, message: t("required") }]}
          >
            <Input maxLength={150} />
          </Form.Item>

          <Form.Item name="description" label={t("apiIntegrations.description")}>
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} maxLength={500} />
          </Form.Item>

          <Form.Item
            name="zones"
            label={t("apiIntegrations.zones")}
            rules={[{ required: true, message: t("required") }]}
          >
            <Select
              mode="multiple"
              optionFilterProp="label"
              style={{ width: "100%", minWidth: "150px" }}
              options={(meta?.zones ?? []).map((zone) => ({
                value: zone.key,
                label: zone.label,
                title: zone.description,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="methods"
            label={t("apiIntegrations.methods")}
            rules={[{ required: true, message: t("required") }]}
          >
            <Checkbox.Group 
              options={(meta?.methods ?? []).map((method) => ({
                label: method,
                value: method,
              }))} 
            />
          </Form.Item>

          <Flex gap={16} align="center" wrap="wrap">
            <Form.Item name="expiresAt" label={t("apiIntegrations.expiresAt")} style={{ flex: "1 1 260px" }}>
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="isActive" label={t("apiIntegrations.active")} valuePropName="checked">
              <Switch />
            </Form.Item>
          </Flex>
        </Form>
      </Modal>

      <Modal
        title={t("apiIntegrations.generatedKeyTitle")}
        open={!!generatedKey}
        onCancel={() => setGeneratedKey(null)}
        footer={[
          <Button type="primary" key="done" onClick={() => setGeneratedKey(null)}>
            {t("common.done")}
          </Button>,
        ]}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Alert type="warning" showIcon message={t("apiIntegrations.generatedKeyWarning")} />
          <Typography.Paragraph copyable={{ text: generatedKey ?? "" }}>
            <Typography.Text code>{generatedKey}</Typography.Text>
          </Typography.Paragraph>
        </Space>
      </Modal>
    </div>
  );
};

export default ApiIntegrationsPage;
