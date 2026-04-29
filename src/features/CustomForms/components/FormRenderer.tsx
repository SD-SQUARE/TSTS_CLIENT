import { Alert, Button, Card, Checkbox, Form, Input, InputNumber, Radio, Select, Typography } from "antd";
import type { CustomFormField, CustomFormSettings } from "../types";
import "./customForms.css";

const { Paragraph, Text, Title } = Typography;

interface FormRendererProps {
  title: string;
  description?: string;
  fields?: CustomFormField[];
  settings?: CustomFormSettings;
  onSubmit?: (values: Record<string, unknown>) => void;
  submitting?: boolean;
  previewOnly?: boolean;
}

const renderFieldControl = (field: CustomFormField) => {
  if (field.type === "short_text" || field.type === "email") {
    return (
      <Input
        type={field.type === "email" ? "email" : "text"}
        placeholder={field.placeholder || "Your answer"}
      />
    );
  }

  if (field.type === "long_text") {
    return (
      <Input.TextArea
        rows={4}
        placeholder={field.placeholder || "Write your answer"}
      />
    );
  }

  if (field.type === "number") {
    return (
      <InputNumber
        style={{ width: "100%" }}
        placeholder={field.placeholder || "Enter a number"}
        min={field.settings?.min}
        max={field.settings?.max}
      />
    );
  }

  if (field.type === "date") {
    return <Input type="date" />;
  }

  if (field.type === "dropdown") {
    return (
      <Select
        placeholder="Select one option"
        options={field.options.map((option) => ({
          label: option.label,
          value: option.id,
        }))}
      />
    );
  }

  if (field.type === "single_choice") {
    return (
      <Radio.Group style={{ width: "100%" }}>
        {field.options.map((option) => (
          <Radio key={option.id} value={option.id}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    );
  }

  if (field.type === "multiple_choice") {
    return (
      <Checkbox.Group
        options={field.options.map((option) => ({
          label: option.label,
          value: option.id,
        }))}
      />
    );
  }

  return null;
};

const buildRules = (field: CustomFormField) => {
  const rules = [];

  if (field.required) {
    rules.push({
      validator: async (_: unknown, value: unknown) => {
        const emptyArray = Array.isArray(value) && value.length === 0;
        const emptyString = typeof value === "string" && value.trim().length === 0;

        if (value === undefined || value === null || emptyArray || emptyString) {
          throw new Error("This question is required.");
        }
      },
    });
  }

  if (field.type === "email") {
    rules.push({
      type: "email" as const,
      message: "Please enter a valid email address.",
    });
  }

  if (field.type === "multiple_choice" && field.settings?.minSelections) {
    rules.push({
      validator: async (_: unknown, value: unknown) => {
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          value.length < (field.settings?.minSelections || 0)
        ) {
          throw new Error(
            `Pick at least ${field.settings?.minSelections} options.`,
          );
        }
      },
    });
  }

  if (field.type === "multiple_choice" && field.settings?.maxSelections) {
    rules.push({
      validator: async (_: unknown, value: unknown) => {
        if (
          Array.isArray(value) &&
          value.length > (field.settings?.maxSelections || Infinity)
        ) {
          throw new Error(
            `Pick at most ${field.settings?.maxSelections} options.`,
          );
        }
      },
    });
  }

  return rules;
};

const FormRenderer = ({
  title,
  description,
  fields = [],
  settings,
  onSubmit,
  submitting,
  previewOnly,
}: FormRendererProps) => {
  const [form] = Form.useForm();
  const showSubmit = !previewOnly && typeof onSubmit === "function";

  return (
    <div className="custom-form-render-shell">
      <Card className="custom-form-render-hero" bodyStyle={{ padding: 28 }}>
        <Title level={2} style={{ marginBottom: 10 }}>
          {title}
        </Title>
        {description ? (
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {description}
          </Paragraph>
        ) : (
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Fill in the questions below and submit when you are ready.
          </Paragraph>
        )}
      </Card>

      {previewOnly && (
        <Alert
          type="info"
          showIcon
          message="Preview mode"
          description="This page shows how the form will look to responders. Submission is disabled here."
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onSubmit?.(values)}
      >
        {fields.map((field, index) => (
          <Card
            key={field.id}
            className="custom-form-render-field"
            bodyStyle={{ padding: 24 }}
            style={{ marginBottom: 16 }}
          >
            <Title level={4} style={{ marginBottom: 4 }}>
              {index + 1}. {field.label}
              {field.required ? (
                <Text type="danger" style={{ marginInlineStart: 6 }}>
                  *
                </Text>
              ) : null}
            </Title>

            {field.description ? (
              <Paragraph type="secondary">{field.description}</Paragraph>
            ) : null}

            <Form.Item
              name={field.id}
              rules={buildRules(field)}
              style={{ marginBottom: 0 }}
            >
              {renderFieldControl(field)}
            </Form.Item>
          </Card>
        ))}

        {showSubmit && (
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={submitting}
            style={{ minWidth: 180 }}
          >
            {settings?.submitLabel || "Submit"}
          </Button>
        )}
      </Form>
    </div>
  );
};

export default FormRenderer;
