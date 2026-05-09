import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
  Upload,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import logoFallback from "../../../assets/HU-bg-clear.png";
import {
  useAllowedEmailDomains,
  useSiteSettings,
  useSiteSettingsMutations,
} from "../hooks/useSiteSettings";
import type { AllowedEmailDomain } from "../services/siteSettingsApi";
import { getErrorMessage } from "../../../utils/error";

const SiteSettingsPage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [domainForm] = Form.useForm<{ domain: string }>();
  const [editingDomain, setEditingDomain] = useState<AllowedEmailDomain | null>(null);

  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const { data: domains = [], isLoading: domainsLoading } = useAllowedEmailDomains();
  const {
    updateSettings,
    updateLogo,
    createDomain,
    updateDomain,
    deleteDomain,
  } = useSiteSettingsMutations();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        unassignedTicketAlertMinutes: settings.unassignedTicketAlertMinutes,
      });
    }
  }, [form, settings]);

  const handleSaveSettings = async () => {
    try {
      const values = await form.validateFields();
      await updateSettings.mutateAsync(values);
      message.success(t("siteSettings.saved"));
    } catch (error) {
      message.error(getErrorMessage(error, t("errors.submitFailed")));
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      await updateLogo.mutateAsync(file);
      message.success(t("siteSettings.logoUpdated"));
    } catch (error) {
      message.error(getErrorMessage(error, t("errors.uploadFailed")));
    }

    return false;
  };

  const handleAddDomain = async () => {
    try {
      const { domain } = await domainForm.validateFields();
      await createDomain.mutateAsync(domain);
      domainForm.resetFields();
      message.success(t("siteSettings.domainSaved"));
    } catch (error) {
      message.error(getErrorMessage(error, t("errors.submitFailed")));
    }
  };

  const handleUpdateDomain = async () => {
    if (!editingDomain) return;

    try {
      const { domain } = await domainForm.validateFields();
      await updateDomain.mutateAsync({ id: editingDomain.id, domain });
      setEditingDomain(null);
      domainForm.resetFields();
      message.success(t("siteSettings.domainSaved"));
    } catch (error) {
      message.error(getErrorMessage(error, t("errors.submitFailed")));
    }
  };

  const columns: ColumnsType<AllowedEmailDomain> = [
    {
      title: t("siteSettings.domain"),
      dataIndex: "domain",
      key: "domain",
      render: (domain: string) => <Typography.Text copyable>{domain}</Typography.Text>,
    },
    {
      title: t("user_list.operations"),
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingDomain(record);
              domainForm.setFieldsValue({ domain: record.domain });
            }}
          />
          <Popconfirm
            title={t("siteSettings.deleteDomainConfirm")}
            okText={t("translation.yes")}
            cancelText={t("translation.no")}
            onConfirm={() => deleteDomain.mutate(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} loading={deleteDomain.isPending} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>{t("siteSettings.title")}</Typography.Title>

      <Flex gap={16} align="stretch" wrap="wrap">
        <Card
          title={t("siteSettings.logo")}
          loading={settingsLoading}
          style={{ flex: "1 1 320px" }}
        >
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Avatar
              shape="square"
              size={96}
              src={settings?.logoUrl || logoFallback}
              style={{ objectFit: "contain", background: "#fff" }}
            />
            <Upload showUploadList={false} accept="image/*" beforeUpload={handleLogoUpload}>
              <Button icon={<UploadOutlined />} loading={updateLogo.isPending}>
                {t("siteSettings.uploadLogo")}
              </Button>
            </Upload>
          </Space>
        </Card>

        <Card title={t("siteSettings.alerting")} style={{ flex: "1 1 320px" }}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="unassignedTicketAlertMinutes"
              label={t("siteSettings.unassignedAlertMinutes")}
              rules={[{ required: true, message: t("required") }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Button type="primary" onClick={handleSaveSettings} loading={updateSettings.isPending}>
              {t("common.save")}
            </Button>
          </Form>
        </Card>
      </Flex>

      <Card title={t("siteSettings.allowedDomains")} style={{ marginTop: 16 }}>
        <Form form={domainForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item
            name="domain"
            rules={[
              { required: true, message: t("required") },
              { pattern: /^[a-z0-9.-]+\.[a-z]{2,}$/i, message: t("siteSettings.invalidDomain") },
            ]}
            style={{ flex: 1, minWidth: 240 }}
          >
            <Input placeholder={t("siteSettings.domainPlaceholder")} />
          </Form.Item>
          <Button type="primary" onClick={handleAddDomain} loading={createDomain.isPending}>
            {t("siteSettings.addDomain")}
          </Button>
        </Form>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={domains}
          loading={domainsLoading}
          pagination={false}
        />
      </Card>

      <Modal
        title={t("siteSettings.editDomain")}
        open={!!editingDomain}
        onCancel={() => {
          setEditingDomain(null);
          domainForm.resetFields();
        }}
        onOk={handleUpdateDomain}
        confirmLoading={updateDomain.isPending}
        okText={t("common.save")}
      >
        <Form form={domainForm} layout="vertical">
          <Form.Item
            name="domain"
            label={t("siteSettings.domain")}
            rules={[
              { required: true, message: t("required") },
              { pattern: /^[a-z0-9.-]+\.[a-z]{2,}$/i, message: t("siteSettings.invalidDomain") },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SiteSettingsPage;
