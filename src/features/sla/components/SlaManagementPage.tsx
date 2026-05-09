import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  InputNumber,
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
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAllDomains, useUniversities } from "../../Users/Hooks/useUsers";
import { useSpecializations, useTicketProblems } from "../../tickets/Hooks/useTicketForm";
import { slaApi, type SlaRule, type SlaRulePayload } from "../services/slaApi";
import { getErrorMessage } from "../../../utils/error";

const queryKey = ["sla-rules"] as const;

const SlaManagementPage = () => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm<SlaRulePayload>();
  const queryClient = useQueryClient();
  const [editingRule, setEditingRule] = useState<SlaRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: rules = [], isLoading } = useQuery({
    queryKey,
    queryFn: slaApi.getAll,
  });
  const { data: universities = [] } = useUniversities();
  const { data: domains = [] } = useAllDomains();
  const { data: specializations = [] } = useSpecializations();
  const { data: groupedProblems } = useTicketProblems();

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: slaApi.create,
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SlaRulePayload }) =>
      slaApi.update(id, payload),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: slaApi.delete,
    onSuccess: invalidate,
  });

  const isArabic = i18n.language.startsWith("ar");

  const labelOf = (item: any) =>
    (isArabic ? item?.name_ar || item?.name?.ar : item?.name_en || item?.name?.en) ||
    item?.displayName ||
    item?.name ||
    "";

  const problemOptions = useMemo(() => {
    const specs = groupedProblems?.specializations ?? [];
    return specs.flatMap((spec: any) =>
      (spec.problems ?? []).map((problem: any) => ({
        value: problem.id,
        label: `${labelOf(spec)} / ${labelOf(problem)}`,
      })),
    );
  }, [groupedProblems, i18n.language]);

  const normalizePayload = (values: SlaRulePayload): SlaRulePayload => ({
    ...values,
    university: values.university || null,
    domain: values.domain || null,
    specialization: values.specialization || null,
    problem: values.problem || null,
    isActive: values.isActive !== false,
  });

  const openModal = (rule?: SlaRule) => {
    setEditingRule(rule ?? null);
    form.setFieldsValue(
      rule
        ? {
            name_en: rule.name_en,
            name_ar: rule.name_ar,
            maxHours: rule.maxHours,
            isActive: rule.isActive,
            university: rule.university?.id ?? null,
            domain: rule.domain?.id ?? null,
            specialization: rule.specialization?.id ?? null,
            problem: rule.problem?.id ?? null,
          }
        : {
            maxHours: 24,
            isActive: true,
            university: null,
            domain: null,
            specialization: null,
            problem: null,
          },
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = normalizePayload(await form.validateFields());
      if (editingRule) {
        await updateMutation.mutateAsync({ id: editingRule.id, payload: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      message.success(t("sla.saved"));
      closeModal();
    } catch (error) {
      message.error(getErrorMessage(error, t("errors.submitFailed")));
    }
  };

  const renderScope = (value?: { name: string } | null) =>
    value ? <Tag color="blue">{value.name}</Tag> : <Tag>{t("sla.wildcard")}</Tag>;

  const columns: ColumnsType<SlaRule> = [
    {
      title: t("sla.ruleName"),
      key: "name",
      render: (_, record) => record.name || record.name_en || record.name_ar || "-",
    },
    {
      title: t("sla.scope"),
      key: "scope",
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          {renderScope(record.university)}
          {renderScope(record.domain)}
          {renderScope(record.specialization)}
          {renderScope(record.problem)}
        </Space>
      ),
    },
    {
      title: t("sla.maxHours"),
      dataIndex: "maxHours",
      key: "maxHours",
      width: 120,
    },
    {
      title: t("user_list.status"),
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "default"}>
          {isActive ? t("sla.active") : t("sla.inactive")}
        </Tag>
      ),
    },
    {
      title: t("user_list.operations"),
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm
            title={t("sla.deleteConfirm")}
            okText={t("translation.yes")}
            cancelText={t("translation.no")}
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} loading={deleteMutation.isPending} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          {t("sla.title")}
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          {t("sla.addRule")}
        </Button>
      </Flex>

      <Card>
        <Table rowKey="id" columns={columns} dataSource={rules} loading={isLoading} />
      </Card>

      <Modal
        title={editingRule ? t("sla.editRule") : t("sla.addRule")}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={t("common.save")}
        width={760}
      >
        <Form form={form} layout="vertical">
          <Flex gap={12} wrap="wrap">
            <Form.Item
              name="name_en"
              label={t("name_en")}
              rules={[{ required: true, message: t("required") }]}
              style={{ flex: "1 1 260px" }}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="name_ar"
              label={t("name_ar")}
              rules={[{ required: true, message: t("required") }]}
              style={{ flex: "1 1 260px" }}
            >
              <Input dir="rtl" />
            </Form.Item>
          </Flex>

          <Flex gap={12} wrap="wrap">
            <Form.Item name="university" label={t("user_list.university")} style={{ flex: "1 1 260px" }}>
              <Select
                allowClear
                placeholder={t("sla.wildcard")}
                options={universities.map((item: any) => ({ value: item.id, label: labelOf(item) }))}
              />
            </Form.Item>
            <Form.Item name="domain" label={t("user_list.domain")} style={{ flex: "1 1 260px" }}>
              <Select
                allowClear
                placeholder={t("sla.wildcard")}
                options={domains.map((item: any) => ({ value: item.id, label: labelOf(item) }))}
              />
            </Form.Item>
            <Form.Item name="specialization" label={t("tickets.specialization")} style={{ flex: "1 1 260px" }}>
              <Select
                allowClear
                placeholder={t("sla.wildcard")}
                options={specializations.map((item: any) => ({ value: item.id, label: labelOf(item) }))}
              />
            </Form.Item>
            <Form.Item name="problem" label={t("tickets.problemType")} style={{ flex: "1 1 260px" }}>
              <Select allowClear showSearch placeholder={t("sla.wildcard")} options={problemOptions} />
            </Form.Item>
          </Flex>

          <Flex gap={12} align="center" wrap="wrap">
            <Form.Item
              name="maxHours"
              label={t("sla.maxHours")}
              rules={[{ required: true, message: t("required") }]}
              style={{ flex: "1 1 220px" }}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="isActive" label={t("sla.active")} valuePropName="checked">
              <Switch />
            </Form.Item>
          </Flex>
        </Form>
      </Modal>
    </div>
  );
};

export default SlaManagementPage;
