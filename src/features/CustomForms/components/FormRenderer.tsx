import { Alert, Button, Card, Checkbox, Form, Input, InputNumber, Radio, Select, Typography } from "antd";
import type { CustomFormField, CustomFormSettings } from "../types";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import "./customForms.css";

const { Paragraph, Text, Title } = Typography;

interface FormRendererProps {
  title: string;
  title_en?: string;
  title_ar?: string;
  description?: string;
  description_en?: string;
  description_ar?: string;
  fields?: CustomFormField[];
  settings?: CustomFormSettings;
  onSubmit?: (values: Record<string, unknown>) => void;
  submitting?: boolean;
  previewOnly?: boolean;
}

const getLocalizedValue = (
  language: string,
  en?: string | null,
  ar?: string | null,
  fallback?: string | null,
) => {
  if (language.startsWith("ar")) {
    return ar || en || fallback || "";
  }

  return en || ar || fallback || "";
};

const renderFieldControl = (field: CustomFormField, language: string, t: TFunction) => {
  const placeholder = getLocalizedValue(
    language,
    field.placeholder_en,
    field.placeholder_ar,
    field.placeholder,
  );

  if (field.type === "short_text" || field.type === "email") {
    return (
        <Input
        type={field.type === "email" ? "email" : "text"}
        placeholder={placeholder || t("customForms.yourAnswer")}
      />
    );
  }

  if (field.type === "long_text") {
    return (
      <Input.TextArea
        rows={4}
        placeholder={placeholder || t("customForms.writeAnswer")}
      />
    );
  }

  if (field.type === "number") {
    return (
      <InputNumber
        style={{ width: "100%" }}
        placeholder={placeholder || t("customForms.enterNumber")}
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
        placeholder={t("customForms.selectOneOption")}
        options={field.options.map((option) => ({
          label: getLocalizedValue(language, option.label_en, option.label_ar, option.label),
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
            {getLocalizedValue(language, option.label_en, option.label_ar, option.label)}
          </Radio>
        ))}
      </Radio.Group>
    );
  }

  if (field.type === "multiple_choice") {
    return (
      <Checkbox.Group
        options={field.options.map((option) => ({
          label: getLocalizedValue(language, option.label_en, option.label_ar, option.label),
          value: option.id,
        }))}
      />
    );
  }

  return null;
};

const buildRules = (field: CustomFormField, language: string, t: TFunction) => {
  const rules = [];
  const fieldLabel = getLocalizedValue(language, field.label_en, field.label_ar, field.label);

  if (field.required) {
    rules.push({
      validator: async (_: unknown, value: unknown) => {
        const emptyArray = Array.isArray(value) && value.length === 0;
        const emptyString = typeof value === "string" && value.trim().length === 0;

        if (value === undefined || value === null || emptyArray || emptyString) {
          throw new Error(t("customForms.questionRequired", { field: fieldLabel || t("customForms.thisQuestion") }));
        }
      },
    });
  }

  if (field.type === "email") {
    rules.push({
      type: "email" as const,
      message: t("customForms.validEmail"),
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
            t("customForms.minSelections", { count: field.settings?.minSelections }),
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
            t("customForms.maxSelections", { count: field.settings?.maxSelections }),
          );
        }
      },
    });
  }

  return rules;
};

const FormRenderer = ({
  title,
  title_en,
  title_ar,
  description,
  description_en,
  description_ar,
  fields = [],
  settings,
  onSubmit,
  submitting,
  previewOnly,
}: FormRendererProps) => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const showSubmit = !previewOnly && typeof onSubmit === "function";
  const localizedTitle = getLocalizedValue(i18n.language, title_en, title_ar, title);
  const localizedDescription = getLocalizedValue(
    i18n.language,
    description_en,
    description_ar,
    description,
  );
  const localizedSubmitLabel = getLocalizedValue(
    i18n.language,
    settings?.submitLabel_en,
    settings?.submitLabel_ar,
    settings?.submitLabel,
  );

  return (
    <div className="custom-form-render-shell" dir={i18n.language.startsWith("ar") ? "rtl" : "ltr"}>
      <Card className="custom-form-render-hero" bodyStyle={{ padding: 28 }}>
        <Title level={2} style={{ marginBottom: 10 }}>
          {localizedTitle}
        </Title>
        {localizedDescription ? (
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {localizedDescription}
          </Paragraph>
        ) : (
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t("customForms.defaultPublicDescription")}
          </Paragraph>
        )}
      </Card>

      {previewOnly && (
        <Alert
          type="info"
          showIcon
          message={t("customForms.previewMode")}
          description={t("customForms.previewModeDesc")}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onSubmit?.(values)}
      >
        {fields.map((field, index) => (
          (() => {
            const fieldLabel = getLocalizedValue(
              i18n.language,
              field.label_en,
              field.label_ar,
              field.label,
            );
            const fieldDescription = getLocalizedValue(
              i18n.language,
              field.description_en,
              field.description_ar,
              field.description,
            );

            return (
          <Card
            key={field.id}
            className="custom-form-render-field"
            bodyStyle={{ padding: 24 }}
            style={{ marginBottom: 16 }}
          >
            <Title level={4} style={{ marginBottom: 4 }}>
              {index + 1}. {fieldLabel}
              {field.required ? (
                <Text type="danger" style={{ marginInlineStart: 6 }}>
                  *
                </Text>
              ) : null}
            </Title>

            {fieldDescription ? (
              <Paragraph type="secondary">{fieldDescription}</Paragraph>
            ) : null}

            <Form.Item
              name={field.id}
              rules={buildRules(field, i18n.language, t)}
              style={{ marginBottom: 0 }}
            >
              {renderFieldControl(field, i18n.language, t)}
            </Form.Item>
          </Card>
            );
          })()
        ))}

        {showSubmit && (
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={submitting}
            style={{ minWidth: 180 }}
          >
            {localizedSubmitLabel || t("customForms.submit")}
          </Button>
        )}
      </Form>
    </div>
  );
};

export default FormRenderer;
