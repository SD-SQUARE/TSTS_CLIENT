import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileAddOutlined,
  LinkOutlined,
  PlusOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { APP_BASE_PATH } from "../../../app/config";
import { customFormApi } from "../services/customFormApi";
import type { CustomForm } from "../types";
import { getErrorMessage } from "../../../utils/error";
import "./customForms.css";

const { Paragraph, Text, Title } = Typography;

interface CustomFormManagerProps {
  ticketId?: string;
  isGlobal?: boolean;
  embedded?: boolean;
}

const buildAppPath = (path: string) => {
  const base = APP_BASE_PATH
    ? `/${APP_BASE_PATH.replace(/^\/+|\/+$/g, "")}`
    : "";

  return `${base}${path}`;
};

const buildPublicFormUrl = (token: string) => {
  const base = APP_BASE_PATH
    ? `/${APP_BASE_PATH.replace(/^\/+|\/+$/g, "")}`
    : "";

  return `${window.location.origin}${base}/f/${token}`;
};

const getLocalizedValue = (
  language: string,
  en?: string | null,
  ar?: string | null,
  fallback?: string | null,
) => (language.startsWith("ar") ? ar || en || fallback || "" : en || ar || fallback || "");

const CustomFormManager = ({
  ticketId,
  isGlobal = true,
  embedded = true,
}: CustomFormManagerProps) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [shareForm, setShareForm] = useState<CustomForm | null>(null);
  const [shareExpiresInHours, setShareExpiresInHours] = useState(72);

  const scope = ticketId ? "ticket" : "template";
  const returnTo = useMemo(() => {
    if (
      !ticketId &&
      location.pathname.endsWith("/profile") &&
      !location.search.includes("tab=")
    ) {
      return `${location.pathname}?tab=settings${location.hash || ""}`;
    }

    return `${location.pathname}${location.search}${location.hash}`;
  }, [location.hash, location.pathname, location.search, ticketId]);

  const listQuery = useQuery({
    queryKey: ["custom-forms", scope, ticketId, isGlobal],
    queryFn: () =>
      customFormApi.list(ticketId ? { ticketId } : { isGlobal: true }),
  });

  const templateLibraryQuery = useQuery({
    queryKey: ["custom-form-templates"],
    queryFn: () => customFormApi.list({ isGlobal: true }),
    enabled: Boolean(ticketId && templateModalOpen),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customFormApi.delete(id),
    onSuccess: async () => {
      message.success("Form deleted.");
      await queryClient.invalidateQueries({ queryKey: ["custom-forms"] });
      await queryClient.invalidateQueries({ queryKey: ["custom-form-templates"] });
    },
    onError: (error) => message.error(getErrorMessage(error, "Form could not be deleted.")),
  });

  const attachTemplateMutation = useMutation({
    mutationFn: (templateId: string) =>
      customFormApi.duplicateToTicket(templateId, { ticketId: ticketId! }),
    onSuccess: async () => {
      message.success("Template added to this ticket.");
      setTemplateModalOpen(false);
      setSelectedTemplateId(undefined);
      await queryClient.invalidateQueries({ queryKey: ["custom-forms"] });
    },
    onError: (error) =>
      message.error(getErrorMessage(error, "Template could not be attached.")),
  });

  const shareMutation = useMutation({
    mutationFn: (formId: string) =>
      customFormApi.createShareLink(formId, {
        expiresInHours: shareExpiresInHours,
      }),
    onSuccess: async (shareLink) => {
      try {
        await navigator.clipboard.writeText(buildPublicFormUrl(shareLink.token));
        message.success(
          `Link copied. It expires ${dayjs(shareLink.expiresAt).format("MMM D, YYYY h:mm A")}.`,
        );
      } catch {
        message.info(buildPublicFormUrl(shareLink.token));
      }

      setShareModalOpen(false);
      setShareForm(null);
    },
    onError: (error) =>
      message.error(getErrorMessage(error, "Share link could not be created.")),
  });

  const forms = listQuery.data || [];

  const summary = useMemo(
    () => ({
      totalForms: forms.length,
      totalResponses: forms.reduce(
        (sum, form) => sum + (form.responseCount || 0),
        0,
      ),
      newestForm: forms[0]?.createdAt || null,
    }),
    [forms],
  );

  const heading = ticketId ? "Ticket forms" : "Form library";
  const subheading = ticketId
    ? "Attach reusable templates, create ticket-specific forms, and manage public response links per ticket."
    : "Create polished reusable forms from your profile settings, then deploy them inside tickets whenever you need them.";

  const openCreatePage = () => {
    const params = new URLSearchParams();
    params.set("returnTo", returnTo);

    if (ticketId) {
      params.set("ticketId", ticketId);
    } else {
      params.set("isGlobal", "true");
    }

    navigate(`${buildAppPath("/forms/new")}?${params.toString()}`);
  };

  const openEditPage = (form: CustomForm) => {
    const params = new URLSearchParams();
    params.set("returnTo", returnTo);
    navigate(`${buildAppPath(`/forms/${form.id}/edit`)}?${params.toString()}`);
  };

  const openPreviewPage = (form: CustomForm) => {
    navigate(buildAppPath(`/forms/${form.id}/preview`));
  };

  const openResponsesPage = (form: CustomForm) => {
    navigate(buildAppPath(`/forms/${form.id}/responses`));
  };

  const showShareModal = (form: CustomForm) => {
    setShareForm(form);
    setShareExpiresInHours(72);
    setShareModalOpen(true);
  };

  return (
    <div
      className="custom-forms-shell"
      style={{ padding: embedded ? 0 : 24 }}
    >
      <div className="custom-forms-hero">
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
          <div style={{ maxWidth: 760 }}>
            <Tag color="gold" bordered={false}>
              {ticketId ? "Ticket workflow" : "Profile settings"}
            </Tag>
            <Title level={2} style={{ marginTop: 12, marginBottom: 8 }}>
              {heading}
            </Title>
            <Paragraph style={{ marginBottom: 0 }}>{subheading}</Paragraph>
          </div>

          <Space wrap>
            {ticketId && (
              <Button
                icon={<FileAddOutlined />}
                onClick={() => setTemplateModalOpen(true)}
                style={
                    {
                        "backgroundColor": "var(--color-secondary)",
                    }    
                }              
              >
                Use template
              </Button>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreatePage}
            >
              {ticketId ? "Create ticket form" : "Create template"}
            </Button>
          </Space>
        </Flex>
      </div>

      <Row gutter={[16, 16]} className="custom-forms-grid">
        <Col xs={24} md={8}>
          <Card className="custom-form-summary-card">
            <Statistic title="Forms" value={summary.totalForms} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="custom-form-summary-card">
            <Statistic title="Responses" value={summary.totalResponses} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="custom-form-summary-card">
            <Statistic
              title="Latest created"
              value={
                summary.newestForm
                  ? dayjs(summary.newestForm).format("MMM D, YYYY")
                  : "No forms yet"
              }
            />
          </Card>
        </Col>
      </Row>

      {listQuery.isLoading ? (
        <Row gutter={[16, 16]} className="custom-forms-grid">
          {[1, 2, 3].map((item) => (
            <Col xs={24} md={12} xl={8} key={item}>
              <Card loading className="custom-form-item-card" />
            </Col>
          ))}
        </Row>
      ) : forms.length === 0 ? (
        <Card className="custom-form-item-card">
          <Empty
            description={
              ticketId
                ? "No forms are attached to this ticket yet."
                : "Your reusable form library is still empty."
            }
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]} className="custom-forms-grid">
          {forms.map((form) => (
            (() => {
              const localizedTitle = getLocalizedValue(
                i18n.language,
                form.title_en,
                form.title_ar,
                form.title,
              );
              const localizedDescription = getLocalizedValue(
                i18n.language,
                form.description_en,
                form.description_ar,
                form.description,
              );

              return (
            <Col xs={24} md={12} xl={8} key={form.id}>
              <Card className="custom-form-item-card">
                <div className="custom-form-item-card__header">
                  <div>
                    <Space wrap className="custom-form-item-card__meta">
                      <Tag color={form.isGlobal ? "blue" : "gold"}>
                        {form.isGlobal ? "Template" : "Ticket form"}
                      </Tag>
                      <Tag>{form.fields.length} questions</Tag>
                      <Tag>{form.responseCount || 0} responses</Tag>
                    </Space>

                    <Title level={4} style={{ marginTop: 14, marginBottom: 8 }}>
                      {localizedTitle}
                    </Title>

                    <Paragraph type="secondary" ellipsis={{ rows: 3 }}>
                      {localizedDescription || "No description provided."}
                    </Paragraph>
                  </div>
                </div>

                <Flex vertical gap={10}>
                  <Text type="secondary">
                    Updated {dayjs(form.updatedAt).format("MMM D, YYYY h:mm A")}
                  </Text>

                  <Space wrap>
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => openPreviewPage(form)}
                    >
                      Preview
                    </Button>

                    <Button
                      icon={<TableOutlined />}
                      onClick={() => openResponsesPage(form)}
                    >
                      Responses
                    </Button>

                    <Button
                      icon={<EditOutlined />}
                      onClick={() => openEditPage(form)}
                    >
                      Edit
                    </Button>

                    <Button
                      icon={<LinkOutlined />}
                      onClick={() => showShareModal(form)}
                    >
                      Share
                    </Button>

                    <Popconfirm
                      title="Delete this form?"
                      description="Responses linked to it will be removed as well."
                      okText="Delete"
                      cancelText="Cancel"
                      onConfirm={() => deleteMutation.mutate(form.id)}
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        loading={
                          deleteMutation.isPending &&
                          deleteMutation.variables === form.id
                        }
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                </Flex>
              </Card>
            </Col>
              );
            })()
          ))}
        </Row>
      )}

      <Modal
        title="Attach a template"
        open={templateModalOpen}
        onCancel={() => setTemplateModalOpen(false)}
        onOk={() =>
          selectedTemplateId && attachTemplateMutation.mutate(selectedTemplateId)
        }
        okButtonProps={{
          disabled: !selectedTemplateId,
          loading: attachTemplateMutation.isPending,
        }}
        okText="Attach"
      >
        <Paragraph type="secondary">
          Pick one of your reusable templates and clone it into this ticket.
          Each ticket keeps its own copy and responses.
        </Paragraph>

        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="Choose a template"
          value={selectedTemplateId}
          onChange={setSelectedTemplateId}
          options={(templateLibraryQuery.data || []).map((form) => ({
            value: form.id,
            label: `${getLocalizedValue(i18n.language, form.title_en, form.title_ar, form.title)} (${form.fields.length} questions)`,
          }))}
          loading={templateLibraryQuery.isLoading}
        />
      </Modal>

      <Modal
        title={`Share "${getLocalizedValue(i18n.language, shareForm?.title_en, shareForm?.title_ar, shareForm?.title) || "form"}"`}
        open={shareModalOpen}
        onCancel={() => {
          setShareModalOpen(false);
          setShareForm(null);
        }}
        onOk={() => shareForm && shareMutation.mutate(shareForm.id)}
        okButtonProps={{ loading: shareMutation.isPending }}
        okText="Copy link"
      >
        <Paragraph type="secondary">
          Generate an expiring public link so anyone can answer this form even
          without a system account.
        </Paragraph>

        <Flex vertical gap={10}>
          <Text strong>Link expiry in hours</Text>
          <InputNumber
            min={1}
            max={24 * 30}
            style={{ width: "100%" }}
            value={shareExpiresInHours}
            onChange={(value) => setShareExpiresInHours(Number(value || 72))}
          />
          <Text type="secondary">
            Example link:{" "}
            <Text code>{shareForm ? buildPublicFormUrl("...token...") : "-"}</Text>
          </Text>
        </Flex>
      </Modal>
    </div>
  );
};

export default CustomFormManager;
