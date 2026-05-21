import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DeleteOutlined,
  DragOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { v4 as uuid } from "uuid";
import type {
  CustomForm,
  CustomFormField,
  CustomFormFieldType,
  CustomFormPayload,
  CustomFormSettings,
} from "../types";
import { useTranslation } from "react-i18next";
import "./customForms.css";

const { Paragraph, Text, Title } = Typography;

type BuilderMode = "template" | "ticket";

interface FormBuilderProps {
  initialValues?: Partial<CustomForm> | null;
  onSave: (payload: CustomFormPayload) => void;
  loading?: boolean;
  mode?: BuilderMode;
  onCancel?: () => void;
}

const FIELD_LIBRARY: Array<{
  type: CustomFormFieldType;
  label: string;
  description: string;
}> = [
  {
    type: "short_text",
    label: "Short answer",
    description: "Single-line text for names, titles, and quick inputs.",
  },
  {
    type: "long_text",
    label: "Paragraph",
    description: "Longer responses for explanations and feedback.",
  },
  {
    type: "email",
    label: "Email",
    description: "Validated email field for contact details.",
  },
  {
    type: "number",
    label: "Number",
    description: "Numeric input with optional min and max rules.",
  },
  {
    type: "date",
    label: "Date",
    description: "Date selector for appointments or deadlines.",
  },
  {
    type: "dropdown",
    label: "Dropdown",
    description: "Compact list for single-select choices.",
  },
  {
    type: "single_choice",
    label: "Multiple choice",
    description: "Radio selection for one answer from many.",
  },
  {
    type: "multiple_choice",
    label: "Checkboxes",
    description: "Allow more than one answer in the same question.",
  },
];

const choiceFieldTypes = new Set<CustomFormFieldType>([
  "dropdown",
  "single_choice",
  "multiple_choice",
]);

const getFieldTypeLabel = (type: CustomFormFieldType, t: (key: string, options?: any) => string) => {
  const item = FIELD_LIBRARY.find((fieldType) => fieldType.type === type);
  return t(`customForms.fieldTypes.${type}.label`, { defaultValue: item?.label || type });
};

const getFieldTypeDescription = (type: CustomFormFieldType, t: (key: string, options?: any) => string) => {
  const item = FIELD_LIBRARY.find((fieldType) => fieldType.type === type);
  return t(`customForms.fieldTypes.${type}.description`, { defaultValue: item?.description || "" });
};

const createDefaultSettings = (): CustomFormSettings => ({
  submitLabel: "Submit",
  submitLabel_en: "Submit",
  submitLabel_ar: "إرسال",
  successTitle: "Response received",
  successTitle_en: "Response received",
  successTitle_ar: "تم استلام الرد",
  successDescription: "Thanks for filling out this form.",
  successDescription_en: "Thanks for filling out this form.",
  successDescription_ar: "شكرا لتعبئة هذا النموذج.",
});

const createOption = (label: string) => ({
  id: uuid(),
  label,
  label_en: label,
  label_ar: "",
});

const createField = (type: CustomFormFieldType): CustomFormField => {
  const choiceField = choiceFieldTypes.has(type);

  return {
    id: uuid(),
    type,
    label: "",
    label_en: "",
    label_ar: "",
    description: "",
    description_en: "",
    description_ar: "",
    placeholder:
      type === "date" || choiceField ? "" : "Add a helpful placeholder",
    placeholder_en:
      type === "date" || choiceField ? "" : "Add a helpful placeholder",
    placeholder_ar: "",
    required: false,
    options: choiceField ? [createOption("Option 1"), createOption("Option 2")] : [],
    settings: {},
  };
};

const normalizeField = (field: Partial<CustomFormField>, index: number): CustomFormField => {
  const safeType = (field.type || "short_text") as CustomFormFieldType;
  const supportsOptions = choiceFieldTypes.has(safeType);

  return {
    id: field.id || uuid(),
    type: safeType,
    label: field.label || "",
    label_en: field.label_en || field.label || "",
    label_ar: field.label_ar || field.label || "",
    description: field.description || "",
    description_en: field.description_en || field.description || "",
    description_ar: field.description_ar || field.description || "",
    placeholder: field.placeholder || "",
    placeholder_en: field.placeholder_en || field.placeholder || "",
    placeholder_ar: field.placeholder_ar || field.placeholder || "",
    required: Boolean(field.required),
    options: supportsOptions
      ? (field.options || []).map((option, optionIndex) => ({
          id: option.id || `${field.id || `field-${index + 1}`}-option-${optionIndex + 1}`,
          label: option.label || "",
          label_en: option.label_en || option.label || "",
          label_ar: option.label_ar || option.label || "",
        }))
      : [],
    settings: {
      min: field.settings?.min,
      max: field.settings?.max,
      minSelections: field.settings?.minSelections,
      maxSelections: field.settings?.maxSelections,
    },
  };
};

const SortableFieldCard = ({
  field,
  onUpdate,
  onDelete,
}: {
  field: CustomFormField;
  onUpdate: (fieldId: string, patch: Partial<CustomFormField>) => void;
  onDelete: (fieldId: string) => void;
}) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const supportsOptions = choiceFieldTypes.has(field.type);
  const displayLabel = field.label_en || field.label_ar || field.label;
  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      className="custom-form-builder__field"
      style={cardStyle}
      bodyStyle={{ padding: 20 }}
    >
      <div className="custom-form-builder__field-header">
        <div className="custom-form-builder__field-title">
          <Button
            {...attributes}
            {...listeners}
            className="custom-form-drag-handle"
            shape="circle"
            icon={<DragOutlined />}
          />
          <div>
            <Text strong>{displayLabel || t("customForms.untitledQuestion")}</Text>
            <div>
              <Text type="secondary">
                {getFieldTypeLabel(field.type, t)}
              </Text>
            </div>
          </div>
        </div>

        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => onDelete(field.id)}
        >
          {t("common.remove", { defaultValue: "Remove" })}
        </Button>
      </div>

      <Row gutter={[14, 14]}>
        <Col xs={24} md={7}>
          <Input
            placeholder={t("customForms.questionTitleEn")}
            value={field.label_en || ""}
            onChange={(event) =>
              onUpdate(field.id, {
                label_en: event.target.value,
                label: event.target.value || field.label_ar || "",
              })
            }
          />
        </Col>
        <Col xs={24} md={7}>
          <Input
            placeholder={t("customForms.questionTitleAr")}
            value={field.label_ar || ""}
            dir="rtl"
            onChange={(event) =>
              onUpdate(field.id, {
                label_ar: event.target.value,
                label: field.label_en || event.target.value || "",
              })
            }
          />
        </Col>
        <Col xs={24} md={10}>
          <Select
            style={{ width: "100%" }}
            value={field.type}
            onChange={(nextType) => {
              const template = createField(nextType);

              onUpdate(field.id, {
                type: nextType,
                placeholder: template.placeholder,
                options: template.options,
                settings: {
                  min: undefined,
                  max: undefined,
                  minSelections: undefined,
                  maxSelections: undefined,
                },
              });
            }}
            options={FIELD_LIBRARY.map((item) => ({
              value: item.type,
              label: getFieldTypeLabel(item.type, t),
            }))}
          />
        </Col>

        <Col span={24}>
          <Row gutter={[14, 14]}>
            <Col xs={24} md={12}>
              <Input.TextArea
                rows={2}
                placeholder={t("customForms.helperTextEn")}
                value={field.description_en || ""}
                onChange={(event) =>
                  onUpdate(field.id, {
                    description_en: event.target.value,
                    description: event.target.value || field.description_ar || "",
                  })
                }
              />
            </Col>
            <Col xs={24} md={12}>
              <Input.TextArea
                rows={2}
                placeholder={t("customForms.helperTextAr")}
                value={field.description_ar || ""}
                dir="rtl"
                onChange={(event) =>
                  onUpdate(field.id, {
                    description_ar: event.target.value,
                    description: field.description_en || event.target.value || "",
                  })
                }
              />
            </Col>
          </Row>
        </Col>

        {!supportsOptions && field.type !== "date" && (
          <Col span={24}>
            <Row gutter={[14, 14]}>
              <Col xs={24} md={12}>
                <Input
                  placeholder={t("customForms.placeholderEn")}
                  value={field.placeholder_en || ""}
                  onChange={(event) =>
                    onUpdate(field.id, {
                      placeholder_en: event.target.value,
                      placeholder: event.target.value || field.placeholder_ar || "",
                    })
                  }
                />
              </Col>
              <Col xs={24} md={12}>
                <Input
                  placeholder={t("customForms.placeholderAr")}
                  value={field.placeholder_ar || ""}
                  dir="rtl"
                  onChange={(event) =>
                    onUpdate(field.id, {
                      placeholder_ar: event.target.value,
                      placeholder: field.placeholder_en || event.target.value || "",
                    })
                  }
                />
              </Col>
            </Row>
          </Col>
        )}

        {field.type === "number" && (
          <>
            <Col xs={24} md={12}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder={t("customForms.minValue")}
                value={field.settings?.min}
                onChange={(value) =>
                  onUpdate(field.id, {
                    settings: {
                      ...field.settings,
                      min: value === null ? undefined : Number(value),
                    },
                  })
                }
              />
            </Col>
            <Col xs={24} md={12}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder={t("customForms.maxValue")}
                value={field.settings?.max}
                onChange={(value) =>
                  onUpdate(field.id, {
                    settings: {
                      ...field.settings,
                      max: value === null ? undefined : Number(value),
                    },
                  })
                }
              />
            </Col>
          </>
        )}

        {supportsOptions && (
          <Col span={24}>
            <Flex vertical gap={8}>
              {field.options.map((option) => (
                <div
                  key={option.id}
                  className="custom-form-builder__option-row"
                >
                  <Input
                    placeholder={t("customForms.optionLabelEn")}
                    value={option.label_en || ""}
                    onChange={(event) =>
                      onUpdate(field.id, {
                        options: field.options.map((item) =>
                          item.id === option.id
                            ? {
                                ...item,
                                label_en: event.target.value,
                                label: event.target.value || item.label_ar || "",
                              }
                            : item,
                        ),
                      })
                    }
                  />
                  <Input
                    placeholder={t("customForms.optionLabelAr")}
                    value={option.label_ar || ""}
                    dir="rtl"
                    onChange={(event) =>
                      onUpdate(field.id, {
                        options: field.options.map((item) =>
                          item.id === option.id
                            ? {
                                ...item,
                                label_ar: event.target.value,
                                label: item.label_en || event.target.value || "",
                              }
                            : item,
                        ),
                      })
                    }
                  />
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      onUpdate(field.id, {
                        options: field.options.filter(
                          (item) => item.id !== option.id,
                        ),
                      })
                    }
                  />
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() =>
                  onUpdate(field.id, {
                    options: [
                      ...field.options,
                      createOption(`Option ${field.options.length + 1}`),
                    ],
                  })
                }
              >
                {t("customForms.addOption")}
              </Button>
            </Flex>
          </Col>
        )}

        {field.type === "multiple_choice" && (
          <>
            <Col xs={24} md={12}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder={t("customForms.minSelectionsPlaceholder")}
                value={field.settings?.minSelections}
                onChange={(value) =>
                  onUpdate(field.id, {
                    settings: {
                      ...field.settings,
                      minSelections:
                        value === null ? undefined : Number(value),
                    },
                  })
                }
              />
            </Col>
            <Col xs={24} md={12}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder={t("customForms.maxSelectionsPlaceholder")}
                value={field.settings?.maxSelections}
                onChange={(value) =>
                  onUpdate(field.id, {
                    settings: {
                      ...field.settings,
                      maxSelections:
                        value === null ? undefined : Number(value),
                    },
                  })
                }
              />
            </Col>
          </>
        )}

        <Col span={24}>
          <Flex align="center" justify="space-between">
            <div>
              <Text strong>{t("customForms.requiredQuestion")}</Text>
              <div>
                <Text type="secondary">
                  {t("customForms.requiredQuestionDesc")}
                </Text>
              </div>
            </div>
            <Switch
              checked={field.required}
              onChange={(checked) => onUpdate(field.id, { required: checked })}
            />
          </Flex>
        </Col>
      </Row>
    </Card>
  );
};

const FormBuilder = ({
  initialValues,
  onSave,
  loading,
  mode = "template",
  onCancel,
}: FormBuilderProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [fields, setFields] = useState<CustomFormField[]>([]);
  const [settings, setSettings] = useState<CustomFormSettings>(
    createDefaultSettings(),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  useEffect(() => {
    const nextTitleEn = initialValues?.title_en || initialValues?.title || "";
    const nextTitleAr = initialValues?.title_ar || initialValues?.title || "";
    const nextDescriptionEn =
      initialValues?.description_en || initialValues?.description || "";
    const nextDescriptionAr =
      initialValues?.description_ar || initialValues?.description || "";

    setTitle(nextTitleEn || nextTitleAr);
    setTitleEn(nextTitleEn);
    setTitleAr(nextTitleAr);
    setDescription(nextDescriptionEn || nextDescriptionAr);
    setDescriptionEn(nextDescriptionEn);
    setDescriptionAr(nextDescriptionAr);
    setFields(
      (initialValues?.fields || []).map((field, index) =>
        normalizeField(field, index),
      ),
    );
    setSettings({
      ...createDefaultSettings(),
      ...(initialValues?.settings || {}),
    });
  }, [initialValues]);

  const summaryText = useMemo(() => {
    return t("customForms.builderSummary", {
      count: fields.length,
      type: mode === "ticket" ? t("customForms.ticketForm") : t("customForms.template"),
    });
  }, [fields.length, mode, t]);

  const updateField = (fieldId: string, patch: Partial<CustomFormField>) => {
    setFields((currentFields) =>
      currentFields.map((field) => {
        if (field.id !== fieldId) return field;

        const nextFieldType = patch.type || field.type;
        const supportsOptions = choiceFieldTypes.has(nextFieldType);

        return {
          ...field,
          ...patch,
          type: nextFieldType,
          options: supportsOptions
            ? patch.options || field.options || []
            : [],
          settings: {
            ...field.settings,
            ...patch.settings,
          },
        };
      }),
    );
  };

  const deleteField = (fieldId: string) => {
    setFields((currentFields) =>
      currentFields.filter((field) => field.id !== fieldId),
    );
  };

  const addField = (type: CustomFormFieldType) => {
    setFields((currentFields) => [...currentFields, createField(type)]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFields((currentFields) => {
      const oldIndex = currentFields.findIndex((field) => field.id === active.id);
      const newIndex = currentFields.findIndex((field) => field.id === over.id);
      return arrayMove(currentFields, oldIndex, newIndex);
    });
  };

  const handleSave = () => {
    const finalTitleEn = titleEn.trim();
    const finalTitleAr = titleAr.trim();
    const finalDescriptionEn = descriptionEn.trim();
    const finalDescriptionAr = descriptionAr.trim();

    if (!finalTitleEn && !finalTitleAr && !title.trim()) {
      message.error(t("customForms.titleRequired"));
      return;
    }

    if (!fields.length) {
      message.error(t("customForms.questionRequiredBeforeSave"));
      return;
    }

    const hasInvalidField = fields.some((field) => {
      if (!(field.label_en || field.label_ar || field.label).trim()) return true;

      if (choiceFieldTypes.has(field.type)) {
        const filledOptions = field.options.filter((option) =>
          (option.label_en || option.label_ar || option.label).trim(),
        );
        return filledOptions.length < 2;
      }

      return false;
    });

    if (hasInvalidField) {
      message.error(
        t("customForms.invalidQuestions"),
      );
      return;
    }

    const payload: CustomFormPayload = {
      title: finalTitleEn || finalTitleAr || title.trim(),
      title_en: finalTitleEn || finalTitleAr,
      title_ar: finalTitleAr || finalTitleEn,
      description: finalDescriptionEn || finalDescriptionAr || description.trim(),
      description_en: finalDescriptionEn,
      description_ar: finalDescriptionAr,
      fields: fields.map((field) => ({
        ...field,
        label: (field.label_en || field.label_ar || field.label).trim(),
        label_en: (field.label_en || field.label_ar || field.label).trim(),
        label_ar: (field.label_ar || field.label_en || field.label).trim(),
        description: (field.description_en || field.description_ar || field.description || "").trim(),
        description_en: field.description_en?.trim() || "",
        description_ar: field.description_ar?.trim() || "",
        placeholder: (field.placeholder_en || field.placeholder_ar || field.placeholder || "").trim(),
        placeholder_en: field.placeholder_en?.trim() || "",
        placeholder_ar: field.placeholder_ar?.trim() || "",
        options: choiceFieldTypes.has(field.type)
          ? field.options
              .filter((option) =>
                (option.label_en || option.label_ar || option.label).trim(),
              )
              .map((option) => ({
                ...option,
                label: (option.label_en || option.label_ar || option.label).trim(),
                label_en: (option.label_en || option.label_ar || option.label).trim(),
                label_ar: (option.label_ar || option.label_en || option.label).trim(),
              }))
          : [],
      })),
      settings: {
        submitLabel:
          settings.submitLabel_en?.trim() ||
          settings.submitLabel_ar?.trim() ||
          settings.submitLabel?.trim() ||
          "Submit",
        submitLabel_en: settings.submitLabel_en?.trim() || "Submit",
        submitLabel_ar: settings.submitLabel_ar?.trim() || "إرسال",
        successTitle:
          settings.successTitle_en?.trim() ||
          settings.successTitle_ar?.trim() ||
          settings.successTitle?.trim() ||
          "Response received",
        successTitle_en: settings.successTitle_en?.trim() || "Response received",
        successTitle_ar: settings.successTitle_ar?.trim() || "تم استلام الرد",
        successDescription:
          settings.successDescription_en?.trim() ||
          settings.successDescription_ar?.trim() ||
          settings.successDescription?.trim() ||
          "Thanks for filling out this form.",
        successDescription_en:
          settings.successDescription_en?.trim() ||
          "Thanks for filling out this form.",
        successDescription_ar:
          settings.successDescription_ar?.trim() ||
          "شكرا لتعبئة هذا النموذج.",
      },
    };

    onSave(payload);
  };

  return (
    <div className="custom-form-builder">
      <Card className="custom-form-builder__panel">
        <Flex vertical gap={10}>
          <Tag color={mode === "ticket" ? "gold" : "blue"} bordered={false}>
            {mode === "ticket" ? t("customForms.ticketForm") : t("customForms.reusableTemplate")}
          </Tag>
          <Title level={3} style={{ margin: 0 }}>
            {mode === "ticket" ? t("customForms.designTicketForm") : t("customForms.buildReusableForm")}
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t("customForms.builderIntro")}
          </Paragraph>
        </Flex>

        <Row gutter={[14, 14]} style={{ marginTop: 18 }}>
          <Col xs={24} md={7}>
            <Input
              size="large"
              placeholder={t("customForms.formTitleEn")}
              value={titleEn}
              onChange={(event) => {
                setTitleEn(event.target.value);
                setTitle(event.target.value || titleAr);
              }}
            />
          </Col>
          <Col xs={24} md={7}>
            <Input
              size="large"
              placeholder={t("customForms.formTitleAr")}
              value={titleAr}
              dir="rtl"
              onChange={(event) => {
                setTitleAr(event.target.value);
                setTitle(titleEn || event.target.value);
              }}
            />
          </Col>
          <Col xs={24} md={10}>
            <Card size="small" className="custom-form-summary-card">
              <Text type="secondary">{summaryText}</Text>
            </Card>
          </Col>
          <Col span={24}>
            <Row gutter={[14, 14]}>
              <Col xs={24} md={12}>
                <Input.TextArea
                  rows={4}
                  placeholder={t("customForms.formDescriptionEn")}
                  value={descriptionEn}
                  onChange={(event) => {
                    setDescriptionEn(event.target.value);
                    setDescription(event.target.value || descriptionAr);
                  }}
                />
              </Col>
              <Col xs={24} md={12}>
                <Input.TextArea
                  rows={4}
                  placeholder={t("customForms.formDescriptionAr")}
                  value={descriptionAr}
                  dir="rtl"
                  onChange={(event) => {
                    setDescriptionAr(event.target.value);
                    setDescription(descriptionEn || event.target.value);
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Card className="custom-form-builder__panel">
        <Flex vertical gap={14}>
          <div>
            <Title level={4} style={{ marginBottom: 6 }}>
              {t("customForms.questionLibrary")}
            </Title>
            <Text type="secondary">
              {t("customForms.questionLibraryDesc")}
            </Text>
          </div>

          <div className="custom-form-builder__palette">
            {FIELD_LIBRARY.map((item) => (
              <Button
                key={item.type}
                className="custom-form-builder__chip"
                type="default"
                onClick={() => addField(item.type)}
              >
                <Flex vertical align="flex-start" gap={2}>
                  <Text strong>{getFieldTypeLabel(item.type, t)}</Text>
                  <Text type="secondary">{getFieldTypeDescription(item.type, t)}</Text>
                </Flex>
              </Button>
            ))}
          </div>
        </Flex>
      </Card>

      <Card className="custom-form-builder__panel">
        <Flex vertical gap={14}>
          <div>
            <Title level={4} style={{ marginBottom: 6 }}>
              {t("customForms.submissionExperience")}
            </Title>
            <Text type="secondary">
              {t("customForms.submissionExperienceDesc")}
            </Text>
          </div>

          <Row gutter={[14, 14]}>
            <Col xs={24} md={12}>
              <Input
                placeholder={t("customForms.submitLabelEn")}
                value={settings.submitLabel_en}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    submitLabel_en: event.target.value,
                    submitLabel: event.target.value || current.submitLabel_ar || "",
                  }))
                }
              />
            </Col>
            <Col xs={24} md={12}>
              <Input
                placeholder={t("customForms.submitLabelAr")}
                value={settings.submitLabel_ar}
                dir="rtl"
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    submitLabel_ar: event.target.value,
                    submitLabel: current.submitLabel_en || event.target.value || "",
                  }))
                }
              />
            </Col>
            <Col xs={24} md={12}>
              <Input
                placeholder={t("customForms.successTitleEn")}
                value={settings.successTitle_en}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    successTitle_en: event.target.value,
                    successTitle: event.target.value || current.successTitle_ar || "",
                  }))
                }
              />
            </Col>
            <Col xs={24} md={12}>
              <Input
                placeholder={t("customForms.successTitleAr")}
                value={settings.successTitle_ar}
                dir="rtl"
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    successTitle_ar: event.target.value,
                    successTitle: current.successTitle_en || event.target.value || "",
                  }))
                }
              />
            </Col>
            <Col xs={24} md={12}>
              <Input
                placeholder={t("customForms.successMessageEn")}
                value={settings.successDescription_en}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    successDescription_en: event.target.value,
                    successDescription:
                      event.target.value || current.successDescription_ar || "",
                  }))
                }
              />
            </Col>
            <Col xs={24} md={12}>
              <Input
                placeholder={t("customForms.successMessageAr")}
                value={settings.successDescription_ar}
                dir="rtl"
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    successDescription_ar: event.target.value,
                    successDescription:
                      current.successDescription_en || event.target.value || "",
                  }))
                }
              />
            </Col>
          </Row>
        </Flex>
      </Card>

      <div>
        <Title level={4} style={{ marginBottom: 12 }}>
          {t("customForms.questions")}
        </Title>

        {!fields.length ? (
          <Card className="custom-form-builder__panel">
            <Empty
              description={t("customForms.emptyBuilder")}
            />
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <Flex vertical gap={14}>
                {fields.map((field) => (
                  <SortableFieldCard
                    key={field.id}
                    field={field}
                    onUpdate={updateField}
                    onDelete={deleteField}
                  />
                ))}
              </Flex>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="custom-form-builder__footer">
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Text type="secondary">
            {mode === "ticket"
              ? t("customForms.attachedToTicket")
              : t("customForms.templatesReusable")}
          </Text>

          <Space wrap>
            {onCancel && <Button onClick={onCancel}>{t("common.cancel", { defaultValue: "Cancel" })}</Button>}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={handleSave}
            >
              {t("customForms.saveForm")}
            </Button>
          </Space>
        </Flex>
      </div>
    </div>
  );
};

export default FormBuilder;
