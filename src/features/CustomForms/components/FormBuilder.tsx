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

const createDefaultSettings = (): CustomFormSettings => ({
  submitLabel: "Submit",
  successTitle: "Response received",
  successDescription: "Thanks for filling out this form.",
});

const createOption = (label: string) => ({
  id: uuid(),
  label,
});

const createField = (type: CustomFormFieldType): CustomFormField => {
  const choiceField = choiceFieldTypes.has(type);

  return {
    id: uuid(),
    type,
    label: "",
    description: "",
    placeholder:
      type === "date" || choiceField ? "" : "Add a helpful placeholder",
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
    description: field.description || "",
    placeholder: field.placeholder || "",
    required: Boolean(field.required),
    options: supportsOptions
      ? (field.options || []).map((option, optionIndex) => ({
          id: option.id || `${field.id || `field-${index + 1}`}-option-${optionIndex + 1}`,
          label: option.label || "",
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const supportsOptions = choiceFieldTypes.has(field.type);
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
            <Text strong>{field.label || "Untitled question"}</Text>
            <div>
              <Text type="secondary">
                {FIELD_LIBRARY.find((item) => item.type === field.type)?.label}
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
          Remove
        </Button>
      </div>

      <Row gutter={[14, 14]}>
        <Col xs={24} md={14}>
          <Input
            placeholder="Question title"
            value={field.label}
            onChange={(event) =>
              onUpdate(field.id, { label: event.target.value })
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
              label: item.label,
            }))}
          />
        </Col>

        <Col span={24}>
          <Input.TextArea
            rows={2}
            placeholder="Helper text or instructions (optional)"
            value={field.description || ""}
            onChange={(event) =>
              onUpdate(field.id, { description: event.target.value })
            }
          />
        </Col>

        {!supportsOptions && field.type !== "date" && (
          <Col span={24}>
            <Input
              placeholder="Placeholder (optional)"
              value={field.placeholder || ""}
              onChange={(event) =>
                onUpdate(field.id, { placeholder: event.target.value })
              }
            />
          </Col>
        )}

        {field.type === "number" && (
          <>
            <Col xs={24} md={12}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Minimum value"
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
                placeholder="Maximum value"
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
                    placeholder="Option label"
                    value={option.label}
                    onChange={(event) =>
                      onUpdate(field.id, {
                        options: field.options.map((item) =>
                          item.id === option.id
                            ? { ...item, label: event.target.value }
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
                Add option
              </Button>
            </Flex>
          </Col>
        )}

        {field.type === "multiple_choice" && (
          <>
            <Col xs={24} md={12}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Min selections"
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
                placeholder="Max selections"
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
              <Text strong>Required question</Text>
              <div>
                <Text type="secondary">
                  Prevent submission until this question is answered.
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
    setTitle(initialValues?.title || "");
    setDescription(initialValues?.description || "");
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
    const typeLabel = mode === "ticket" ? "ticket form" : "template";
    return `${fields.length} questions in this ${typeLabel}`;
  }, [fields.length, mode]);

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
    if (!title.trim()) {
      message.error("Please add a title for the form.");
      return;
    }

    if (!fields.length) {
      message.error("Add at least one question before saving.");
      return;
    }

    const hasInvalidField = fields.some((field) => {
      if (!field.label.trim()) return true;

      if (choiceFieldTypes.has(field.type)) {
        const filledOptions = field.options.filter((option) => option.label.trim());
        return filledOptions.length < 2;
      }

      return false;
    });

    if (hasInvalidField) {
      message.error(
        "Each question needs a title, and choice questions need at least two options.",
      );
      return;
    }

    const payload: CustomFormPayload = {
      title: title.trim(),
      description: description.trim(),
      fields: fields.map((field) => ({
        ...field,
        label: field.label.trim(),
        description: field.description?.trim() || "",
        placeholder: field.placeholder?.trim() || "",
        options: choiceFieldTypes.has(field.type)
          ? field.options
              .filter((option) => option.label.trim())
              .map((option) => ({
                ...option,
                label: option.label.trim(),
              }))
          : [],
      })),
      settings: {
        submitLabel: settings.submitLabel?.trim() || "Submit",
        successTitle: settings.successTitle?.trim() || "Response received",
        successDescription:
          settings.successDescription?.trim() || "Thanks for filling out this form.",
      },
    };

    onSave(payload);
  };

  return (
    <div className="custom-form-builder">
      <Card className="custom-form-builder__panel">
        <Flex vertical gap={10}>
          <Tag color={mode === "ticket" ? "gold" : "blue"} bordered={false}>
            {mode === "ticket" ? "Ticket form" : "Reusable template"}
          </Tag>
          <Title level={3} style={{ margin: 0 }}>
            {mode === "ticket" ? "Design a ticket form" : "Build a reusable form"}
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Create polished forms with drag-to-reorder questions, flexible field
            types, and branded success messaging.
          </Paragraph>
        </Flex>

        <Row gutter={[14, 14]} style={{ marginTop: 18 }}>
          <Col xs={24} md={14}>
            <Input
              size="large"
              placeholder="Form title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Col>
          <Col xs={24} md={10}>
            <Card size="small" className="custom-form-summary-card">
              <Text type="secondary">{summaryText}</Text>
            </Card>
          </Col>
          <Col span={24}>
            <Input.TextArea
              rows={4}
              placeholder="Describe what this form is for and how it should be used"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Col>
        </Row>
      </Card>

      <Card className="custom-form-builder__panel">
        <Flex vertical gap={14}>
          <div>
            <Title level={4} style={{ marginBottom: 6 }}>
              Question library
            </Title>
            <Text type="secondary">
              Drop in advanced fields, then shape the experience with labels,
              validation, and instructions.
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
                  <Text strong>{item.label}</Text>
                  <Text type="secondary">{item.description}</Text>
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
              Submission experience
            </Title>
            <Text type="secondary">
              Tune the CTA and the confirmation message users see after
              submitting the form.
            </Text>
          </div>

          <Row gutter={[14, 14]}>
            <Col xs={24} md={8}>
              <Input
                placeholder="Submit button text"
                value={settings.submitLabel}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    submitLabel: event.target.value,
                  }))
                }
              />
            </Col>
            <Col xs={24} md={8}>
              <Input
                placeholder="Success title"
                value={settings.successTitle}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    successTitle: event.target.value,
                  }))
                }
              />
            </Col>
            <Col xs={24} md={8}>
              <Input
                placeholder="Success message"
                value={settings.successDescription}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    successDescription: event.target.value,
                  }))
                }
              />
            </Col>
          </Row>
        </Flex>
      </Card>

      <div>
        <Title level={4} style={{ marginBottom: 12 }}>
          Questions
        </Title>

        {!fields.length ? (
          <Card className="custom-form-builder__panel">
            <Empty
              description="Start with a field from the library above, then drag questions into the order you want."
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
              ? "This form will be attached to the current ticket."
              : "Templates can be reused later inside tickets."}
          </Text>

          <Space wrap>
            {onCancel && <Button onClick={onCancel}>Cancel</Button>}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={handleSave}
            >
              Save form
            </Button>
          </Space>
        </Flex>
      </div>
    </div>
  );
};

export default FormBuilder;
