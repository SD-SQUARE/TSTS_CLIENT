import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Collapse,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ApiOutlined,
  CheckCircleOutlined,
  CloudOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  LaptopOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import logoFallback from "../../../assets/HU-bg-clear.png";
import {
  useAllowedEmailDomains,
  useSiteSettings,
  useSiteSettingsMutations,
} from "../hooks/useSiteSettings";
import type { AllowedEmailDomain } from "../services/siteSettingsApi";
import { getErrorMessage } from "../../../utils/error";

const { Text, Title, Paragraph } = Typography;

// ─── Provider examples ────────────────────────────────────────────────────────

const PROVIDER_EXAMPLES = [
  {
    key: "ollama",
    icon: <LaptopOutlined />,
    label: "Ollama (Local — Default)",
    color: "green",
    chatUrl: "http://localhost:11434",
    model: "llama3.2",
    apiKey: "",
    note: "No API key needed. Runs entirely on your server. Best for privacy.",
  },
  {
    key: "openrouter",
    icon: <CloudOutlined />,
    label: "OpenRouter",
    color: "blue",
    chatUrl: "https://openrouter.ai/api/v1",
    model: "meta-llama/llama-3.2-3b-instruct:free",
    apiKey: "sk-or-v1-...",
    note: "Get a free key at openrouter.ai. Supports 100+ models including free tiers.",
  },
  {
    key: "openai",
    icon: <ApiOutlined />,
    label: "OpenAI",
    color: "purple",
    chatUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "sk-...",
    note: "Requires a paid OpenAI account. Very capable but costs per token.",
  },
  {
    key: "groq",
    icon: <CloudOutlined />,
    label: "Groq (Fast Inference)",
    color: "orange",
    chatUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.1-8b-instant",
    apiKey: "gsk_...",
    note: "Free tier available at console.groq.com. Extremely fast inference.",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const SiteSettingsPage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [aiForm] = Form.useForm();
  const [domainForm] = Form.useForm<{ domain: string }>();
  const [editingDomain, setEditingDomain] = useState<AllowedEmailDomain | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const { data: domains = [], isLoading: domainsLoading } = useAllowedEmailDomains();
  const { updateSettings, updateLogo, createDomain, updateDomain, deleteDomain } =
    useSiteSettingsMutations();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({ unassignedTicketAlertMinutes: settings.unassignedTicketAlertMinutes });
      setAiEnabled(settings.aiAssistantEnabled ?? true);
      aiForm.setFieldsValue({
        aiAssistantEnabled: settings.aiAssistantEnabled ?? true,
        aiModelName: settings.aiModelName || "",
        aiApiKey: settings.aiApiKey || "",
        aiChatUrl: settings.aiChatUrl || "",
      });
    }
  }, [form, aiForm, settings]);

  const handleSaveSettings = async () => {
    try {
      const values = await form.validateFields();
      await updateSettings.mutateAsync(values);
      message.success(t("siteSettings.saved"));
    } catch (error) {
      message.error(getErrorMessage(error, t("errors.submitFailed")));
    }
  };

  const handleSaveAiSettings = async () => {
    try {
      const values = await aiForm.validateFields();
      await updateSettings.mutateAsync({
        aiAssistantEnabled: values.aiAssistantEnabled,
        aiModelName: values.aiModelName || null,
        aiApiKey: values.aiApiKey || null,
        aiChatUrl: values.aiChatUrl || null,
      });
      message.success(t("siteSettings.saved"));
    } catch (error) {
      message.error(getErrorMessage(error, t("errors.submitFailed")));
    }
  };

  const applyExample = (example: typeof PROVIDER_EXAMPLES[0]) => {
    aiForm.setFieldsValue({
      aiChatUrl: example.chatUrl,
      aiModelName: example.model,
      aiApiKey: example.apiKey,
    });
    message.info(`Applied ${example.label} example. Update the API key if needed.`);
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
      render: (domain: string) => <Text copyable>{domain}</Text>,
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

  // ─── AI Tab Content ─────────────────────────────────────────────────────────

  const aiTabContent = (
    <Flex gap={24} vertical>
      {/* Quick-start provider cards */}
      <Card
        title={
          <Space>
            <QuestionCircleOutlined />
            {t("siteSettings.aiAssistant.quickStart")}
          </Space>
        }
        size="small"
      >
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          {t("siteSettings.aiAssistant.quickStartDesc")}
        </Paragraph>
        <Flex gap={12} wrap="wrap">
          {PROVIDER_EXAMPLES.map((ex) => {
            // Determine if this provider card matches the currently saved settings
            const savedUrl = (settings?.aiChatUrl || "").toLowerCase().trim();
            const savedModel = (settings?.aiModelName || "").trim();
            const exHost = ex.chatUrl.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
            const urlMatches = savedUrl
              ? savedUrl.replace(/^https?:\/\//, "").startsWith(exHost)
              : ex.key === "ollama";
            const modelMatches = savedModel ? savedModel === ex.model : ex.key === "ollama";
            const isCurrentActive = urlMatches && modelMatches;

            return (
              <Card
                key={ex.key}
                size="small"
                hoverable
                style={{
                  width: 220,
                  cursor: "pointer",
                  borderColor: isCurrentActive ? "#52c41a" : ex.key === "ollama" ? "#d9f7be" : undefined,
                  boxShadow: isCurrentActive ? "0 0 0 2px #52c41a33" : undefined,
                }}
                onClick={() => applyExample(ex)}
              >
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  <Space>
                    {ex.icon}
                    <Text strong>{ex.label}</Text>
                    {ex.key === "ollama" && <Tag color="green">Default</Tag>}
                    {isCurrentActive && <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>}
                  </Space>
                  <Text type="secondary" style={{ fontSize: 11 }}>{ex.note}</Text>
                  <Divider style={{ margin: "6px 0" }} />
                  <Text code style={{ fontSize: 11 }}>{ex.model}</Text>
                  <Button size="small" type={isCurrentActive ? "primary" : "dashed"} block onClick={() => applyExample(ex)}>
                    {isCurrentActive ? "Current" : "Apply"}
                  </Button>
                </Space>
              </Card>
            );
          })}
        </Flex>
      </Card>

      {/* Configuration form */}
      <Card
        title={
          <Space>
            <RobotOutlined />
            {t("siteSettings.aiAssistant.title")}
          </Space>
        }
        loading={settingsLoading}
      >
        <Form form={aiForm} layout="vertical" style={{ maxWidth: 640 }}>
          {/* Enable / Disable */}
          <Form.Item
            name="aiAssistantEnabled"
            label={t("siteSettings.aiAssistant.enabled")}
            valuePropName="checked"
          >
            <Switch
              checkedChildren={t("common.enabled")}
              unCheckedChildren={t("common.disabled")}
              onChange={(val) => setAiEnabled(val)}
            />
          </Form.Item>

          {!aiEnabled && (
            <Alert
              type="warning"
              showIcon
              message={t("siteSettings.aiAssistant.disabledWarning")}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Chat URL */}
          <Form.Item
            name="aiChatUrl"
            label={
              <Space>
                {t("siteSettings.aiAssistant.chatUrl")}
                <Tooltip title={t("siteSettings.aiAssistant.chatUrlHint")}>
                  <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                </Tooltip>
              </Space>
            }
          >
            <Input
              placeholder={t("siteSettings.aiAssistant.chatUrlPlaceholder")}
              disabled={!aiEnabled}
            />
          </Form.Item>

          {/* Model name */}
          <Form.Item
            name="aiModelName"
            label={
              <Space>
                {t("siteSettings.aiAssistant.modelName")}
                <Tooltip title={t("siteSettings.aiAssistant.modelNameHint")}>
                  <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                </Tooltip>
              </Space>
            }
          >
            <Input
              placeholder={t("siteSettings.aiAssistant.modelNamePlaceholder")}
              disabled={!aiEnabled}
            />
          </Form.Item>

          {/* API Key */}
          <Form.Item
            name="aiApiKey"
            label={
              <Space>
                {t("siteSettings.aiAssistant.apiKey")}
                <Tooltip title={t("siteSettings.aiAssistant.apiKeyHint")}>
                  <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                </Tooltip>
              </Space>
            }
          >
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder={t("siteSettings.aiAssistant.apiKeyPlaceholder")}
              disabled={!aiEnabled}
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={showApiKey ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => setShowApiKey((v) => !v)}
                />
              }
            />
          </Form.Item>

          {/* How it works info box */}
          <Collapse
            ghost
            style={{ marginBottom: 16 }}
            items={[
              {
                key: "how",
                label: (
                  <Space>
                    <InfoCircleOutlined />
                    {t("siteSettings.aiAssistant.howItWorks")}
                  </Space>
                ),
                children: (
                  <Flex vertical gap={8}>
                    <Alert
                      type="success"
                      showIcon
                      icon={<LaptopOutlined />}
                      message={
                        <div>
                          <Text strong>Local Ollama (no API key)</Text>
                          <br />
                          <Text type="secondary">
                            Leave the API key empty. Set Chat URL to your Ollama server (default:{" "}
                            <Text code>http://localhost:11434</Text>). The system uses Ollama's{" "}
                            <Text code>/api/chat</Text> endpoint. No data leaves your network.
                          </Text>
                        </div>
                      }
                    />
                    <Alert
                      type="info"
                      showIcon
                      icon={<CloudOutlined />}
                      message={
                        <div>
                          <Text strong>Remote / OpenAI-compatible (with API key)</Text>
                          <br />
                          <Text type="secondary">
                            Set an API key and the Chat URL to the provider's base URL. The system
                            uses the OpenAI-compatible <Text code>/chat/completions</Text> endpoint.
                            Works with OpenRouter, OpenAI, Groq, Together AI, and any compatible
                            provider.
                          </Text>
                        </div>
                      }
                    />
                    <Divider style={{ margin: "4px 0" }} />
                    <Title level={5} style={{ margin: 0 }}>OpenRouter example (free models available)</Title>
                    <ol style={{ margin: 0, paddingInlineStart: 20 }}>
                      <li>Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">openrouter.ai/keys</a> and create a free API key</li>
                      <li>Set <b>Chat URL</b> to <Text code>https://openrouter.ai/api/v1</Text></li>
                      <li>Set <b>Model</b> to <Text code>meta-llama/llama-3.2-3b-instruct:free</Text> (free)</li>
                      <li>Paste your key in <b>API Key</b></li>
                      <li>Click Save and test with the AI Assistant</li>
                    </ol>
                    <Divider style={{ margin: "4px 0" }} />
                    <Title level={5} style={{ margin: 0 }}>Ollama local setup</Title>
                    <ol style={{ margin: 0, paddingInlineStart: 20 }}>
                      <li>Install Ollama from <a href="https://ollama.com" target="_blank" rel="noreferrer">ollama.com</a></li>
                      <li>Run: <Text code>ollama pull llama3.2</Text></li>
                      <li>Leave API Key empty, set Chat URL to <Text code>http://localhost:11434</Text></li>
                      <li>Set Model to <Text code>llama3.2</Text></li>
                      <li>Click Save — the system will auto-detect Ollama mode</li>
                    </ol>
                  </Flex>
                ),
              },
            ]}
          />

          <Alert
            type="info"
            showIcon
            icon={<CheckCircleOutlined />}
            message={t("siteSettings.aiAssistant.configNote")}
            style={{ marginBottom: 16 }}
          />

          <Button
            type="primary"
            onClick={handleSaveAiSettings}
            loading={updateSettings.isPending}
            icon={<RobotOutlined />}
          >
            {t("siteSettings.aiAssistant.save")}
          </Button>
        </Form>
      </Card>
    </Flex>
  );

  // ─── Tab items ──────────────────────────────────────────────────────────────

  const tabItems = [
    {
      key: "general",
      label: t("siteSettings.tabs.general"),
      children: (
        <Flex gap={16} align="stretch" wrap="wrap">
          <Card title={t("siteSettings.logo")} loading={settingsLoading} style={{ flex: "1 1 320px" }}>
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
      ),
    },
    {
      key: "ai",
      label: (
        <Space>
          <RobotOutlined />
          {t("siteSettings.tabs.aiAssistant")}
          {settings && (
            <Tag color={settings.aiAssistantEnabled ? "green" : "default"} style={{ marginInlineStart: 4 }}>
              {settings.aiAssistantEnabled ? t("common.enabled") : t("common.disabled")}
            </Tag>
          )}
        </Space>
      ),
      children: aiTabContent,
    },
    {
      key: "domains",
      label: t("siteSettings.tabs.emailDomains"),
      children: (
        <Card title={t("siteSettings.allowedDomains")}>
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
          <Table rowKey="id" columns={columns} dataSource={domains} loading={domainsLoading} pagination={false} />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>{t("siteSettings.title")}</Title>
      <Tabs items={tabItems} defaultActiveKey="general" />

      <Modal
        title={t("siteSettings.editDomain")}
        open={!!editingDomain}
        onCancel={() => { setEditingDomain(null); domainForm.resetFields(); }}
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
